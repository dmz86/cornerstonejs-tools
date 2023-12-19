import { ToolGroupManager } from '../../store';
import { keyEventListener } from '../../eventListeners';
import getMouseModifier from './getMouseModifier';
export default function getToolsWithActionsForMouseEvent(evt, toolModes) {
    const toolsWithActions = new Map();
    const { renderingEngineId, viewportId } = evt.detail;
    const toolGroup = ToolGroupManager.getToolGroupForViewport(viewportId, renderingEngineId);
    if (!toolGroup) {
        return toolsWithActions;
    }
    const toolGroupToolNames = Object.keys(toolGroup.toolOptions);
    const defaultMousePrimary = toolGroup.getDefaultMousePrimary();
    const mouseEvent = evt.detail.event;
    const mouseButton = mouseEvent?.buttons ?? defaultMousePrimary;
    const modifierKey = getMouseModifier(mouseEvent) || keyEventListener.getModifierKey();
    for (let j = 0; j < toolGroupToolNames.length; j++) {
        const toolName = toolGroupToolNames[j];
        const tool = toolGroup.getToolInstance(toolName);
        const actions = tool.configuration?.actions;
        if (!actions?.length || !toolModes.includes(tool.mode)) {
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
//# sourceMappingURL=getToolsWithActionsForMouseEvent.js.map