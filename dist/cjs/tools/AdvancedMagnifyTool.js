"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const base_1 = require("./base");
const core_1 = require("@cornerstonejs/core");
const annotationState_1 = require("../stateManagement/annotation/annotationState");
const annotationLocking_1 = require("../stateManagement/annotation/annotationLocking");
const annotationVisibility_1 = require("../stateManagement/annotation/annotationVisibility");
const drawingSvg_1 = require("../drawingSvg");
const store_1 = require("../store");
const enums_1 = require("../enums");
const viewportFilters_1 = require("../utilities/viewportFilters");
const elementCursor_1 = require("../cursors/elementCursor");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../utilities/triggerAnnotationRenderForViewportIds"));
const circle_1 = require("../utilities/math/circle");
const AdvancedMagnifyViewportManager_1 = __importDefault(require("./AdvancedMagnifyViewportManager"));
class AdvancedMagnifyTool extends base_1.AnnotationTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            shadow: true,
            magnifyingGlass: {
                radius: 125,
                zoomFactor: 2.5,
                zoomFactorList: [2.5, 3, 3.5, 4, 4.5, 5],
                autoPan: {
                    enabled: true,
                    padding: 10,
                },
            },
            actions: [
                {
                    method: 'showZoomFactorsList',
                    bindings: [
                        {
                            mouseButton: enums_1.MouseBindings.Secondary,
                            modifierKey: enums_1.KeyboardBindings.Shift,
                        },
                    ],
                },
            ],
        },
    }) {
        super(toolProps, defaultToolProps);
        this.addNewAnnotation = (evt) => {
            const eventDetail = evt.detail;
            const { currentPoints, element } = eventDetail;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport, renderingEngine } = enabledElement;
            const worldPos = currentPoints.world;
            const canvasPos = currentPoints.canvas;
            const { magnifyingGlass: config } = this.configuration;
            const { radius, zoomFactor, autoPan } = config;
            const worldHandlesPoints = this._getWorldHandlesPoints(viewport, canvasPos, radius);
            const camera = viewport.getCamera();
            const { viewPlaneNormal, viewUp } = camera;
            const referencedImageId = this.getReferencedImageId(viewport, worldPos, viewPlaneNormal, viewUp);
            const annotationUID = core_1.utilities.uuidv4();
            const magnifyViewportId = core_1.utilities.uuidv4();
            const FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
            const annotation = {
                annotationUID,
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
                    sourceViewportId: viewport.id,
                    magnifyViewportId,
                    zoomFactor,
                    handles: {
                        points: worldHandlesPoints,
                        activeHandleIndex: null,
                    },
                },
            };
            this.magnifyViewportManager.createViewport(annotation, {
                magnifyViewportId,
                sourceEnabledElement: enabledElement,
                position: canvasPos,
                radius,
                zoomFactor,
                autoPan: {
                    enabled: autoPan.enabled,
                    padding: autoPan.padding,
                    callback: (data) => {
                        const annotationPoints = annotation.data.handles.points;
                        const { world: worldDelta } = data.delta;
                        for (let i = 0, len = annotationPoints.length; i < len; i++) {
                            annotationPoints[i][0] += worldDelta[0];
                            annotationPoints[i][1] += worldDelta[1];
                            annotationPoints[i][2] += worldDelta[2];
                        }
                    },
                },
            });
            (0, annotationState_1.addAnnotation)(annotation, element);
            const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
            evt.preventDefault();
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            return annotation;
        };
        this.isPointNearTool = (element, annotation, canvasCoords, proximity) => {
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport } = enabledElement;
            const { data } = annotation;
            const { points } = data.handles;
            const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
            const canvasTop = canvasCoordinates[0];
            const canvasBottom = canvasCoordinates[2];
            const canvasLeft = canvasCoordinates[3];
            const radius = Math.abs(canvasBottom[1] - canvasTop[1]) * 0.5;
            const center = [
                canvasLeft[0] + radius,
                canvasTop[1] + radius,
            ];
            const radiusPoint = (0, circle_1.getCanvasCircleRadius)([center, canvasCoords]);
            if (Math.abs(radiusPoint - radius) < proximity * 1.5) {
                return true;
            }
            return false;
        };
        this.toolSelectedCallback = (evt, annotation) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            annotation.highlighted = true;
            const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
            };
            (0, elementCursor_1.hideElementCursor)(element);
            this._activateModify(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this.handleSelectedCallback = (evt, annotation, handle) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { data } = annotation;
            annotation.highlighted = true;
            const { points } = data.handles;
            const handleIndex = points.findIndex((p) => p === handle);
            const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
                handleIndex,
            };
            this._activateModify(element);
            (0, elementCursor_1.hideElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this._endCallback = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, newAnnotation } = this.editData;
            const { data } = annotation;
            data.handles.activeHandleIndex = null;
            this._deactivateModify(element);
            (0, elementCursor_1.resetElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            this.editData = null;
            this.isDrawing = false;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            if (newAnnotation) {
                const eventType = enums_1.Events.ANNOTATION_COMPLETED;
                const eventDetail = {
                    annotation,
                };
                (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
            }
        };
        this._dragDrawCallback = (evt) => {
            var _a;
            this.isDrawing = true;
            const eventDetail = evt.detail;
            const { element, deltaPoints } = eventDetail;
            const worldPosDelta = (_a = deltaPoints === null || deltaPoints === void 0 ? void 0 : deltaPoints.world) !== null && _a !== void 0 ? _a : [0, 0, 0];
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            const { annotation, viewportIdsToRender } = this.editData;
            const { points } = annotation.data.handles;
            points.forEach((point) => {
                point[0] += worldPosDelta[0];
                point[1] += worldPosDelta[1];
                point[2] += worldPosDelta[2];
            });
            annotation.invalidated = true;
            this.editData.hasMoved = true;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        };
        this._dragModifyCallback = (evt) => {
            this.isDrawing = true;
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, handleIndex } = this.editData;
            const { data } = annotation;
            if (handleIndex === undefined) {
                const { deltaPoints } = eventDetail;
                const worldPosDelta = deltaPoints.world;
                const points = data.handles.points;
                points.forEach((point) => {
                    point[0] += worldPosDelta[0];
                    point[1] += worldPosDelta[1];
                    point[2] += worldPosDelta[2];
                });
                annotation.invalidated = true;
            }
            else {
                this._dragHandle(evt);
                annotation.invalidated = true;
            }
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        };
        this._dragHandle = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport } = enabledElement;
            const { worldToCanvas } = viewport;
            const { annotation } = this.editData;
            const { data } = annotation;
            const { points } = data.handles;
            const canvasCoordinates = points.map((p) => worldToCanvas(p));
            const canvasTop = canvasCoordinates[0];
            const canvasBottom = canvasCoordinates[2];
            const canvasLeft = canvasCoordinates[3];
            const radius = Math.abs(canvasBottom[1] - canvasTop[1]) * 0.5;
            const canvasCenter = [
                canvasLeft[0] + radius,
                canvasTop[1] + radius,
            ];
            const { currentPoints } = eventDetail;
            const currentCanvasPoints = currentPoints.canvas;
            const newRadius = (0, circle_1.getCanvasCircleRadius)([
                canvasCenter,
                currentCanvasPoints,
            ]);
            const newWorldHandlesPoints = this._getWorldHandlesPoints(viewport, canvasCenter, newRadius);
            points[0] = newWorldHandlesPoints[0];
            points[1] = newWorldHandlesPoints[1];
            points[2] = newWorldHandlesPoints[2];
            points[3] = newWorldHandlesPoints[3];
        };
        this.cancel = (element) => {
            if (!this.isDrawing) {
                return;
            }
            this.isDrawing = false;
            this._deactivateModify(element);
            (0, elementCursor_1.resetElementCursor)(element);
            const { annotation, viewportIdsToRender, newAnnotation } = this.editData;
            const { data } = annotation;
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
            return annotation.annotationUID;
        };
        this._activateModify = (element) => {
            store_1.state.isInteractingWithTool = true;
            element.addEventListener(enums_1.Events.MOUSE_UP, this._endCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._dragModifyCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._endCallback);
            element.addEventListener(enums_1.Events.TOUCH_END, this._endCallback);
            element.addEventListener(enums_1.Events.TOUCH_DRAG, this._dragModifyCallback);
            element.addEventListener(enums_1.Events.TOUCH_TAP, this._endCallback);
        };
        this._deactivateModify = (element) => {
            store_1.state.isInteractingWithTool = false;
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._endCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._dragModifyCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_END, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_DRAG, this._dragModifyCallback);
            element.removeEventListener(enums_1.Events.TOUCH_TAP, this._endCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            let renderStatus = false;
            const { viewport } = enabledElement;
            const { element } = viewport;
            let annotations = (0, annotationState_1.getAnnotations)(this.getToolName(), element);
            if (!(annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
                return renderStatus;
            }
            annotations = this.filterInteractableAnnotationsForElement(element, annotations);
            annotations = annotations === null || annotations === void 0 ? void 0 : annotations.filter((annotation) => annotation.data.sourceViewportId ===
                viewport.id);
            if (!(annotations === null || annotations === void 0 ? void 0 : annotations.length)) {
                return renderStatus;
            }
            const styleSpecifier = {
                toolGroupId: this.toolGroupId,
                toolName: this.getToolName(),
                viewportId: enabledElement.viewport.id,
            };
            for (let i = 0; i < annotations.length; i++) {
                const annotation = annotations[i];
                const { annotationUID, data } = annotation;
                const { magnifyViewportId, zoomFactor, handles } = data;
                const { points, activeHandleIndex } = handles;
                styleSpecifier.annotationUID = annotationUID;
                const lineWidth = this.getStyle('lineWidth', styleSpecifier, annotation);
                const lineDash = this.getStyle('lineDash', styleSpecifier, annotation);
                const color = this.getStyle('color', styleSpecifier, annotation);
                const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
                const canvasTop = canvasCoordinates[0];
                const canvasBottom = canvasCoordinates[2];
                const canvasLeft = canvasCoordinates[3];
                const radius = Math.abs(canvasBottom[1] - canvasTop[1]) * 0.5;
                const center = [
                    canvasLeft[0] + radius,
                    canvasTop[1] + radius,
                ];
                if (!viewport.getRenderingEngine()) {
                    console.warn('Rendering Engine has been destroyed');
                    return renderStatus;
                }
                let activeHandleCanvasCoords;
                if (!(0, annotationVisibility_1.isAnnotationVisible)(annotationUID)) {
                    continue;
                }
                if (!(0, annotationLocking_1.isAnnotationLocked)(annotation) &&
                    !this.editData &&
                    activeHandleIndex !== null) {
                    activeHandleCanvasCoords = [canvasCoordinates[activeHandleIndex]];
                }
                if (activeHandleCanvasCoords) {
                    const handleGroupUID = '0';
                    (0, drawingSvg_1.drawHandles)(svgDrawingHelper, annotationUID, handleGroupUID, activeHandleCanvasCoords, {
                        color,
                    });
                }
                const dataId = `${annotationUID}-advancedMagnify`;
                const circleUID = '0';
                (0, drawingSvg_1.drawCircle)(svgDrawingHelper, annotationUID, circleUID, center, radius, {
                    color,
                    lineDash,
                    lineWidth,
                }, dataId);
                const magnifyViewport = this.magnifyViewportManager.getViewport(magnifyViewportId);
                magnifyViewport.position = center;
                magnifyViewport.radius = radius;
                magnifyViewport.zoomFactor = zoomFactor;
                magnifyViewport.update();
                renderStatus = true;
            }
            return renderStatus;
        };
        this._getWorldHandlesPoints = (viewport, canvasCenterPos, canvasRadius) => {
            const canvasHandlesPoints = [
                [canvasCenterPos[0], canvasCenterPos[1] - canvasRadius],
                [canvasCenterPos[0] + canvasRadius, canvasCenterPos[1]],
                [canvasCenterPos[0], canvasCenterPos[1] + canvasRadius],
                [canvasCenterPos[0] - canvasRadius, canvasCenterPos[1]],
            ];
            const worldHandlesPoints = canvasHandlesPoints.map((p) => viewport.canvasToWorld(p));
            return worldHandlesPoints;
        };
        this.magnifyViewportManager = AdvancedMagnifyViewportManager_1.default.getInstance();
    }
    showZoomFactorsList(evt, annotation) {
        const { element, currentPoints } = evt.detail;
        const enabledElement = (0, core_1.getEnabledElement)(element);
        const { viewport } = enabledElement;
        const { canvas: canvasPoint } = currentPoints;
        const viewportElement = element.querySelector(':scope .viewport-element');
        const currentZoomFactor = annotation.data.zoomFactor;
        const remove = () => dropdown.parentElement.removeChild(dropdown);
        const dropdown = this._getZoomFactorsListDropdown(currentZoomFactor, (newZoomFactor) => {
            if (newZoomFactor !== undefined) {
                annotation.data.zoomFactor = Number.parseFloat(newZoomFactor);
                annotation.invalidated = true;
            }
            remove();
            viewport.render();
        });
        Object.assign(dropdown.style, {
            left: `${canvasPoint[0]}px`,
            top: `${canvasPoint[1]}px`,
        });
        viewportElement.appendChild(dropdown);
        dropdown.focus();
    }
    _getZoomFactorsListDropdown(currentZoomFactor, onChangeCallback) {
        const { zoomFactorList } = this.configuration.magnifyingGlass;
        const dropdown = document.createElement('select');
        dropdown.size = 5;
        Object.assign(dropdown.style, {
            width: '50px',
            position: 'absolute',
        });
        ['mousedown', 'mouseup', 'mousemove', 'click'].forEach((eventName) => {
            dropdown.addEventListener(eventName, (evt) => evt.stopPropagation());
        });
        dropdown.addEventListener('change', (evt) => {
            evt.stopPropagation();
            onChangeCallback(dropdown.value);
        });
        dropdown.addEventListener('keydown', (evt) => {
            var _a, _b;
            const shouldCancel = ((_a = evt.keyCode) !== null && _a !== void 0 ? _a : evt.which === 27) ||
                ((_b = evt.key) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'escape';
            if (shouldCancel) {
                evt.stopPropagation();
                onChangeCallback();
            }
        });
        zoomFactorList.forEach((zoomFactor) => {
            const option = document.createElement('option');
            option.label = zoomFactor;
            option.title = `Zoom factor ${zoomFactor.toFixed(1)}`;
            option.value = zoomFactor;
            option.defaultSelected = zoomFactor === currentZoomFactor;
            dropdown.add(option);
        });
        return dropdown;
    }
}
exports.default = AdvancedMagnifyTool;
AdvancedMagnifyTool.toolName = 'AdvancedMagnify';
//# sourceMappingURL=AdvancedMagnifyTool.js.map