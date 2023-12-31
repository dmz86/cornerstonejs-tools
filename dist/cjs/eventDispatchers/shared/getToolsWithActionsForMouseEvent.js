"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../../store");
const eventListeners_1 = require("../../eventListeners");
const getMouseModifier_1 = __importDefault(require("./getMouseModifier"));
function getToolsWithActionsForMouseEvent(evt, toolModes) {
    var _a, _b;
    const toolsWithActions = new Map();
    const { renderingEngineId, viewportId } = evt.detail;
    const toolGroup = store_1.ToolGroupManager.getToolGroupForViewport(viewportId, renderingEngineId);
    if (!toolGroup) {
        return toolsWithActions;
    }
    const toolGroupToolNames = Object.keys(toolGroup.toolOptions);
    const defaultMousePrimary = toolGroup.getDefaultMousePrimary();
    const mouseEvent = evt.detail.event;
    const mouseButton = (_a = mouseEvent === null || mouseEvent === void 0 ? void 0 : mouseEvent.buttons) !== null && _a !== void 0 ? _a : defaultMousePrimary;
    const modifierKey = (0, getMouseModifier_1.default)(mouseEvent) || eventListeners_1.keyEventListener.getModifierKey();
    for (let j = 0; j < toolGroupToolNames.length; j++) {
        const toolName = toolGroupToolNames[j];
        const tool = toolGroup.getToolInstance(toolName);
        const actions = (_b = tool.configuration) === null || _b === void 0 ? void 0 : _b.actions;
        if (!(actions === null || actions === void 0 ? void 0 : actions.length) || !toolModes.includes(tool.mode)) {
            continue;
        }
        const action = actions.find((action) => action.bindings.length &&
            action.bindings.some((binding) => binding.mouseButton === mouseButton &&
                binding.modifierKey === modifierKey));
        if (action) {
            toolsWithActions.set(tool, action);
        }
    }
    return toolsWithActions;
}
exports.default = getToolsWithActionsForMouseEvent;
//# sourceMappingURL=getToolsWithActionsForMouseEvent.js.map