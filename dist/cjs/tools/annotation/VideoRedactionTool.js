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
const core_1 = require("@cornerstonejs/core");
const base_1 = require("../base");
const throttle_1 = __importDefault(require("../../utilities/throttle"));
const stateManagement_1 = require("../../stateManagement");
const drawingSvg_1 = require("../../drawingSvg");
const store_1 = require("../../store");
const enums_1 = require("../../enums");
const viewportFilters_1 = require("../../utilities/viewportFilters");
const rectangle = __importStar(require("../../utilities/math/rectangle"));
const elementCursor_1 = require("../../cursors/elementCursor");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../utilities/triggerAnnotationRenderForViewportIds"));
const getWorldWidthAndHeightFromTwoPoints_1 = __importDefault(require("../../utilities/planar/getWorldWidthAndHeightFromTwoPoints"));
class VideoRedactionTool extends base_1.AnnotationTool {
    constructor(toolConfiguration = {}) {
        super(toolConfiguration, {
            supportedInteractionTypes: ['Mouse', 'Touch'],
            configuration: { shadow: true, preventHandleOutsideImage: false },
        });
        this.addNewAnnotation = (evt) => {
            const eventData = evt.detail;
            const { currentPoints, element } = eventData;
            const worldPos = currentPoints.world;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport, renderingEngine } = enabledElement;
            this.isDrawing = true;
            const annotation = {
                metadata: {
                    viewPlaneNormal: [0, 0, 1],
                    viewUp: [0, 1, 0],
                    FrameOfReferenceUID: viewport.getFrameOfReferenceUID(),
                    referencedImageId: viewport.getFrameOfReferenceUID(),
                    toolName: this.getToolName(),
                },
                data: {
                    invalidated: true,
                    handles: {
                        points: [
                            [...worldPos],
                            [...worldPos],
                            [...worldPos],
                            [...worldPos],
                        ],
                        activeHandleIndex: null,
                    },
                    cachedStats: {},
                    active: true,
                },
            };
            (0, stateManagement_1.addAnnotation)(annotation, element);
            const viewportUIDsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName(), false);
            this.editData = {
                annotation,
                viewportUIDsToRender,
                handleIndex: 3,
                newAnnotation: true,
                hasMoved: false,
            };
            this._activateDraw(element);
            (0, elementCursor_1.hideElementCursor)(element);
            evt.preventDefault();
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportUIDsToRender);
            return annotation;
        };
        this.getHandleNearImagePoint = (element, annotation, canvasCoords, proximity) => {
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport } = enabledElement;
            const { data } = annotation;
            const { points } = data.handles;
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const toolDataCanvasCoordinate = viewport.worldToCanvas(point);
                const near = gl_matrix_1.vec2.distance(canvasCoords, toolDataCanvasCoordinate) < proximity;
                if (near === true) {
                    data.handles.activeHandleIndex = i;
                    return point;
                }
            }
            data.handles.activeHandleIndex = null;
        };
        this.isPointNearTool = (element, annotation, canvasCoords, proximity) => {
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport } = enabledElement;
            const { data } = annotation;
            const { points } = data.handles;
            const canvasPoint1 = viewport.worldToCanvas(points[0]);
            const canvasPoint2 = viewport.worldToCanvas(points[3]);
            const rect = this._getRectangleImageCoordinates([
                canvasPoint1,
                canvasPoint2,
            ]);
            const point = [canvasCoords[0], canvasCoords[1]];
            const { left, top, width, height } = rect;
            const distanceToPoint = rectangle.distanceToPoint([left, top, width, height], point);
            if (distanceToPoint <= proximity) {
                return true;
            }
        };
        this.toolSelectedCallback = (evt, annotation, interactionType = 'mouse') => {
            const eventData = evt.detail;
            const { element } = eventData;
            const { data } = annotation;
            data.active = true;
            const viewportUIDsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName(), false);
            this.editData = {
                annotation,
                viewportUIDsToRender,
            };
            this._activateModify(element);
            (0, elementCursor_1.hideElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportUIDsToRender);
            evt.preventDefault();
        };
        this.handleSelectedCallback = (evt, annotation, handle, interactionType = 'mouse') => {
            const eventData = evt.detail;
            const { element } = eventData;
            const { data } = annotation;
            data.active = true;
            let movingTextBox = false;
            let handleIndex;
            if (handle.worldPosition) {
                movingTextBox = true;
            }
            else {
                handleIndex = data.handles.points.findIndex((p) => p === handle);
            }
            const viewportUIDsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName(), false);
            this.editData = {
                annotation,
                viewportUIDsToRender,
                handleIndex,
            };
            this._activateModify(element);
            (0, elementCursor_1.hideElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportUIDsToRender);
            evt.preventDefault();
        };
        this._mouseUpCallback = (evt) => {
            const eventData = evt.detail;
            const { element } = eventData;
            const { annotation, viewportUIDsToRender, newAnnotation, hasMoved } = this.editData;
            const { data } = annotation;
            if (newAnnotation && !hasMoved) {
                return;
            }
            data.active = false;
            data.handles.activeHandleIndex = null;
            this._deactivateModify(element);
            this._deactivateDraw(element);
            (0, elementCursor_1.resetElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            this.editData = null;
            this.isDrawing = false;
            if (this.isHandleOutsideImage &&
                this.configuration.preventHandleOutsideImage) {
                (0, stateManagement_1.removeAnnotation)(annotation.annotationUID);
            }
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportUIDsToRender);
        };
        this._mouseDragCallback = (evt) => {
            this.isDrawing = true;
            const eventData = evt.detail;
            const { element } = eventData;
            const { annotation, viewportUIDsToRender, handleIndex } = this.editData;
            const { data } = annotation;
            if (handleIndex === undefined) {
                const { deltaPoints } = eventData;
                const worldPosDelta = deltaPoints.world;
                const { points } = data.handles;
                points.forEach((point) => {
                    point[0] += worldPosDelta[0];
                    point[1] += worldPosDelta[1];
                    point[2] += worldPosDelta[2];
                });
                data.invalidated = true;
            }
            else {
                const { currentPoints } = eventData;
                const enabledElement = (0, core_1.getEnabledElement)(element);
                const { worldToCanvas, canvasToWorld } = enabledElement.viewport;
                const worldPos = currentPoints.world;
                const { points } = data.handles;
                points[handleIndex] = [...worldPos];
                let bottomLeftCanvas;
                let bottomRightCanvas;
                let topLeftCanvas;
                let topRightCanvas;
                let bottomLeftWorld;
                let bottomRightWorld;
                let topLeftWorld;
                let topRightWorld;
                switch (handleIndex) {
                    case 0:
                    case 3:
                        bottomLeftCanvas = worldToCanvas(points[0]);
                        topRightCanvas = worldToCanvas(points[3]);
                        bottomRightCanvas = [topRightCanvas[0], bottomLeftCanvas[1]];
                        topLeftCanvas = [bottomLeftCanvas[0], topRightCanvas[1]];
                        bottomRightWorld = canvasToWorld(bottomRightCanvas);
                        topLeftWorld = canvasToWorld(topLeftCanvas);
                        points[1] = bottomRightWorld;
                        points[2] = topLeftWorld;
                        break;
                    case 1:
                    case 2:
                        bottomRightCanvas = worldToCanvas(points[1]);
                        topLeftCanvas = worldToCanvas(points[2]);
                        bottomLeftCanvas = [
                            topLeftCanvas[0],
                            bottomRightCanvas[1],
                        ];
                        topRightCanvas = [
                            bottomRightCanvas[0],
                            topLeftCanvas[1],
                        ];
                        bottomLeftWorld = canvasToWorld(bottomLeftCanvas);
                        topRightWorld = canvasToWorld(topRightCanvas);
                        points[0] = bottomLeftWorld;
                        points[3] = topRightWorld;
                        break;
                }
                data.invalidated = true;
            }
            this.editData.hasMoved = true;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportUIDsToRender);
        };
        this._activateDraw = (element) => {
            store_1.state.isInteractingWithTool = true;
            element.addEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.addEventListener(enums_1.Events.MOUSE_MOVE, this._mouseDragCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.TOUCH_END, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.TOUCH_DRAG, this._mouseDragCallback);
        };
        this._deactivateDraw = (element) => {
            store_1.state.isInteractingWithTool = false;
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_MOVE, this._mouseDragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.TOUCH_END, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.TOUCH_DRAG, this._mouseDragCallback);
        };
        this._activateModify = (element) => {
            store_1.state.isInteractingWithTool = true;
            element.addEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.TOUCH_END, this._mouseUpCallback);
            element.addEventListener(enums_1.Events.TOUCH_DRAG, this._mouseDragCallback);
        };
        this._deactivateModify = (element) => {
            store_1.state.isInteractingWithTool = false;
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._mouseDragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.TOUCH_END, this._mouseUpCallback);
            element.removeEventListener(enums_1.Events.TOUCH_DRAG, this._mouseDragCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            const renderStatus = false;
            const { viewport } = enabledElement;
            const { element } = viewport;
            let annotations = (0, stateManagement_1.getAnnotations)(this.getToolName(), element);
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
                const { annotationUID } = annotation;
                const toolMetadata = annotation.metadata;
                const data = annotation.data;
                const { points, activeHandleIndex } = data.handles;
                const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
                const lineWidth = this.getStyle('lineWidth', styleSpecifier, annotation);
                const lineDash = this.getStyle('lineDash', styleSpecifier, annotation);
                const color = this.getStyle('color', styleSpecifier, annotation);
                if (!viewport.getRenderingEngine()) {
                    console.warn('Rendering Engine has been destroyed');
                    return;
                }
                let activeHandleCanvasCoords;
                if (!this.editData &&
                    activeHandleIndex !== null) {
                    activeHandleCanvasCoords = [canvasCoordinates[activeHandleIndex]];
                }
                if (activeHandleCanvasCoords) {
                    const handleGroupUID = '0';
                    (0, drawingSvg_1.drawHandles)(svgDrawingHelper, annotationUID, handleGroupUID, activeHandleCanvasCoords, {
                        color,
                    });
                }
                const rectangleUID = '0';
                (0, drawingSvg_1.drawRedactionRect)(svgDrawingHelper, annotationUID, rectangleUID, canvasCoordinates[0], canvasCoordinates[3], {
                    color: 'black',
                    lineDash,
                    lineWidth,
                });
            }
        };
        this._getRectangleImageCoordinates = (points) => {
            const [point0, point1] = points;
            return {
                left: Math.min(point0[0], point1[0]),
                top: Math.min(point0[1], point1[1]),
                width: Math.abs(point0[0] - point1[0]),
                height: Math.abs(point0[1] - point1[1]),
            };
        };
        this._calculateCachedStats = (annotation, viewPlaneNormal, viewUp, renderingEngine, enabledElement) => {
            const { data } = annotation;
            const { viewportUID, renderingEngineUID, sceneUID } = enabledElement;
            const worldPos1 = data.handles.points[0];
            const worldPos2 = data.handles.points[3];
            const { cachedStats } = data;
            const targetUIDs = Object.keys(cachedStats);
            for (let i = 0; i < targetUIDs.length; i++) {
                const targetUID = targetUIDs[i];
                const { imageVolume } = this._getImageVolumeFromTargetUID(targetUID, renderingEngine);
                const { dimensions, scalarData, vtkImageData: imageData, metadata, } = imageVolume;
                const worldPos1Index = gl_matrix_1.vec3.fromValues(0, 0, 0);
                const worldPos2Index = gl_matrix_1.vec3.fromValues(0, 0, 0);
                imageData.worldToIndexVec3(worldPos1, worldPos1Index);
                worldPos1Index[0] = Math.floor(worldPos1Index[0]);
                worldPos1Index[1] = Math.floor(worldPos1Index[1]);
                worldPos1Index[2] = Math.floor(worldPos1Index[2]);
                imageData.worldToIndexVec3(worldPos2, worldPos2Index);
                worldPos2Index[0] = Math.floor(worldPos2Index[0]);
                worldPos2Index[1] = Math.floor(worldPos2Index[1]);
                worldPos2Index[2] = Math.floor(worldPos2Index[2]);
                if (this._isInsideVolume(worldPos1Index, worldPos2Index, dimensions)) {
                    this.isHandleOutsideImage = false;
                    const iMin = Math.min(worldPos1Index[0], worldPos2Index[0]);
                    const iMax = Math.max(worldPos1Index[0], worldPos2Index[0]);
                    const jMin = Math.min(worldPos1Index[1], worldPos2Index[1]);
                    const jMax = Math.max(worldPos1Index[1], worldPos2Index[1]);
                    const kMin = Math.min(worldPos1Index[2], worldPos2Index[2]);
                    const kMax = Math.max(worldPos1Index[2], worldPos2Index[2]);
                    const { worldWidth, worldHeight } = (0, getWorldWidthAndHeightFromTwoPoints_1.default)(viewPlaneNormal, viewUp, worldPos1, worldPos2);
                    const area = worldWidth * worldHeight;
                    let count = 0;
                    let mean = 0;
                    let stdDev = 0;
                    const yMultiple = dimensions[0];
                    const zMultiple = dimensions[0] * dimensions[1];
                    for (let k = kMin; k <= kMax; k++) {
                        for (let j = jMin; j <= jMax; j++) {
                            for (let i = iMin; i <= iMax; i++) {
                                const value = scalarData[k * zMultiple + j * yMultiple + i];
                                count++;
                                mean += value;
                            }
                        }
                    }
                    mean /= count;
                    for (let k = kMin; k <= kMax; k++) {
                        for (let j = jMin; j <= jMax; j++) {
                            for (let i = iMin; i <= iMax; i++) {
                                const value = scalarData[k * zMultiple + j * yMultiple + i];
                                const valueMinusMean = value - mean;
                                stdDev += valueMinusMean * valueMinusMean;
                            }
                        }
                    }
                    stdDev /= count;
                    stdDev = Math.sqrt(stdDev);
                    cachedStats[targetUID] = {
                        Modality: metadata.Modality,
                        area,
                        mean,
                        stdDev,
                    };
                }
                else {
                    this.isHandleOutsideImage = true;
                    cachedStats[targetUID] = {
                        Modality: metadata.Modality,
                    };
                }
            }
            data.invalidated = false;
            const eventType = enums_1.Events.ANNOTATION_MODIFIED;
            const eventDetail = {
                annotation,
                viewportUID,
                renderingEngineUID,
                sceneUID: sceneUID,
            };
            (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
            return cachedStats;
        };
        this._isInsideVolume = (index1, index2, dimensions) => {
            return (core_1.utilities.indexWithinDimensions(index1, dimensions) &&
                core_1.utilities.indexWithinDimensions(index2, dimensions));
        };
        this._getTargetVolumeUID = (scene) => {
            if (this.configuration.volumeUID) {
                return this.configuration.volumeUID;
            }
            const volumeActors = scene.getVolumeActors();
            if (!volumeActors && !volumeActors.length) {
                return;
            }
            return volumeActors[0].uid;
        };
        this._throttledCalculateCachedStats = (0, throttle_1.default)(this._calculateCachedStats, 100, { trailing: true });
    }
    cancel(element) {
        if (!this.isDrawing) {
            return;
        }
        this.isDrawing = false;
        this._deactivateDraw(element);
        this._deactivateModify(element);
        (0, elementCursor_1.resetElementCursor)(element);
        const { annotation, viewportUIDsToRender } = this.editData;
        const { data } = annotation;
        data.active = false;
        data.handles.activeHandleIndex = null;
        const enabledElement = (0, core_1.getEnabledElement)(element);
        const { renderingEngine } = enabledElement;
        (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportUIDsToRender);
        this.editData = null;
        return annotation.metadata.annotationUID;
    }
    _getImageVolumeFromTargetUID(targetUID, renderingEngine) {
        let imageVolume, viewport;
        if (targetUID.startsWith('stackTarget')) {
            const coloneIndex = targetUID.indexOf(':');
            const viewportUID = targetUID.substring(coloneIndex + 1);
            const viewport = renderingEngine.getViewport(viewportUID);
            imageVolume = viewport.getImageData();
        }
        else {
            imageVolume = core_1.cache.getVolume(targetUID);
        }
        return { imageVolume, viewport };
    }
    _getTargetStackUID(viewport) {
        return `stackTarget:${viewport.uid}`;
    }
}
VideoRedactionTool.toolName = 'VideoRedaction';
exports.default = VideoRedactionTool;
//# sourceMappingURL=VideoRedactionTool.js.map