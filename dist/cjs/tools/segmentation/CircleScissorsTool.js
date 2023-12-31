"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const base_1 = require("../base");
const fillCircle_1 = require("./strategies/fillCircle");
const enums_1 = require("../../enums");
const drawingSvg_1 = require("../../drawingSvg");
const elementCursor_1 = require("../../cursors/elementCursor");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../utilities/triggerAnnotationRenderForViewportIds"));
const segmentation_1 = require("../../stateManagement/segmentation");
const segmentationState_1 = require("../../stateManagement/segmentation/segmentationState");
class CircleScissorsTool extends base_1.BaseTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            strategies: {
                FILL_INSIDE: fillCircle_1.fillInsideCircle,
            },
            defaultStrategy: 'FILL_INSIDE',
            activeStrategy: 'FILL_INSIDE',
        },
    }) {
        super(toolProps, defaultToolProps);
        this.preMouseDownCallback = (evt) => {
            const eventDetail = evt.detail;
            const { currentPoints, element } = eventDetail;
            const worldPos = currentPoints.world;
            const canvasPos = currentPoints.canvas;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport, renderingEngine } = enabledElement;
            this.isDrawing = true;
            const camera = viewport.getCamera();
            const { viewPlaneNormal, viewUp } = camera;
            const toolGroupId = this.toolGroupId;
            const activeSegmentationRepresentation = segmentation_1.activeSegmentation.getActiveSegmentationRepresentation(toolGroupId);
            if (!activeSegmentationRepresentation) {
                throw new Error('No active segmentation detected, create one before using scissors tool');
            }
            const { segmentationRepresentationUID, segmentationId, type } = activeSegmentationRepresentation;
            const segmentIndex = segmentation_1.segmentIndex.getActiveSegmentIndex(segmentationId);
            const segmentsLocked = segmentation_1.segmentLocking.getLockedSegments(segmentationId);
            const segmentColor = segmentation_1.config.color.getColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex);
            const { representationData } = (0, segmentationState_1.getSegmentation)(segmentationId);
            const { volumeId } = representationData[type];
            const segmentation = core_1.cache.getVolume(volumeId);
            const annotation = {
                invalidated: true,
                highlighted: true,
                metadata: {
                    viewPlaneNormal: [...viewPlaneNormal],
                    viewUp: [...viewUp],
                    FrameOfReferenceUID: viewport.getFrameOfReferenceUID(),
                    referencedImageId: '',
                    toolName: this.getToolName(),
                    segmentColor,
                },
                data: {
                    handles: {
                        points: [[...worldPos], [...worldPos], [...worldPos], [...worldPos]],
                        activeHandleIndex: null,
                    },
                    isDrawing: true,
                    cachedStats: {},
                },
            };
            const viewportIdsToRender = [viewport.id];
            this.editData = {
                annotation,
                segmentation,
                centerCanvas: canvasPos,
                segmentIndex,
                segmentationId,
                segmentsLocked,
                segmentColor,
                viewportIdsToRender,
                handleIndex: 3,
                movingTextBox: false,
                newAnnotation: true,
                hasMoved: false,
            };
            this._activateDraw(element);
            (0, elementCursor_1.hideElementCursor)(element);
            evt.preventDefault();
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
            return true;
        };
        this._dragCallback = (evt) => {
            this.isDrawing = true;
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { currentPoints } = eventDetail;
            const currentCanvasPoints = currentPoints.canvas;
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { renderingEngine, viewport } = enabledElement;
            const { canvasToWorld } = viewport;
            const { annotation, viewportIdsToRender, centerCanvas } = this.editData;
            const { data } = annotation;
            const dX = Math.abs(currentCanvasPoints[0] - centerCanvas[0]);
            const dY = Math.abs(currentCanvasPoints[1] - centerCanvas[1]);
            const radius = Math.sqrt(dX * dX + dY * dY);
            const bottomCanvas = [
                centerCanvas[0],
                centerCanvas[1] + radius,
            ];
            const topCanvas = [centerCanvas[0], centerCanvas[1] - radius];
            const leftCanvas = [
                centerCanvas[0] - radius,
                centerCanvas[1],
            ];
            const rightCanvas = [
                centerCanvas[0] + radius,
                centerCanvas[1],
            ];
            data.handles.points = [
                canvasToWorld(bottomCanvas),
                canvasToWorld(topCanvas),
                canvasToWorld(leftCanvas),
                canvasToWorld(rightCanvas),
            ];
            annotation.invalidated = true;
            this.editData.hasMoved = true;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        };
        this._endCallback = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, newAnnotation, hasMoved, segmentation, segmentIndex, segmentsLocked, segmentationId, } = this.editData;
            const { data } = annotation;
            const { viewPlaneNormal, viewUp } = annotation.metadata;
            if (newAnnotation && !hasMoved) {
                return;
            }
            data.handles.activeHandleIndex = null;
            this._deactivateDraw(element);
            (0, elementCursor_1.resetElementCursor)(element);
            const enabledElement = (0, core_1.getEnabledElement)(element);
            const { viewport } = enabledElement;
            this.editData = null;
            this.isDrawing = false;
            if (viewport instanceof core_1.StackViewport) {
                throw new Error('Not implemented yet');
            }
            const operationData = {
                points: data.handles.points,
                volume: segmentation,
                segmentIndex,
                segmentsLocked,
                viewPlaneNormal,
                segmentationId,
                viewUp,
            };
            this.applyActiveStrategy(enabledElement, operationData);
        };
        this._activateDraw = (element) => {
            element.addEventListener(enums_1.Events.MOUSE_UP, this._endCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._dragCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._endCallback);
            element.addEventListener(enums_1.Events.TOUCH_TAP, this._endCallback);
            element.addEventListener(enums_1.Events.TOUCH_DRAG, this._dragCallback);
            element.addEventListener(enums_1.Events.TOUCH_END, this._endCallback);
        };
        this._deactivateDraw = (element) => {
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._endCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._dragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_END, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_DRAG, this._dragCallback);
            element.removeEventListener(enums_1.Events.TOUCH_TAP, this._endCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            let renderStatus = false;
            if (!this.editData) {
                return renderStatus;
            }
            const { viewport } = enabledElement;
            const { viewportIdsToRender } = this.editData;
            if (!viewportIdsToRender.includes(viewport.id)) {
                return renderStatus;
            }
            const { annotation } = this.editData;
            const toolMetadata = annotation.metadata;
            const annotationUID = annotation.annotationUID;
            const data = annotation.data;
            const { points } = data.handles;
            const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
            const bottom = canvasCoordinates[0];
            const top = canvasCoordinates[1];
            const center = [
                Math.floor((bottom[0] + top[0]) / 2),
                Math.floor((bottom[1] + top[1]) / 2),
            ];
            const radius = Math.abs(bottom[1] - Math.floor((bottom[1] + top[1]) / 2));
            const color = `rgb(${toolMetadata.segmentColor.slice(0, 3)})`;
            if (!viewport.getRenderingEngine()) {
                console.warn('Rendering Engine has been destroyed');
                return renderStatus;
            }
            const circleUID = '0';
            (0, drawingSvg_1.drawCircle)(svgDrawingHelper, annotationUID, circleUID, center, radius, {
                color,
            });
            renderStatus = true;
            return renderStatus;
        };
    }
}
CircleScissorsTool.toolName = 'CircleScissor';
exports.default = CircleScissorsTool;
//# sourceMappingURL=CircleScissorsTool.js.map