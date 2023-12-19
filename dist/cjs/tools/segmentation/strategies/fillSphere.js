"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillOutsideSphere = exports.thresholdInsideSphere = exports.fillInsideSphere = void 0;
const core_1 = require("@cornerstonejs/core");
const triggerSegmentationEvents_1 = require("../../../stateManagement/segmentation/triggerSegmentationEvents");
const utilities_1 = require("../../../utilities");
const isWithinThreshold_1 = __importDefault(require("./utils/isWithinThreshold"));
function fillSphere(enabledElement, operationData, _inside = true, threshold = false) {
    const { viewport } = enabledElement;
    const { volume: segmentation, segmentsLocked, segmentIndex, imageVolume, strategySpecificConfiguration, segmentationId, points, } = operationData;
    const { imageData, dimensions } = segmentation;
    const scalarData = segmentation.getScalarData();
    const scalarIndex = [];
    let callback;
    if (threshold) {
        callback = ({ value, index, pointIJK }) => {
            if (segmentsLocked.includes(value)) {
                return;
            }
            if ((0, isWithinThreshold_1.default)(index, imageVolume, strategySpecificConfiguration)) {
                scalarData[index] = segmentIndex;
                scalarIndex.push(index);
            }
        };
    }
    else {
        callback = ({ index, value }) => {
            if (segmentsLocked.includes(value)) {
                return;
            }
            scalarData[index] = segmentIndex;
            scalarIndex.push(index);
        };
    }
    (0, utilities_1.pointInSurroundingSphereCallback)(imageData, [points[0], points[1]], callback, viewport);
    const zMultiple = dimensions[0] * dimensions[1];
    const minSlice = Math.floor(scalarIndex[0] / zMultiple);
    const maxSlice = Math.floor(scalarIndex[scalarIndex.length - 1] / zMultiple);
    const sliceArray = Array.from({ length: maxSlice - minSlice + 1 }, (v, k) => k + minSlice);
    (0, triggerSegmentationEvents_1.triggerSegmentationDataModified)(segmentationId, sliceArray);
}
function fillInsideSphere(enabledElement, operationData) {
    fillSphere(enabledElement, operationData, true);
}
exports.fillInsideSphere = fillInsideSphere;
function thresholdInsideSphere(enabledElement, operationData) {
    const { volume, imageVolume } = operationData;
    if (!core_1.utilities.isEqual(volume.dimensions, imageVolume.dimensions) ||
        !core_1.utilities.isEqual(volume.direction, imageVolume.direction)) {
        throw new Error('Only source data the same dimensions/size/orientation as the segmentation currently supported.');
    }
    fillSphere(enabledElement, operationData, true, true);
}
exports.thresholdInsideSphere = thresholdInsideSphere;
function fillOutsideSphere(enabledElement, operationData) {
    fillSphere(enabledElement, operationData, false);
}
exports.fillOutsideSphere = fillOutsideSphere;
//# sourceMappingURL=fillSphere.js.map