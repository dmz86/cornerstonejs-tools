import { getEnabledElement } from '@cornerstonejs/core';
import { BaseTool } from './base';
import scroll from '../utilities/scroll';
class StackScrollMouseWheelTool extends BaseTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            invert: false,
            debounceIfNotLoaded: true,
            loop: false,
        },
    }) {
        super(toolProps, defaultToolProps);
    }
    mouseWheelCallback(evt) {
        const { wheel, element } = evt.detail;
        const { direction } = wheel;
        const { invert } = this.configuration;
        const { viewport } = getEnabledElement(element);
        const delta = direction * (invert ? -1 : 1);
        const targetId = this.getTargetId(viewport);
        const volumeId = targetId.split('volumeId:')[1];
        scroll(viewport, {
            delta,
            debounceLoading: this.configuration.debounceIfNotLoaded,
            loop: this.configuration.loop,
            volumeId,
        });
    }
}
StackScrollMouseWheelTool.toolName = 'StackScrollMouseWheel';
export default StackScrollMouseWheelTool;
//# sourceMappingURL=StackScrollToolMouseWheelTool.js.map