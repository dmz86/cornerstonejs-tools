"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix");
const enums_1 = require("../../enums");
const core_1 = require("@cornerstonejs/core");
const base_1 = require("../base");
const throttle_1 = __importDefault(require("../../utilities/throttle"));
const annotationState_1 = require("../../stateManagement/annotation/annotationState");
const annotationLocking_1 = require("../../stateManagement/annotation/annotationLocking");
const lineSegment = __importStar(require("../../utilities/math/line"));
const angleBetweenLines_1 = __importDefault(require("../../utilities/math/angle/angleBetweenLines"));
const midPoint_1 = require("../../utilities/math/midPoint");
const drawingSvg_1 = require("../../drawingSvg");
const store_1 = require("../../store");
const viewportFilters_1 = require("../../utilities/viewportFilters");
const drawing_1 = require("../../utilities/drawing");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../utilities/triggerAnnotationRenderForViewportIds"));
const elementCursor_1 = require("../../cursors/elementCursor");
class CobbAngleTool extends base_1.AnnotationTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            shadow: true,
            preventHandleOutsideImage: false,
            getTextLines: defaultGetTextLines,
        },
    }) {
        super(toolProps, defaultToolProps);
        this.addNewAnnotation = (evt) => {
            if (this.angleStartedNotYetCompleted) {
                return;
            }
            this.angleStartedNotYetCompleted = true;
            const eventDetail = evt.detail;
            const { currentPoints, element } = eventDetail;
            const worldPos = currentPoints.world;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport, renderingEngine } = enabledElement;
            (0, elementCursor_1.hideElementCursor)(element);
            this.isDrawing = true;
            const camera = viewport.getCamera();
            const { viewPlaneNormal, viewUp } = camera;
            const referencedImageId = this.getReferencedImageId(viewport, worldPos, viewPlaneNormal, viewUp);
            const FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
            const annotation = {
                highlighted: true,
                invalidated: true,
                metadata: {
                    toolName: this.getToolName(),
                    viewPlaneNormal: [...viewPlaneNormal],
                    viewUp: [...viewUp],
                    FrameOfReferenceUID,
                    referencedImageId,
                },
                data: {
                    handles: {
                        points: [[...worldPos], [...worldPos]],
                        activeHandleIndex: null,
                        textBox: {
                            hasMoved: false,
                            worldPosition: [0, 0, 0],
                            worldBoundingBox: {
                                topLeft: [0, 0, 0],
                                topRight: [0, 0, 0],
                                bottomLeft: [0, 0, 0],
                                bottomRight: [0, 0, 0],
                            },
                        },
                    },
                    label: '',
                    cachedStats: {},
                },
            };
            (0, annotationState_1.addAnnotation)(annotation, element);
            const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
                handleIndex: 1,
                movingTextBox: false,
                newAnnotation: true,
                hasMoved: false,
            };
            this._activateDraw(element);
            evt.preventDefault();
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            return annotation;
        };
        this.isPointNearTool = (element, annotation, canvasCoords, proximity) => {
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport } = enabledElement;
            const { data } = annotation;
            const { distanceToPoint, distanceToPoint2 } = this.distanceToLines({
                viewport,
                points: data.handles.points,
                canvasCoords,
                proximity,
            });
            if (distanceToPoint <= proximity || distanceToPoint2 <= proximity) {
                return true;
            }
            return false;
        };
        this.toolSelectedCallback = (evt, annotation, interactionType, canvasCoords, proximity = 6) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            annotation.highlighted = true;
            const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine, viewport } = enabledElement;
            const { isNearFirstLine, isNearSecondLine } = this.distanceToLines({
                viewport,
                points: annotation.data.handles.points,
                canvasCoords,
                proximity,
            });
            this.editData = {
                annotation,
                viewportIdsToRender,
                movingTextBox: false,
                isNearFirstLine,
                isNearSecondLine,
            };
            this._activateModify(element);
            (0, elementCursor_1.hideElementCursor)(element);
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this._mouseUpCallback = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, newAnnotation, hasMoved } = this.editData;
            const { data } = annotation;
            if (newAnnotation && !hasMoved) {
                return;
            }
            if (this.angleStartedNotYetCompleted && data.handles.points.length < 4) {
                (0, elementCursor_1.resetElementCursor)(element);
                this.editData.handleIndex = data.handles.points.length;
                return;
            }
            this.angleStartedNotYetCompleted = false;
            data.handles.activeHandleIndex = null;
            this._deactivateModify(element);
            this._deactivateDraw(element);
            (0, elementCursor_1.resetElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            if (this.isHandleOutsideImage &&
                this.configuration.preventHandleOutsideImage) {
                (0, annotationState_1.removeAnnotation)(annotation.annotationUID);
            }
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            if (newAnnotation) {
                const eventType = enums_1.Events.ANNOTATION_COMPLETED;
                const eventDetail = {
                    annotation,
                };
                (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
            }
            this.editData = null;
            this.isDrawing = false;
        };
        this._mouseDownCallback = (evt) => {
            const { annotation, handleIndex } = this.editData;
            const eventDetail = evt.detail;
            const { element, currentPoints } = eventDetail;
            const worldPos = currentPoints.world;
            const { data } = annotation;
            if (handleIndex === 1) {
                data.handles.points[1] = worldPos;
                this.editData.hasMoved =
                    data.handles.points[1][0] !== data.handles.points[0][0] ||
                        data.handles.points[1][1] !== data.handles.points[0][0];
                return;
            }
            if (handleIndex === 3) {
                data.handles.points[3] = worldPos;
                this.editData.hasMoved =
                    data.handles.points[3][0] !== data.handles.points[2][0] ||
                        data.handles.points[3][1] !== data.handles.points[2][0];
                this.angleStartedNotYetCompleted = false;
                return;
            }
            this.editData.hasMoved = false;
            (0, elementCursor_1.hideElementCursor)(element);
            data.handles.points[2] = data.handles.points[3] = worldPos;
            this.editData.handleIndex = data.handles.points.length - 1;
        };
        this._mouseDragCallback = (evt) => {
            this.isDrawing = true;
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, handleIndex, movingTextBox, isNearFirstLine, isNearSecondLine, } = this.editData;
            const { data } = annotation;
            if (movingTextBox) {
                const { deltaPoints } = eventDetail;
                const worldPosDelta = deltaPoints.world;
                const { textBox } = data.handles;
                const { worldPosition } = textBox;
                worldPosition[0] += worldPosDelta[0];
                worldPosition[1] += worldPosDelta[1];
                worldPosition[2] += worldPosDelta[2];
                textBox.hasMoved = true;
            }
            else if (handleIndex === undefined &&
                (isNearFirstLine || isNearSecondLine)) {
                const { deltaPoints } = eventDetail;
                const worldPosDelta = deltaPoints.world;
                const points = data.handles.points;
                if (isNearFirstLine) {
                    const firstLinePoints = [points[0], points[1]];
                    firstLinePoints.forEach((point) => {
                        point[0] += worldPosDelta[0];
                        point[1] += worldPosDelta[1];
                        point[2] += worldPosDelta[2];
                    });
                }
                else if (isNearSecondLine) {
                    const secondLinePoints = [points[2], points[3]];
                    secondLinePoints.forEach((point) => {
                        point[0] += worldPosDelta[0];
                        point[1] += worldPosDelta[1];
                        point[2] += worldPosDelta[2];
                    });
                }
                annotation.invalidated = true;
            }
            else {
                const { currentPoints } = eventDetail;
                const worldPos = currentPoints.world;
                data.handles.points[handleIndex] = [...worldPos];
                annotation.invalidated = true;
            }
            this.editData.hasMoved = true;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        };
        this.cancel = (element) => {
            if (!this.isDrawing) {
                return;
            }
            this.isDrawing = false;
            this._deactivateDraw(element);
            this._deactivateModify(element);
            (0, elementCursor_1.resetElementCursor)(element);
            const { annotation, viewportIdsToRender, newAnnotation } = this.editData;
            const { data } = annotation;
            if (data.handles.points.length < 4) {
                (0, annotationState_1.removeAnnotation)(annotation.annotationUID);
            }
            annotation.highlighted = false;
            data.handles.activeHandleIndex = null;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            if (newAnnotation) {
                const eventType = enums_1.Events.ANNOTATION_COMPLETED;
                const eventDetail = {
                    annotation,
                };
                (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
            }
            this.editData = null;
            this.angleStartedNotYetCompleted = false;
            return annotation.annotationUID;
        };
        this._activateModify = (element) => {
            store_1.state.isInteractingWithTool = true;
            element.addEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
        };
        this._deactivateModify = (element) => {
            store_1.state.isInteractingWithTool = false;
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
        };
        this._activateDraw = (element) => {
            store_1.state.isInteractingWithTool = true;
            element.addEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.addEventListener(enums_1.Events.MOUSE_MOVE, this._mouseDragCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.MOUSE_DOWN, this._mouseDownCallback);
        };
        this._deactivateDraw = (element) => {
            store_1.state.isInteractingWithTool = false;
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_MOVE, this._mouseDragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DOWN, this._mouseDownCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            var _a;
            let renderStatus = false;
            const { viewport } = enabledElement;
            const { element } = viewport;
            let annotations = (0, annotationState_1.getAnnotations)(this.getToolName(), element);
            if (!(annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
                return renderStatus;
            }
            annotations = this.filterInteractableAnnotationsForElement(element, annotations);
            if (!(annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
                return renderStatus;
            }
            const targetId = this.getTargetId(viewport);
            const renderingEngine = viewport.getRenderingEngine();
            const styleSpecifier = {
                toolGroupId: this.toolGroupId,
                toolName: this.getToolName(),
                viewportId: enabledElement.viewport.id,
            };
            for (let i = 0; i < annotations.length; i++) {
                const annotation = annotations[i];
                const { annotationUID, data } = annotation;
                const { points, activeHandleIndex } = data.handles;
                styleSpecifier.annotationUID = annotationUID;
                const lineWidth = this.getStyle('lineWidth', styleSpecifier, annotation);
                const lineDash = this.getStyle('lineDash', styleSpecifier, annotation);
                const color = this.getStyle('color', styleSpecifier, annotation);
                const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
                if (!data.cachedStats[targetId] ||
                    data.cachedStats[targetId].angle == null) {
                    data.cachedStats[targetId] = {
                        angle: null,
                        arc1Angle: null,
                        arc2Angle: null,
                        points: {
                            world: {
                                arc1Start: null,
                                arc1End: null,
                                arc2Start: null,
                                arc2End: null,
                                arc1Angle: null,
                                arc2Angle: null,
                            },
                            canvas: {
                                arc1Start: null,
                                arc1End: null,
                                arc2Start: null,
                                arc2End: null,
                                arc1Angle: null,
                                arc2Angle: null,
                            },
                        },
                    };
                    this._calculateCachedStats(annotation, renderingEngine, enabledElement);
                }
                else if (annotation.invalidated) {
                    this._throttledCalculateCachedStats(annotation, renderingEngine, enabledElement);
                }
                let activeHandleCanvasCoords;
                if (!(0, annotationLocking_1.isAnnotationLocked)(annotation) &&
                    !this.editData &&
                    activeHandleIndex !== null) {
                    activeHandleCanvasCoords = [canvasCoordinates[activeHandleIndex]];
                }
                if (!viewport.getRenderingEngine()) {
                    console.warn('Rendering Engine has been destroyed');
                    return renderStatus;
                }
                if (activeHandleCanvasCoords) {
                    const handleGroupUID = '0';
                    (0, drawingSvg_1.drawHandles)(svgDrawingHelper, annotationUID, handleGroupUID, canvasCoordinates, {
                        color,
                        lineDash,
                        lineWidth,
                    });
                }
                const firstLine = [canvasCoordinates[0], canvasCoordinates[1]];
                const secondLine = [canvasCoordinates[2], canvasCoordinates[3]];
                let lineUID = 'line1';
                (0, drawingSvg_1.drawLine)(svgDrawingHelper, annotationUID, lineUID, firstLine[0], firstLine[1], {
                    color,
                    width: lineWidth,
                    lineDash,
                });
                renderStatus = true;
                if (canvasCoordinates.length < 4) {
                    return renderStatus;
                }
                lineUID = 'line2';
                (0, drawingSvg_1.drawLine)(svgDrawingHelper, annotationUID, lineUID, secondLine[0], secondLine[1], {
                    color,
                    width: lineWidth,
                    lineDash,
                });
                lineUID = 'linkLine';
                const mid1 = (0, midPoint_1.midPoint2)(firstLine[0], firstLine[1]);
                const mid2 = (0, midPoint_1.midPoint2)(secondLine[0], secondLine[1]);
                (0, drawingSvg_1.drawLine)(svgDrawingHelper, annotationUID, lineUID, mid1, mid2, {
                    color,
                    lineWidth: '1',
                    lineDash: '1,4',
                });
                const { arc1Start, arc1End, arc2End, arc2Start } = data.cachedStats[targetId].points.canvas;
                const { arc1Angle, arc2Angle } = data.cachedStats[targetId];
                lineUID = 'arc1';
                (0, drawingSvg_1.drawLine)(svgDrawingHelper, annotationUID, lineUID, arc1Start, arc1End, {
                    color,
                    lineWidth: '1',
                });
                lineUID = 'arc2';
                (0, drawingSvg_1.drawLine)(svgDrawingHelper, annotationUID, lineUID, arc2Start, arc2End, {
                    color,
                    lineWidth: '1',
                });
                if (!((_a = data.cachedStats[targetId]) === null || _a === void 0 ? void 0 : _a.angle)) {
                    continue;
                }
                const options = this.getLinkedTextBoxStyle(styleSpecifier, annotation);
                if (!options.visibility) {
                    data.handles.textBox = {
                        hasMoved: false,
                        worldPosition: [0, 0, 0],
                        worldBoundingBox: {
                            topLeft: [0, 0, 0],
                            topRight: [0, 0, 0],
                            bottomLeft: [0, 0, 0],
                            bottomRight: [0, 0, 0],
                        },
                    };
                    continue;
                }
                const textLines = this.configuration.getTextLines(data, targetId);
                if (!data.handles.textBox.hasMoved) {
                    const canvasTextBoxCoords = (0, drawing_1.getTextBoxCoordsCanvas)(canvasCoordinates);
                    data.handles.textBox.worldPosition =
                        viewport.canvasToWorld(canvasTextBoxCoords);
                }
                const textBoxPosition = viewport.worldToCanvas(data.handles.textBox.worldPosition);
                const textBoxUID = 'cobbAngleText';
                const boundingBox = (0, drawingSvg_1.drawLinkedTextBox)(svgDrawingHelper, annotationUID, textBoxUID, textLines, textBoxPosition, canvasCoordinates, {}, options);
                const { x: left, y: top, width, height } = boundingBox;
                data.handles.textBox.worldBoundingBox = {
                    topLeft: viewport.canvasToWorld([left, top]),
                    topRight: viewport.canvasToWorld([left + width, top]),
                    bottomLeft: viewport.canvasToWorld([left, top + height]),
                    bottomRight: viewport.canvasToWorld([left + width, top + height]),
                };
                const arc1TextBoxUID = 'arcAngle1';
                const arc1TextLine = [
                    `${arc1Angle.toFixed(2)} ${String.fromCharCode(176)}`,
                ];
                const arch1TextPosCanvas = (0, midPoint_1.midPoint2)(arc1Start, arc1End);
                (0, drawingSvg_1.drawTextBox)(svgDrawingHelper, annotationUID, arc1TextBoxUID, arc1TextLine, arch1TextPosCanvas, Object.assign(Object.assign({}, options), { padding: 3 }));
                const arc2TextBoxUID = 'arcAngle2';
                const arc2TextLine = [
                    `${arc2Angle.toFixed(2)} ${String.fromCharCode(176)}`,
                ];
                const arch2TextPosCanvas = (0, midPoint_1.midPoint2)(arc2Start, arc2End);
                (0, drawingSvg_1.drawTextBox)(svgDrawingHelper, annotationUID, arc2TextBoxUID, arc2TextLine, arch2TextPosCanvas, Object.assign(Object.assign({}, options), { padding: 3 }));
            }
            return renderStatus;
        };
        this.distanceToLines = ({ viewport, points, canvasCoords, proximity }) => {
            const [point1, point2, point3, point4] = points;
            const canvasPoint1 = viewport.worldToCanvas(point1);
            const canvasPoint2 = viewport.worldToCanvas(point2);
            const canvasPoint3 = viewport.worldToCanvas(point3);
            const canvasPoint4 = viewport.worldToCanvas(point4);
            const line1 = {
                start: {
                    x: canvasPoint1[0],
                    y: canvasPoint1[1],
                },
                end: {
                    x: canvasPoint2[0],
                    y: canvasPoint2[1],
                },
            };
            const line2 = {
                start: {
                    x: canvasPoint3[0],
                    y: canvasPoint3[1],
                },
                end: {
                    x: canvasPoint4[0],
                    y: canvasPoint4[1],
                },
            };
            const distanceToPoint = lineSegment.distanceToPoint([line1.start.x, line1.start.y], [line1.end.x, line1.end.y], [canvasCoords[0], canvasCoords[1]]);
            const distanceToPoint2 = lineSegment.distanceToPoint([line2.start.x, line2.start.y], [line2.end.x, line2.end.y], [canvasCoords[0], canvasCoords[1]]);
            let isNearFirstLine = false;
            let isNearSecondLine = false;
            if (distanceToPoint <= proximity) {
                isNearFirstLine = true;
            }
            else if (distanceToPoint2 <= proximity) {
                isNearSecondLine = true;
            }
            return {
                distanceToPoint,
                distanceToPoint2,
                isNearFirstLine,
                isNearSecondLine,
            };
        };
        this.getArcsStartEndPoints = ({ firstLine, secondLine, mid1, mid2, }) => {
            const linkLine = [mid1, mid2];
            const arc1Angle = (0, angleBetweenLines_1.default)(firstLine, linkLine);
            const arc2Angle = (0, angleBetweenLines_1.default)(secondLine, linkLine);
            const arc1Side = arc1Angle > 90 ? 1 : 0;
            const arc2Side = arc2Angle > 90 ? 0 : 1;
            const midLinkLine = (0, midPoint_1.midPoint2)(linkLine[0], linkLine[1]);
            const linkLineLength = Math.sqrt(Math.pow((linkLine[1][0] - linkLine[0][0]), 2) +
                Math.pow((linkLine[1][1] - linkLine[0][1]), 2));
            const ratio = 0.1;
            const midFirstLine = (0, midPoint_1.midPoint2)(firstLine[0], firstLine[1]);
            const midSecondLine = (0, midPoint_1.midPoint2)(secondLine[0], secondLine[1]);
            const directionVectorStartArc1 = [
                firstLine[arc1Side][0] - midFirstLine[0],
                firstLine[arc1Side][1] - midFirstLine[1],
            ];
            const magnitudeStartArc1 = Math.sqrt(Math.pow(directionVectorStartArc1[0], 2) + Math.pow(directionVectorStartArc1[1], 2));
            const normalizedDirectionStartArc1 = [
                directionVectorStartArc1[0] / magnitudeStartArc1,
                directionVectorStartArc1[1] / magnitudeStartArc1,
            ];
            const arc1Start = [
                midFirstLine[0] +
                    normalizedDirectionStartArc1[0] * linkLineLength * ratio,
                midFirstLine[1] +
                    normalizedDirectionStartArc1[1] * linkLineLength * ratio,
            ];
            const directionVectorEndArc1 = [
                midLinkLine[0] - mid1[0],
                midLinkLine[1] - mid1[1],
            ];
            const magnitudeEndArc1 = Math.sqrt(Math.pow(directionVectorEndArc1[0], 2) + Math.pow(directionVectorEndArc1[1], 2));
            const normalizedDirectionEndArc1 = [
                directionVectorEndArc1[0] / magnitudeEndArc1,
                directionVectorEndArc1[1] / magnitudeEndArc1,
            ];
            const arc1End = [
                mid1[0] + normalizedDirectionEndArc1[0] * linkLineLength * ratio,
                mid1[1] + normalizedDirectionEndArc1[1] * linkLineLength * ratio,
            ];
            const directionVectorStartArc2 = [
                secondLine[arc2Side][0] - midSecondLine[0],
                secondLine[arc2Side][1] - midSecondLine[1],
            ];
            const magnitudeStartArc2 = Math.sqrt(Math.pow(directionVectorStartArc2[0], 2) + Math.pow(directionVectorStartArc2[1], 2));
            const normalizedDirectionStartArc2 = [
                directionVectorStartArc2[0] / magnitudeStartArc2,
                directionVectorStartArc2[1] / magnitudeStartArc2,
            ];
            const arc2Start = [
                midSecondLine[0] +
                    normalizedDirectionStartArc2[0] * linkLineLength * ratio,
                midSecondLine[1] +
                    normalizedDirectionStartArc2[1] * linkLineLength * ratio,
            ];
            const directionVectorEndArc2 = [
                midLinkLine[0] - mid2[0],
                midLinkLine[1] - mid2[1],
            ];
            const magnitudeEndArc2 = Math.sqrt(Math.pow(directionVectorEndArc2[0], 2) + Math.pow(directionVectorEndArc2[1], 2));
            const normalizedDirectionEndArc2 = [
                directionVectorEndArc2[0] / magnitudeEndArc2,
                directionVectorEndArc2[1] / magnitudeEndArc2,
            ];
            const arc2End = [
                mid2[0] + normalizedDirectionEndArc2[0] * linkLineLength * ratio,
                mid2[1] + normalizedDirectionEndArc2[1] * linkLineLength * ratio,
            ];
            return {
                arc1Start,
                arc1End,
                arc2Start,
                arc2End,
                arc1Angle: arc1Angle > 90 ? 180 - arc1Angle : arc1Angle,
                arc2Angle: arc2Angle > 90 ? 180 - arc2Angle : arc2Angle,
            };
        };
        this._throttledCalculateCachedStats = (0, throttle_1.default)(this._calculateCachedStats, 25, { trailing: true });
    }
    handleSelectedCallback(evt, annotation, handle, interactionType = 'mouse') {
        const eventDetail = evt.detail;
        const { element } = eventDetail;
        const { data } = annotation;
        annotation.highlighted = true;
        let movingTextBox = false;
        let handleIndex;
        if (handle.worldPosition) {
            movingTextBox = true;
        }
        else {
            handleIndex = data.handles.points.findIndex((p) => p === handle);
        }
        const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
        this.editData = {
            annotation,
            viewportIdsToRender,
            handleIndex,
            movingTextBox,
        };
        this._activateModify(element);
        (0, elementCursor_1.hideElementCursor)(element);
        const enabledElement = (0, core_1.getEnabledElement)(element);
        const { renderingEngine } = enabledElement;
        (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        evt.preventDefault();
    }
    _calculateCachedStats(annotation, renderingEngine, enabledElement) {
        const data = annotation.data;
        const { viewportId, renderingEngineId } = enabledElement;
        if (data.handles.points.length !== 4) {
            return;
        }
        const seg1 = [null, null];
        const seg2 = [null, null];
        let minDist = Number.MAX_VALUE;
        for (let i = 0; i < 2; i += 1) {
            for (let j = 2; j < 4; j += 1) {
                const dist = gl_matrix_1.vec3.distance(data.handles.points[i], data.handles.points[j]);
                if (dist < minDist) {
                    minDist = dist;
                    seg1[1] = data.handles.points[i];
                    seg1[0] = data.handles.points[(i + 1) % 2];
                    seg2[0] = data.handles.points[j];
                    seg2[1] = data.handles.points[2 + ((j - 1) % 2)];
                }
            }
        }
        const { viewport } = enabledElement;
        const canvasPoints = data.handles.points.map((p) => viewport.worldToCanvas(p));
        const firstLine = [canvasPoints[0], canvasPoints[1]];
        const secondLine = [canvasPoints[2], canvasPoints[3]];
        const mid1 = (0, midPoint_1.midPoint2)(firstLine[0], firstLine[1]);
        const mid2 = (0, midPoint_1.midPoint2)(secondLine[0], secondLine[1]);
        const { arc1Start, arc1End, arc2End, arc2Start, arc1Angle, arc2Angle } = this.getArcsStartEndPoints({
            firstLine,
            secondLine,
            mid1,
            mid2,
        });
        const { cachedStats } = data;
        const targetIds = Object.keys(cachedStats);
        for (let i = 0; i < targetIds.length; i++) {
            const targetId = targetIds[i];
            cachedStats[targetId] = {
                angle: (0, angleBetweenLines_1.default)(seg1, seg2),
                arc1Angle,
                arc2Angle,
                points: {
                    canvas: {
                        arc1Start,
                        arc1End,
                        arc2End,
                        arc2Start,
                    },
                    world: {
                        arc1Start: viewport.canvasToWorld(arc1Start),
                        arc1End: viewport.canvasToWorld(arc1End),
                        arc2End: viewport.canvasToWorld(arc2End),
                        arc2Start: viewport.canvasToWorld(arc2Start),
                    },
                },
            };
        }
        annotation.invalidated = false;
        const eventType = enums_1.Events.ANNOTATION_MODIFIED;
        const eventDetail = {
            annotation,
            viewportId,
            renderingEngineId,
        };
        (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
        return cachedStats;
    }
}
function defaultGetTextLines(data, targetId) {
    const cachedVolumeStats = data.cachedStats[targetId];
    const { angle } = cachedVolumeStats;
    if (angle === undefined) {
        return;
    }
    const textLines = [`${angle.toFixed(2)} ${String.fromCharCode(176)}`];
    return textLines;
}
CobbAngleTool.toolName = 'CobbAngle';
exports.default = CobbAngleTool;
//# sourceMappingURL=CobbAngleTool.js.map