import { utilities as csUtils } from '@cornerstonejs/core';
import { triggerSegmentationDataModified } from '../../../stateManagement/segmentation/triggerSegmentationEvents';
import { pointInSurroundingSphereCallback } from '../../../utilities';
import isWithinThreshold from './utils/isWithinThreshold';
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
            if (isWithinThreshold(index, imageVolume, strategySpecificConfiguration)) {
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
    pointInSurroundingSphereCallback(imageData, [points[0], points[1]], callback, viewport);
    const zMultiple = dimensions[0] * dimensions[1];
    const minSlice = Math.floor(scalarIndex[0] / zMultiple);
    const maxSlice = Math.floor(scalarIndex[scalarIndex.length - 1] / zMultiple);
    const sliceArray = Array.from({ length: maxSlice - minSlice + 1 }, (v, k) => k + minSlice);
    triggerSegmentationDataModified(segmentationId, sliceArray);
}
export function fillInsideSphere(enabledElement, operationData) {
    fillSphere(enabledElement, operationData, true);
}
export function thresholdInsideSphere(enabledElement, operationData) {
    const { volume, imageVolume } = operationData;
    if (!csUtils.isEqual(volume.dimensions, imageVolume.dimensions) ||
        !csUtils.isEqual(volume.direction, imageVolume.direction)) {
        throw new Error('Only source data the same dimensions/size/orientation as the segmentation currently supported.');
    }
    fillSphere(enabledElement, operationData, true, true);
}
export function fillOutsideSphere(enabledElement, operationData) {
    fillSphere(enabledElement, operationData, false);
}
//# sourceMappingURL=fillSphere.js.map