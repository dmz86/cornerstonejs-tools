"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerAnnotationAddedForFOR = exports.triggerAnnotationAddedForElement = void 0;
const core_1 = require("@cornerstonejs/core");
const enums_1 = require("../../../enums");
const ToolGroupManager_1 = require("../../../store/ToolGroupManager");
function triggerAnnotationAddedForElement(annotation, element) {
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { renderingEngine, viewportId } = enabledElement;
    const eventType = enums_1.Events.ANNOTATION_ADDED;
    const eventDetail = {
        annotation,
        viewportId,
        renderingEngineId: renderingEngine.id,
    };
    (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
}
exports.triggerAnnotationAddedForElement = triggerAnnotationAddedForElement;
function triggerAnnotationAddedForFOR(annotation) {
    const { toolName } = annotation.metadata;
    const toolGroups = (0, ToolGroupManager_1.getToolGroupsWithToolName)(toolName);
    if (!toolGroups.length) {
        return;
    }
    const viewportsToRender = [];
    toolGroups.forEach((toolGroup) => {
        toolGroup.viewportsInfo.forEach((viewportInfo) => {
            const { renderingEngineId, viewportId } = viewportInfo;
            const { FrameOfReferenceUID } = (0, core_1.getEnabledElementByIds)(viewportId, renderingEngineId);
            if (annotation.metadata.FrameOfReferenceUID === FrameOfReferenceUID) {
                viewportsToRender.push(viewportInfo);
            }
        });
    });
    if (!viewportsToRender.length) {
        return;
    }
    const eventType = enums_1.Events.ANNOTATION_ADDED;
    viewportsToRender.forEach(({ renderingEngineId, viewportId }) => {
        const eventDetail = {
            annotation,
            viewportId,
            renderingEngineId,
        };
        (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
    });
}
exports.triggerAnnotationAddedForFOR = triggerAnnotationAddedForFOR;
//# sourceMappingURL=state.js.map