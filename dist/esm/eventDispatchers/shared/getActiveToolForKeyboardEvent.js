import { ToolGroupManager } from '../../store';
import { ToolModes } from '../../enums';
import { keyEventListener } from '../../eventListeners';
import { getMouseButton } from '../../eventListeners/mouse/mouseDownListener';
const { Active } = ToolModes;
export default function getActiveToolForKeyboardEvent(evt) {
    const { renderingEngineId, viewportId } = evt.detail;
    const mouseButton = getMouseButton();
    const modifierKey = keyEventListener.getModifierKey();
    const toolGroup = ToolGroupManager.getToolGroupForViewport(viewportId, renderingEngineId);
    if (!toolGroup) {
        return null;
    }
    const toolGroupToolNames = Object.keys(toolGroup.toolOptions);
    const defaultMousePrimary = toolGroup.getDefaultMousePrimary();
    for (let j = 0; j < toolGroupToolNames.length; j++) {
        const toolName = toolGroupToolNames[j];
        const toolOptions = toolGroup.toolOptions[toolName];
        const correctBinding = toolOptions.bindings.length &&
            toolOptions.bindings.some((binding) => binding.mouseButton === (mouseButton ?? defaultMousePrimary) &&
                binding.modifierKey === modifierKey);
        if (toolOptions.mode === Active && correctBinding) {
            return toolGroup.getToolInstance(toolName);
        }
    }
}
//# sourceMappingURL=getActiveToolForKeyboardEvent.js.map