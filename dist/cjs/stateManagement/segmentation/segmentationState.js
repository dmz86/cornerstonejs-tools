"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeColorLUT = exports.getColorLUT = exports.addColorLUT = exports.getSegmentationRepresentationByUID = exports.getAllSegmentationRepresentations = exports.getToolGroupIdsWithSegmentation = exports.setSegmentSpecificRepresentationConfig = exports.getSegmentSpecificRepresentationConfig = exports.setSegmentationRepresentationSpecificConfig = exports.getSegmentationRepresentationSpecificConfig = exports.setGlobalConfig = exports.getGlobalConfig = exports.setToolGroupSpecificConfig = exports.getToolGroupSpecificConfig = exports.removeSegmentationRepresentation = exports.addSegmentationRepresentation = exports.getSegmentationRepresentations = exports.removeSegmentation = exports.addSegmentation = exports.getSegmentations = exports.getSegmentation = exports.getDefaultSegmentationStateManager = void 0;
const SegmentationStateManager_1 = require("./SegmentationStateManager");
const triggerSegmentationEvents_1 = require("./triggerSegmentationEvents");
const normalizeSegmentationInput_1 = __importDefault(require("./helpers/normalizeSegmentationInput"));
function getDefaultSegmentationStateManager() {
    return SegmentationStateManager_1.defaultSegmentationStateManager;
}
exports.getDefaultSegmentationStateManager = getDefaultSegmentationStateManager;
function getSegmentation(segmentationId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentation(segmentationId);
}
exports.getSegmentation = getSegmentation;
function getSegmentations() {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    const state = segmentationStateManager.getState();
    return state.segmentations;
}
exports.getSegmentations = getSegmentations;
function addSegmentation(segmentationInput, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    const segmentation = (0, normalizeSegmentationInput_1.default)(segmentationInput);
    segmentationStateManager.addSegmentation(segmentation);
    if (!suppressEvents) {
        (0, triggerSegmentationEvents_1.triggerSegmentationModified)(segmentation.segmentationId);
    }
}
exports.addSegmentation = addSegmentation;
function getSegmentationRepresentations(toolGroupId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentationRepresentations(toolGroupId);
}
exports.getSegmentationRepresentations = getSegmentationRepresentations;
function getAllSegmentationRepresentations() {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getAllSegmentationRepresentations();
}
exports.getAllSegmentationRepresentations = getAllSegmentationRepresentations;
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
exports.getToolGroupIdsWithSegmentation = getToolGroupIdsWithSegmentation;
function getToolGroupSpecificConfig(toolGroupId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getToolGroupSpecificConfig(toolGroupId);
}
exports.getToolGroupSpecificConfig = getToolGroupSpecificConfig;
function setToolGroupSpecificConfig(toolGroupId, config, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setSegmentationRepresentationConfig(toolGroupId, config);
    if (!suppressEvents) {
        (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationModified)(toolGroupId);
    }
}
exports.setToolGroupSpecificConfig = setToolGroupSpecificConfig;
function setSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID, config, suppressEvents = false) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID, config);
    if (!suppressEvents) {
        (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationModified)(toolGroupId, segmentationRepresentationUID);
    }
}
exports.setSegmentationRepresentationSpecificConfig = setSegmentationRepresentationSpecificConfig;
function getSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID);
}
exports.getSegmentationRepresentationSpecificConfig = getSegmentationRepresentationSpecificConfig;
function getSegmentSpecificRepresentationConfig(toolGroupId, segmentationRepresentationUID, segmentIndex) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentSpecificConfig(toolGroupId, segmentationRepresentationUID, segmentIndex);
}
exports.getSegmentSpecificRepresentationConfig = getSegmentSpecificRepresentationConfig;
function setSegmentSpecificRepresentationConfig(toolGroupId, segmentationRepresentationUID, config, suppressEvents = false) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setSegmentSpecificConfig(toolGroupId, segmentationRepresentationUID, config);
    if (!suppressEvents) {
        (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationModified)(toolGroupId, segmentationRepresentationUID);
    }
}
exports.setSegmentSpecificRepresentationConfig = setSegmentSpecificRepresentationConfig;
function addSegmentationRepresentation(toolGroupId, segmentationRepresentation, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.addSegmentationRepresentation(toolGroupId, segmentationRepresentation);
    if (!suppressEvents) {
        (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationModified)(toolGroupId, segmentationRepresentation.segmentationRepresentationUID);
    }
}
exports.addSegmentationRepresentation = addSegmentationRepresentation;
function getGlobalConfig() {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getGlobalConfig();
}
exports.getGlobalConfig = getGlobalConfig;
function setGlobalConfig(config, suppressEvents) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.setGlobalConfig(config);
    if (!suppressEvents) {
        (0, triggerSegmentationEvents_1.triggerSegmentationModified)();
    }
}
exports.setGlobalConfig = setGlobalConfig;
function getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
}
exports.getSegmentationRepresentationByUID = getSegmentationRepresentationByUID;
function removeSegmentation(segmentationId) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.removeSegmentation(segmentationId);
    (0, triggerSegmentationEvents_1.triggerSegmentationRemoved)(segmentationId);
}
exports.removeSegmentation = removeSegmentation;
function removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID);
    (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationRemoved)(toolGroupId, segmentationRepresentationUID);
}
exports.removeSegmentationRepresentation = removeSegmentationRepresentation;
function removeColorLUT(colorLUTIndex) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.removeColorLUT(colorLUTIndex);
}
exports.removeColorLUT = removeColorLUT;
function getColorLUT(index) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    return segmentationStateManager.getColorLUT(index);
}
exports.getColorLUT = getColorLUT;
function addColorLUT(colorLUT, index) {
    const segmentationStateManager = getDefaultSegmentationStateManager();
    segmentationStateManager.addColorLUT(colorLUT, index);
}
exports.addColorLUT = addColorLUT;
//# sourceMappingURL=segmentationState.js.map