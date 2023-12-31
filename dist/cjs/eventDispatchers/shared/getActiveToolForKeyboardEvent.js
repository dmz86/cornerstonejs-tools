"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../../store");
const enums_1 = require("../../enums");
const eventListeners_1 = require("../../eventListeners");
const mouseDownListener_1 = require("../../eventListeners/mouse/mouseDownListener");
const { Active } = enums_1.ToolModes;
function getActiveToolForKeyboardEvent(evt) {
    const { renderingEngineId, viewportId } = evt.detail;
    const mouseButton = (0, mouseDownListener_1.getMouseButton)();
    const modifierKey = eventListeners_1.keyEventListener.getModifierKey();
    const toolGroup = store_1.ToolGroupManager.getToolGroupForViewport(viewportId, renderingEngineId);
    if (!toolGroup) {
        return null;
    }
    const toolGroupToolNames = Object.keys(toolGroup.toolOptions);
    const defaultMousePrimary = toolGroup.getDefaultMousePrimary();
    for (let j = 0; j < toolGroupToolNames.length; j++) {
        const toolName = toolGroupToolNames[j];
        const toolOptions = toolGroup.toolOptions[toolName];
        const correctBinding = toolOptions.bindings.length &&
            toolOptions.bindings.some((binding) => binding.mouseButton === (mouseButton !== null && mouseButton !== void 0 ? mouseButton : defaultMousePrimary) &&
                binding.modifierKey === modifierKey);
        if (toolOptions.mode === Active && correctBinding) {
            return toolGroup.getToolInstance(toolName);
        }
    }
}
exports.default = getActiveToolForKeyboardEvent;
//# sourceMappingURL=getActiveToolForKeyboardEvent.js.map