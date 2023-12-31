"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const base_1 = require("../base");
const fillRectangle_1 = require("./strategies/fillRectangle");
const eraseRectangle_1 = require("./strategies/eraseRectangle");
const viewportFilters_1 = require("../../utilities/viewportFilters");
const enums_1 = require("../../enums");
const drawingSvg_1 = require("../../drawingSvg");
const elementCursor_1 = require("../../cursors/elementCursor");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../utilities/triggerAnnotationRenderForViewportIds"));
const segmentation_1 = require("../../stateManagement/segmentation");
const segmentationState_1 = require("../../stateManagement/segmentation/segmentationState");
class RectangleScissorsTool extends base_1.BaseTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            strategies: {
                FILL_INSIDE: fillRectangle_1.fillInsideRectangle,
                ERASE_INSIDE: eraseRectangle_1.eraseInsideRectangle,
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
                highlighted: true,
                invalidated: true,
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
                        points: [
                            [...worldPos],
                            [...worldPos],
                            [...worldPos],
                            [...worldPos],
                        ],
                        activeHandleIndex: null,
                    },
                },
            };
            const viewportIdsToRender = (0, viewportFilters_1.getViewportIdsWithToolToRender)(element, this.getToolName());
            this.editData = {
                annotation,
                segmentation,
                segmentIndex,
                segmentsLocked,
                segmentColor,
                segmentationId,
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
            const { annotation, viewportIdsToRender, handleIndex } = this.editData;
            const { data } = annotation;
            const { currentPoints } = eventDetail;
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
                    topRightCanvas = [bottomRightCanvas[0], topLeftCanvas[1]];
                    bottomLeftWorld = canvasToWorld(bottomLeftCanvas);
                    topRightWorld = canvasToWorld(topRightCanvas);
                    points[0] = bottomLeftWorld;
                    points[3] = topRightWorld;
                    break;
            }
            annotation.invalidated = true;
            this.editData.hasMoved = true;
            const { renderingEngine } = enabledElement;
            (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        };
        this._endCallback = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, newAnnotation, hasMoved, segmentation, segmentationId, segmentIndex, segmentsLocked, } = this.editData;
            const { data } = annotation;
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
                segmentationId,
                segmentIndex,
                segmentsLocked,
            };
            this.applyActiveStrategy(enabledElement, operationData);
        };
        this._activateDraw = (element) => {
            element.addEventListener(enums_1.Events.MOUSE_UP, this._endCallback);
            element.addEventListener(enums_1.Events.MOUSE_DRAG, this._dragCallback);
            element.addEventListener(enums_1.Events.MOUSE_CLICK, this._endCallback);
            element.addEventListener(enums_1.Events.TOUCH_END, this._endCallback);
            element.addEventListener(enums_1.Events.TOUCH_DRAG, this._dragCallback);
            element.addEventListener(enums_1.Events.TOUCH_TAP, this._endCallback);
        };
        this._deactivateDraw = (element) => {
            element.removeEventListener(enums_1.Events.MOUSE_UP, this._endCallback);
            element.removeEventListener(enums_1.Events.MOUSE_DRAG, this._dragCallback);
            element.removeEventListener(enums_1.Events.MOUSE_CLICK, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_TAP, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_END, this._endCallback);
            element.removeEventListener(enums_1.Events.TOUCH_DRAG, this._dragCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            let renderStatus = false;
            if (!this.editData) {
                return renderStatus;
            }
            const { viewport } = enabledElement;
            const { annotation } = this.editData;
            const toolMetadata = annotation.metadata;
            const annotationUID = annotation.annotationUID;
            const data = annotation.data;
            const { points } = data.handles;
            const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
            const color = `rgb(${toolMetadata.segmentColor.slice(0, 3)})`;
            if (!viewport.getRenderingEngine()) {
                console.warn('Rendering Engine has been destroyed');
                return renderStatus;
            }
            const rectangleUID = '0';
            (0, drawingSvg_1.drawRect)(svgDrawingHelper, annotationUID, rectangleUID, canvasCoordinates[0], canvasCoordinates[3], {
                color,
            });
            renderStatus = true;
            return renderStatus;
        };
    }
}
RectangleScissorsTool.toolName = 'RectangleScissor';
exports.default = RectangleScissorsTool;
//# sourceMappingURL=RectangleScissorsTool.js.map