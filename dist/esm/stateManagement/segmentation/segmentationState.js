import { defaultSegmentationStateManager } from './SegmentationStateManager';
import { triggerSegmentationModified, triggerSegmentationRemoved, triggerSegmentationRepresentationModified, triggerSegmentationRepresentationRemoved, } from './triggerSegmentationEvents';
import normalizeSegmentationInput from './helpers/normalizeSegmentationInput';
function getDefaultSegmentationStateManager() {
    return defaultSegmentationStateManager;
}
function getSegmentation(segmentationId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentation(segmentationId);
}
function getSegmentations() {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    const state = segmentationStateManager.getState();
    return state.segmentations;
}
function addSegmentation(segmentationInput, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    const segmentation = normalizeSegmentationInput(segmentationInput);
    segmentationStateManager.addSegmentation(segmentation);
    if (!suppressEvents) {
        triggerSegmentationModified(segmentation.segmentationId);
    }
}
function getSegmentationRepresentations(toolGroupId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentationRepresentations(toolGroupId);
}
function getAllSegmentationRepresentations() {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getAllSegmentationRepresentations();
}
function getToolGroupIdsWithSegmentation(segmentationId) {
    if (!segmentationId) {
        throw new Error('getToolGroupIdsWithSegmentation: segmentationId is empty');
    }
    const segmentationStateManager = getDefaultSegmentationStateManager();
    const state = segmentationStateManager.getState();
    const toolGroupIds = Object.keys(state.toolGroups);
    const foundToolGroupIds = [];
    toolGroupIds.forEach((toolGroupId) => {
        const toolGroupSegmentationRepresentations = segmentationStateManager.getSegmentationRepresentations(toolGroupId);
        toolGroupSegmentationRepresentations.forEach((representation) => {
            if (representation.segmentationId === segmentationId) {
                foundToolGroupIds.push(toolGroupId);
            }
        });
    });
    return foundToolGroupIds;
}
function getToolGroupSpecificConfig(toolGroupId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getToolGroupSpecificConfig(toolGroupId);
}
function setToolGroupSpecificConfig(toolGroupId, config, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setSegmentationRepresentationConfig(toolGroupId, config);
    if (!suppressEvents) {
        triggerSegmentationRepresentationModified(toolGroupId);
    }
}
function setSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID, config, suppressEvents = false) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID, config);
    if (!suppressEvents) {
        triggerSegmentationRepresentationModified(toolGroupId, segmentationRepresentationUID);
    }
}
function getSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID);
}
function getSegmentSpecificRepresentationConfig(toolGroupId, segmentationRepresentationUID, segmentIndex) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentSpecificConfig(toolGroupId, segmentationRepresentationUID, segmentIndex);
}
function setSegmentSpecificRepresentationConfig(toolGroupId, segmentationRepresentationUID, config, suppressEvents = false) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setSegmentSpecificConfig(toolGroupId, segmentationRepresentationUID, config);
    if (!suppressEvents) {
        triggerSegmentationRepresentationModified(toolGroupId, segmentationRepresentationUID);
    }
}
function addSegmentationRepresentation(toolGroupId, segmentationRepresentation, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.addSegmentationRepresentation(toolGroupId, segmentationRepresentation);
    if (!suppressEvents) {
        triggerSegmentationRepresentationModified(toolGroupId, segmentationRepresentation.segmentationRepresentationUID);
    }
}
function getGlobalConfig() {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getGlobalConfig();
}
function setGlobalConfig(config, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setGlobalConfig(config);
    if (!suppressEvents) {
        triggerSegmentationModified();
    }
}
function getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
}
function removeSegmentation(segmentationId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.removeSegmentation(segmentationId);
    triggerSegmentationRemoved(segmentationId);
}
function removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID);
    triggerSegmentationRepresentationRemoved(toolGroupId, segmentationRepresentationUID);
}
function removeColorLUT(colorLUTIndex) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.removeColorLUT(colorLUTIndex);
}
function getColorLUT(index) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getColorLUT(index);
}
function addColorLUT(colorLUT, index) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.addColorLUT(colorLUT, index);
}
export { getDefaultSegmentationStateManager, getSegmentation, getSegmentations, addSegmentation, removeSegmentation, getSegmentationRepresentations, addSegmentationRepresentation, removeSegmentationRepresentation, getToolGroupSpecificConfig, setToolGroupSpecificConfig, getGlobalConfig, setGlobalConfig, getSegmentationRepresentationSpecificConfig, setSegmentationRepresentationSpecificConfig, getSegmentSpecificRepresentationConfig, setSegmentSpecificRepresentationConfig, getToolGroupIdsWithSegmentation, getAllSegmentationRepresentations, getSegmentationRepresentationByUID, addColorLUT, getColorLUT, removeColorLUT, };
//# sourceMappingURL=segmentationState.js.map