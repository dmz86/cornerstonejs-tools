"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVolumes = exports.getVoxelOverlap = void 0;
const core_1 = require("@cornerstonejs/core");
const ToolGroupManager_1 = require("../../store/ToolGroupManager");
const BrushTool_1 = __importDefault(require("../../tools/segmentation/BrushTool"));
const getBoundingBoxAroundShape_1 = __importDefault(require("../boundingBox/getBoundingBoxAroundShape"));
function getBrushToolInstances(toolGroupId, toolName) {
    const toolGroup = (0, ToolGroupManager_1.getToolGroup)(toolGroupId);
    if (toolGroup === undefined) {
        return;
    }
    const toolInstances = toolGroup._toolInstances;
    if (!Object.keys(toolInstances).length) {
        return;
    }
    if (toolName && toolInstances[toolName]) {
        return [toolInstances[toolName]];
    }
    const brushBasedToolInstances = Object.values(toolInstances).filter((toolInstance) => toolInstance instanceof BrushTool_1.default);
    return brushBasedToolInstances;
}
exports.default = getBrushToolInstances;
const equalsCheck = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
};
function getVoxelOverlap(imageData, dimensions, voxelSpacing, voxelCenter) {
    const voxelCornersWorld = [];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 2; k++) {
                const point = [...voxelCenter];
                point[0] = point[0] + ((i * 2 - 1) * voxelSpacing[0]) / 2;
                point[1] = point[1] + ((j * 2 - 1) * voxelSpacing[1]) / 2;
                point[2] = point[2] + ((k * 2 - 1) * voxelSpacing[2]) / 2;
                voxelCornersWorld.push(point);
            }
        }
    }
    const voxelCornersIJK = voxelCornersWorld.map((world) => core_1.utilities.transformWorldToIndex(imageData, world));
    const overlapBounds = (0, getBoundingBoxAroundShape_1.default)(voxelCornersIJK, dimensions);
    return overlapBounds;
}
exports.getVoxelOverlap = getVoxelOverlap;
function processVolumes(segmentationVolume, thresholdVolumeInformation) {
    const { spacing: segmentationSpacing } = segmentationVolume;
    const scalarData = segmentationVolume.getScalarData();
    const volumeInfoList = [];
    let baseVolumeIdx = 0;
    for (let i = 0; i < thresholdVolumeInformation.length; i++) {
        const { imageData, spacing, dimensions } = thresholdVolumeInformation[i].volume;
        const volumeSize = thresholdVolumeInformation[i].volume.getScalarData().length;
        if (volumeSize === scalarData.length &&
            equalsCheck(spacing, segmentationSpacing)) {
            baseVolumeIdx = i;
        }
        const referenceValues = imageData.getPointData().getScalars().getData();
        const lower = thresholdVolumeInformation[i].lower;
        const upper = thresholdVolumeInformation[i].upper;
        volumeInfoList.push({
            imageData,
            referenceValues,
            lower,
            upper,
            spacing,
            dimensions,
            volumeSize,
        });
    }
    return {
        volumeInfoList,
        baseVolumeIdx,
    };
}
exports.processVolumes = processVolumes;
//# sourceMappingURL=utilities.js.map