"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSegmentationStateManager = void 0;
const core_1 = require("@cornerstonejs/core");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const COLOR_LUT_1 = __importDefault(require("../../constants/COLOR_LUT"));
const enums_1 = require("../../enums");
const contourConfig_1 = __importDefault(require("../../tools/displayTools/Contour/contourConfig"));
const labelmapConfig_1 = __importDefault(require("../../tools/displayTools/Labelmap/labelmapConfig"));
const defaultLabelmapConfig = (0, labelmapConfig_1.default)();
const defaultContourConfig = (0, contourConfig_1.default)();
const newGlobalConfig = {
    renderInactiveSegmentations: true,
    representations: {
        [enums_1.SegmentationRepresentations.Labelmap]: defaultLabelmapConfig,
        [enums_1.SegmentationRepresentations.Contour]: defaultContourConfig,
    },
};
const initialDefaultState = {
    colorLUT: [],
    segmentations: [],
    globalConfig: newGlobalConfig,
    toolGroups: {},
};
class SegmentationStateManager {
    constructor(uid) {
        if (!uid) {
            uid = core_1.utilities.uuidv4();
        }
        this.state = (0, lodash_clonedeep_1.default)(initialDefaultState);
        this.uid = uid;
    }
    getState() {
        return this.state;
    }
    getToolGroups() {
        return Object.keys(this.state.toolGroups);
    }
    getColorLUT(lutIndex) {
        return this.state.colorLUT[lutIndex];
    }
    resetState() {
        this.state = (0, lodash_clonedeep_1.default)(initialDefaultState);
    }
    getSegmentation(segmentationId) {
        return this.state.segmentations.find((segmentation) => segmentation.segmentationId === segmentationId);
    }
    addSegmentation(segmentation) {
        this._initDefaultColorLUTIfNecessary();
        if (this.getSegmentation(segmentation.segmentationId)) {
            throw new Error(`Segmentation with id ${segmentation.segmentationId} already exists`);
        }
        this.state.segmentations.push(segmentation);
    }
    getSegmentationRepresentations(toolGroupId) {
        const toolGroupSegRepresentationsWithConfig = this.state.toolGroups[toolGroupId];
        if (!toolGroupSegRepresentationsWithConfig) {
            return;
        }
        return toolGroupSegRepresentationsWithConfig.segmentationRepresentations;
    }
    getAllSegmentationRepresentations() {
        const toolGroupSegReps = {};
        Object.entries(this.state.toolGroups).forEach(([toolGroupId, toolGroupSegRepresentationsWithConfig]) => {
            toolGroupSegReps[toolGroupId] =
                toolGroupSegRepresentationsWithConfig.segmentationRepresentations;
        });
        return toolGroupSegReps;
    }
    addSegmentationRepresentation(toolGroupId, segmentationRepresentation) {
        if (!this.state.toolGroups[toolGroupId]) {
            this.state.toolGroups[toolGroupId] = {
                segmentationRepresentations: [],
                config: {},
            };
        }
        this.state.toolGroups[toolGroupId].segmentationRepresentations.push(segmentationRepresentation);
        this._handleActiveSegmentation(toolGroupId, segmentationRepresentation);
    }
    getGlobalConfig() {
        return this.state.globalConfig;
    }
    setGlobalConfig(config) {
        this.state.globalConfig = config;
    }
    getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID) {
        const toolGroupSegRepresentations = this.getSegmentationRepresentations(toolGroupId);
        const segmentationData = toolGroupSegRepresentations.find((representation) => representation.segmentationRepresentationUID ===
            segmentationRepresentationUID);
        return segmentationData;
    }
    removeSegmentation(segmentationId) {
        this.state.segmentations = this.state.segmentations.filter((segmentation) => segmentation.segmentationId !== segmentationId);
    }
    removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID) {
        const toolGroupSegmentationRepresentations = this.getSegmentationRepresentations(toolGroupId);
        if (!toolGroupSegmentationRepresentations ||
            !toolGroupSegmentationRepresentations.length) {
            throw new Error(`No viewport specific segmentation state found for viewport ${toolGroupId}`);
        }
        const state = toolGroupSegmentationRepresentations;
        const index = state.findIndex((segData) => segData.segmentationRepresentationUID === segmentationRepresentationUID);
        if (index === -1) {
            console.warn(`No viewport specific segmentation state data found for viewport ${toolGroupId} and segmentation data UID ${segmentationRepresentationUID}`);
        }
        const removedSegmentationRepresentation = toolGroupSegmentationRepresentations[index];
        toolGroupSegmentationRepresentations.splice(index, 1);
        this._handleActiveSegmentation(toolGroupId, removedSegmentationRepresentation);
    }
    setActiveSegmentationRepresentation(toolGroupId, segmentationRepresentationUID) {
        const toolGroupSegmentations = this.getSegmentationRepresentations(toolGroupId);
        if (!toolGroupSegmentations || !toolGroupSegmentations.length) {
            throw new Error(`No segmentation data found for toolGroupId: ${toolGroupId}`);
        }
        const segmentationData = toolGroupSegmentations.find((segmentationData) => segmentationData.segmentationRepresentationUID ===
            segmentationRepresentationUID);
        if (!segmentationData) {
            throw new Error(`No segmentation data found for segmentation data UID ${segmentationRepresentationUID}`);
        }
        segmentationData.active = true;
        this._handleActiveSegmentation(toolGroupId, segmentationData);
    }
    getToolGroupSpecificConfig(toolGroupId) {
        const toolGroupStateWithConfig = this.state.toolGroups[toolGroupId];
        if (!toolGroupStateWithConfig) {
            return;
        }
        return toolGroupStateWithConfig.config;
    }
    getSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID) {
        const segmentationRepresentation = this.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
        if (!segmentationRepresentation) {
            return;
        }
        return segmentationRepresentation.segmentationRepresentationSpecificConfig;
    }
    setSegmentationRepresentationSpecificConfig(toolGroupId, segmentationRepresentationUID, config) {
        const segmentationRepresentation = this.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
        if (!segmentationRepresentation) {
            return;
        }
        segmentationRepresentation.segmentationRepresentationSpecificConfig =
            config;
    }
    getSegmentSpecificConfig(toolGroupId, segmentationRepresentationUID, segmentIndex) {
        const segmentationRepresentation = this.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
        if (!segmentationRepresentation) {
            return;
        }
        return segmentationRepresentation.segmentSpecificConfig[segmentIndex];
    }
    setSegmentSpecificConfig(toolGroupId, segmentationRepresentationUID, config) {
        const segmentationRepresentation = this.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
        if (!segmentationRepresentation) {
            return;
        }
        segmentationRepresentation.segmentSpecificConfig = config;
    }
    setSegmentationRepresentationConfig(toolGroupId, config) {
        let toolGroupStateWithConfig = this.state.toolGroups[toolGroupId];
        if (!toolGroupStateWithConfig) {
            this.state.toolGroups[toolGroupId] = {
                segmentationRepresentations: [],
                config: {
                    renderInactiveSegmentations: true,
                    representations: {},
                },
            };
            toolGroupStateWithConfig = this.state.toolGroups[toolGroupId];
        }
        toolGroupStateWithConfig.config = Object.assign(Object.assign({}, toolGroupStateWithConfig.config), config);
    }
    addColorLUT(colorLUT, lutIndex) {
        if (this.state.colorLUT[lutIndex]) {
            console.log('Color LUT table already exists, overwriting');
        }
        this.state.colorLUT[lutIndex] = colorLUT;
    }
    removeColorLUT(colorLUTIndex) {
        delete this.state.colorLUT[colorLUTIndex];
    }
    _handleActiveSegmentation(toolGroupId, recentlyAddedOrRemovedSegmentationRepresentation) {
        const segmentationRepresentations = this.getSegmentationRepresentations(toolGroupId);
        if (segmentationRepresentations.length === 0) {
            return;
        }
        if (segmentationRepresentations.length === 1) {
            segmentationRepresentations[0].active = true;
            return;
        }
        const activeSegmentationRepresentations = segmentationRepresentations.filter((representation) => representation.active);
        if (activeSegmentationRepresentations.length === 0) {
            segmentationRepresentations[0].active = true;
            return;
        }
        if (recentlyAddedOrRemovedSegmentationRepresentation.active) {
            segmentationRepresentations.forEach((representation) => {
                if (representation.segmentationRepresentationUID !==
                    recentlyAddedOrRemovedSegmentationRepresentation.segmentationRepresentationUID) {
                    representation.active = false;
                }
            });
        }
    }
    _initDefaultColorLUTIfNecessary() {
        if (this.state.colorLUT.length === 0 || !this.state.colorLUT[0]) {
            this.addColorLUT(COLOR_LUT_1.default, 0);
        }
    }
}
exports.default = SegmentationStateManager;
const defaultSegmentationStateManager = new SegmentationStateManager('DEFAULT');
exports.defaultSegmentationStateManager = defaultSegmentationStateManager;
//# sourceMappingURL=SegmentationStateManager.js.map