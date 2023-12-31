"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const base_1 = require("./base");
const scroll_1 = __importDefault(require("../utilities/scroll"));
class StackScrollMouseWheelTool extends base_1.BaseTool {
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
        const { viewport } = (0, core_1.getEnabledElement)(element);
        const delta = direction * (invert ? -1 : 1);
        const targetId = this.getTargetId(viewport);
        const volumeId = targetId.split('volumeId:')[1];
        (0, scroll_1.default)(viewport, {
            delta,
            debounceLoading: this.configuration.debounceIfNotLoaded,
            loop: this.configuration.loop,
            volumeId,
        });
    }
}
StackScrollMouseWheelTool.toolName = 'StackScrollMouseWheel';
exports.default = StackScrollMouseWheelTool;
//# sourceMappingURL=StackScrollToolMouseWheelTool.js.map