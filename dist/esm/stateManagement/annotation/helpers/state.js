import { getEnabledElement, triggerEvent, eventTarget, getEnabledElementByIds, } from '@cornerstonejs/core';
import { Events } from '../../../enums';
import { getToolGroupsWithToolName } from '../../../store/ToolGroupManager';
function triggerAnnotationAddedForElement(annotation, element) {
    const enabledElement = getEnabledElement(element);
    const { renderingEngine, viewportId } = enabledElement;
    const eventType = Events.ANNOTATION_ADDED;
    const eventDetail = {
        annotation,
        viewportId,
        renderingEngineId: renderingEngine.id,
    };
    triggerEvent(eventTarget, eventType, eventDetail);
}
function triggerAnnotationAddedForFOR(annotation) {
    const { toolName } = annotation.metadata;
    const toolGroups = getToolGroupsWithToolName(toolName);
    if (!toolGroups.length) {
        return;
    }
    const viewportsToRender = [];
    toolGroups.forEach((toolGroup) => {
        toolGroup.viewportsInfo.forEach((viewportInfo) => {
            const { renderingEngineId, viewportId } = viewportInfo;
            const { FrameOfReferenceUID } = getEnabledElementByIds(viewportId, renderingEngineId);
            if (annotation.metadata.FrameOfReferenceUID === FrameOfReferenceUID) {
                viewportsToRender.push(viewportInfo);
            }
        });
    });
    if (!viewportsToRender.length) {
        return;
    }
    const eventType = Events.ANNOTATION_ADDED;
    viewportsToRender.forEach(({ renderingEngineId, viewportId }) => {
        const eventDetail = {
            annotation,
            viewportId,
            renderingEngineId,
        };
        triggerEvent(eventTarget, eventType, eventDetail);
    });
}
export { triggerAnnotationAddedForElement, triggerAnnotationAddedForFOR };
//# sourceMappingURL=state.js.map