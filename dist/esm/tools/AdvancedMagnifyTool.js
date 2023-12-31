import { AnnotationTool } from './base';
import { getEnabledElement, eventTarget, triggerEvent, utilities as csUtils, } from '@cornerstonejs/core';
import { addAnnotation, getAnnotations, } from '../stateManagement/annotation/annotationState';
import { isAnnotationLocked } from '../stateManagement/annotation/annotationLocking';
import { isAnnotationVisible } from '../stateManagement/annotation/annotationVisibility';
import { drawCircle as drawCircleSvg, drawHandles as drawHandlesSvg, } from '../drawingSvg';
import { state } from '../store';
import { Events, MouseBindings, KeyboardBindings } from '../enums';
import { getViewportIdsWithToolToRender } from '../utilities/viewportFilters';
import { resetElementCursor, hideElementCursor, } from '../cursors/elementCursor';
import triggerAnnotationRenderForViewportIds from '../utilities/triggerAnnotationRenderForViewportIds';
import { getCanvasCircleRadius } from '../utilities/math/circle';
import AdvancedMagnifyViewportManager from './AdvancedMagnifyViewportManager';
class AdvancedMagnifyTool extends AnnotationTool {
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
                            mouseButton: MouseBindings.Secondary,
                            modifierKey: KeyboardBindings.Shift,
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
            const enabledElement = getEnabledElement(element);
            const { viewport, renderingEngine } = enabledElement;
            const worldPos = currentPoints.world;
            const canvasPos = currentPoints.canvas;
            const { magnifyingGlass: config } = this.configuration;
            const { radius, zoomFactor, autoPan } = config;
            const worldHandlesPoints = this._getWorldHandlesPoints(viewport, canvasPos, radius);
            const camera = viewport.getCamera();
            const { viewPlaneNormal, viewUp } = camera;
            const referencedImageId = this.getReferencedImageId(viewport, worldPos, viewPlaneNormal, viewUp);
            const annotationUID = csUtils.uuidv4();
            const magnifyViewportId = csUtils.uuidv4();
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
            addAnnotation(annotation, element);
            const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
            evt.preventDefault();
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            return annotation;
        };
        this.isPointNearTool = (element, annotation, canvasCoords, proximity) => {
            const enabledElement = getEnabledElement(element);
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
            const radiusPoint = getCanvasCircleRadius([center, canvasCoords]);
            if (Math.abs(radiusPoint - radius) < proximity * 1.5) {
                return true;
            }
            return false;
        };
        this.toolSelectedCallback = (evt, annotation) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            annotation.highlighted = true;
            const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
            };
            hideElementCursor(element);
            this._activateModify(element);
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this.handleSelectedCallback = (evt, annotation, handle) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { data } = annotation;
            annotation.highlighted = true;
            const { points } = data.handles;
            const handleIndex = points.findIndex((p) => p === handle);
            const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
                handleIndex,
            };
            this._activateModify(element);
            hideElementCursor(element);
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this._endCallback = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, newAnnotation } = this.editData;
            const { data } = annotation;
            data.handles.activeHandleIndex = null;
            this._deactivateModify(element);
            resetElementCursor(element);
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            this.editData = null;
            this.isDrawing = false;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            if (newAnnotation) {
                const eventType = Events.ANNOTATION_COMPLETED;
                const eventDetail = {
                    annotation,
                };
                triggerEvent(eventTarget, eventType, eventDetail);
            }
        };
        this._dragDrawCallback = (evt) => {
            this.isDrawing = true;
            const eventDetail = evt.detail;
            const { element, deltaPoints } = eventDetail;
            const worldPosDelta = deltaPoints?.world ?? [0, 0, 0];
            const enabledElement = getEnabledElement(element);
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
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
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
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
        };
        this._dragHandle = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const enabledElement = getEnabledElement(element);
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
            const newRadius = getCanvasCircleRadius([
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
            resetElementCursor(element);
            const { annotation, viewportIdsToRender, newAnnotation } = this.editData;
            const { data } = annotation;
            annotation.highlighted = false;
            data.handles.activeHandleIndex = null;
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            if (newAnnotation) {
                const eventType = Events.ANNOTATION_COMPLETED;
                const eventDetail = {
                    annotation,
                };
                triggerEvent(eventTarget, eventType, eventDetail);
            }
            this.editData = null;
            return annotation.annotationUID;
        };
        this._activateModify = (element) => {
            state.isInteractingWithTool = true;
            element.addEventListener(Events.MOUSE_UP, this._endCallback);
            element.addEventListener(Events.MOUSE_DRAG, this._dragModifyCallback);
            element.addEventListener(Events.MOUSE_CLICK, this._endCallback);
            element.addEventListener(Events.TOUCH_END, this._endCallback);
            element.addEventListener(Events.TOUCH_DRAG, this._dragModifyCallback);
            element.addEventListener(Events.TOUCH_TAP, this._endCallback);
        };
        this._deactivateModify = (element) => {
            state.isInteractingWithTool = false;
            element.removeEventListener(Events.MOUSE_UP, this._endCallback);
            element.removeEventListener(Events.MOUSE_DRAG, this._dragModifyCallback);
            element.removeEventListener(Events.MOUSE_CLICK, this._endCallback);
            element.removeEventListener(Events.TOUCH_END, this._endCallback);
            element.removeEventListener(Events.TOUCH_DRAG, this._dragModifyCallback);
            element.removeEventListener(Events.TOUCH_TAP, this._endCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            let renderStatus = false;
            const { viewport } = enabledElement;
            const { element } = viewport;
            let annotations = getAnnotations(this.getToolName(), element);
            if (!annotations?.length) {
                return renderStatus;
            }
            annotations = this.filterInteractableAnnotationsForElement(element, annotations);
            annotations = annotations?.filter((annotation) => annotation.data.sourceViewportId ===
                viewport.id);
            if (!annotations?.length) {
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
                if (!isAnnotationVisible(annotationUID)) {
                    continue;
                }
                if (!isAnnotationLocked(annotation) &&
                    !this.editData &&
                    activeHandleIndex !== null) {
                    activeHandleCanvasCoords = [canvasCoordinates[activeHandleIndex]];
                }
                if (activeHandleCanvasCoords) {
                    const handleGroupUID = '0';
                    drawHandlesSvg(svgDrawingHelper, annotationUID, handleGroupUID, activeHandleCanvasCoords, {
                        color,
                    });
                }
                const dataId = `${annotationUID}-advancedMagnify`;
                const circleUID = '0';
                drawCircleSvg(svgDrawingHelper, annotationUID, circleUID, center, radius, {
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
        this.magnifyViewportManager = AdvancedMagnifyViewportManager.getInstance();
    }
    showZoomFactorsList(evt, annotation) {
        const { element, currentPoints } = evt.detail;
        const enabledElement = getEnabledElement(element);
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
            const shouldCancel = (evt.keyCode ?? evt.which === 27) ||
                evt.key?.toLowerCase() === 'escape';
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
AdvancedMagnifyTool.toolName = 'AdvancedMagnify';
export { AdvancedMagnifyTool as default };
//# sourceMappingURL=AdvancedMagnifyTool.js.map