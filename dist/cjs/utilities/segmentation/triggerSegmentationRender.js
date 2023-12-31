"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSegmentationRender = exports.segmentationRenderingEngine = void 0;
const core_1 = require("@cornerstonejs/core");
const enums_1 = require("../../enums");
const ToolGroupManager_1 = require("../../store/ToolGroupManager");
const SegmentationDisplayTool_1 = __importDefault(require("../../tools/displayTools/SegmentationDisplayTool"));
class SegmentationRenderingEngine {
    constructor() {
        this._needsRender = new Set();
        this._animationFrameSet = false;
        this._animationFrameHandle = null;
        this._renderFlaggedToolGroups = () => {
            this._throwIfDestroyed();
            const toolGroupIds = Array.from(this._needsRender.values());
            for (const toolGroupId of toolGroupIds) {
                this._triggerRender(toolGroupId);
                this._needsRender.delete(toolGroupId);
                if (this._needsRender.size === 0) {
                    this._animationFrameSet = false;
                    this._animationFrameHandle = null;
                    return;
                }
            }
        };
    }
    removeToolGroup(toolGroupId) {
        this._needsRender.delete(toolGroupId);
        if (this._needsRender.size === 0) {
            this._reset();
        }
    }
    renderToolGroupSegmentations(toolGroupId) {
        this._setToolGroupSegmentationToBeRenderedNextFrame([toolGroupId]);
    }
    _throwIfDestroyed() {
        if (this.hasBeenDestroyed) {
            throw new Error('this.destroy() has been manually called to free up memory, can not longer use this instance. Instead make a new one.');
        }
    }
    _setToolGroupSegmentationToBeRenderedNextFrame(toolGroupIds) {
        toolGroupIds.forEach((toolGroupId) => {
            this._needsRender.add(toolGroupId);
        });
        this._render();
    }
    _render() {
        if (this._needsRender.size > 0 && this._animationFrameSet === false) {
            this._animationFrameHandle = window.requestAnimationFrame(this._renderFlaggedToolGroups);
            this._animationFrameSet = true;
        }
    }
    _triggerRender(toolGroupId) {
        const toolGroup = (0, ToolGroupManager_1.getToolGroup)(toolGroupId);
        if (!toolGroup) {
            console.warn(`No tool group found with toolGroupId: ${toolGroupId}`);
            return;
        }
        const { viewportsInfo } = toolGroup;
        const viewports = [];
        viewportsInfo.forEach(({ viewportId, renderingEngineId }) => {
            const renderingEngine = (0, core_1.getRenderingEngine)(renderingEngineId);
            if (!renderingEngine) {
                console.warn('rendering Engine has been destroyed');
                return;
            }
            viewports.push(renderingEngine.getViewport(viewportId));
        });
        const segmentationDisplayToolInstance = toolGroup.getToolInstance(SegmentationDisplayTool_1.default.toolName);
        if (!segmentationDisplayToolInstance) {
            console.warn('No segmentation tool found inside', toolGroupId);
            return;
        }
        function onSegmentationRender(evt) {
            const { element, viewportId, renderingEngineId } = evt.detail;
            element.removeEventListener(core_1.Enums.Events.IMAGE_RENDERED, onSegmentationRender);
            const toolGroup = (0, ToolGroupManager_1.getToolGroupForViewport)(viewportId, renderingEngineId);
            if (!toolGroup) {
                console.warn('toolGroup has been destroyed');
                return;
            }
            const eventDetail = {
                toolGroupId: toolGroup.id,
                viewportId,
            };
            (0, core_1.triggerEvent)(core_1.eventTarget, enums_1.Events.SEGMENTATION_RENDERED, Object.assign({}, eventDetail));
        }
        viewports.forEach(({ element }) => {
            element.addEventListener(core_1.Enums.Events.IMAGE_RENDERED, onSegmentationRender);
        });
        segmentationDisplayToolInstance.renderSegmentation(toolGroupId);
    }
    _reset() {
        window.cancelAnimationFrame(this._animationFrameHandle);
        this._needsRender.clear();
        this._animationFrameSet = false;
        this._animationFrameHandle = null;
    }
}
const segmentationRenderingEngine = new SegmentationRenderingEngine();
exports.segmentationRenderingEngine = segmentationRenderingEngine;
function triggerSegmentationRender(toolGroupId) {
    segmentationRenderingEngine.renderToolGroupSegmentations(toolGroupId);
}
exports.triggerSegmentationRender = triggerSegmentationRender;
exports.default = triggerSegmentationRender;
//# sourceMappingURL=triggerSegmentationRender.js.map