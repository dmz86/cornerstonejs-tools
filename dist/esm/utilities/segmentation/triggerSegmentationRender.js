import { triggerEvent, eventTarget, getRenderingEngine, Enums, } from '@cornerstonejs/core';
import { Events as csToolsEvents } from '../../enums';
import { getToolGroup, getToolGroupForViewport, } from '../../store/ToolGroupManager';
import SegmentationDisplayTool from '../../tools/displayTools/SegmentationDisplayTool';
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
        const toolGroup = getToolGroup(toolGroupId);
        if (!toolGroup) {
            console.warn(`No tool group found with toolGroupId: ${toolGroupId}`);
            return;
        }
        const { viewportsInfo } = toolGroup;
        const viewports = [];
        viewportsInfo.forEach(({ viewportId, renderingEngineId }) => {
            const renderingEngine = getRenderingEngine(renderingEngineId);
            if (!renderingEngine) {
                console.warn('rendering Engine has been destroyed');
                return;
            }
            viewports.push(renderingEngine.getViewport(viewportId));
        });
        const segmentationDisplayToolInstance = toolGroup.getToolInstance(SegmentationDisplayTool.toolName);
        if (!segmentationDisplayToolInstance) {
            console.warn('No segmentation tool found inside', toolGroupId);
            return;
        }
        function onSegmentationRender(evt) {
            const { element, viewportId, renderingEngineId } = evt.detail;
            element.removeEventListener(Enums.Events.IMAGE_RENDERED, onSegmentationRender);
            const toolGroup = getToolGroupForViewport(viewportId, renderingEngineId);
            if (!toolGroup) {
                console.warn('toolGroup has been destroyed');
                return;
            }
            const eventDetail = {
                toolGroupId: toolGroup.id,
                viewportId,
            };
            triggerEvent(eventTarget, csToolsEvents.SEGMENTATION_RENDERED, {
                ...eventDetail,
            });
        }
        viewports.forEach(({ element }) => {
            element.addEventListener(Enums.Events.IMAGE_RENDERED, onSegmentationRender);
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
function triggerSegmentationRender(toolGroupId) {
    segmentationRenderingEngine.renderToolGroupSegmentations(toolGroupId);
}
export { segmentationRenderingEngine, triggerSegmentationRender };
export default triggerSegmentationRender;
//# sourceMappingURL=triggerSegmentationRender.js.map