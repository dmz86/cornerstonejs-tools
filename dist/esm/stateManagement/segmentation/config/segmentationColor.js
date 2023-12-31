import { utilities } from '@cornerstonejs/core';
import * as SegmentationState from '../../../stateManagement/segmentation/segmentationState';
import { triggerSegmentationRepresentationModified } from '../triggerSegmentationEvents';
function addColorLUT(colorLUT, colorLUTIndex) {
    if (!colorLUT) {
        throw new Error('addColorLUT: colorLUT is required');
    }
    if (!utilities.isEqual(colorLUT[0], [0, 0, 0, 0])) {
        console.warn('addColorLUT: [0, 0, 0, 0] color is not provided for the background color (segmentIndex =0), automatically adding it');
        colorLUT.unshift([0, 0, 0, 0]);
    }
    SegmentationState.addColorLUT(colorLUT, colorLUTIndex);
}
function setColorLUT(toolGroupId, segmentationRepresentationUID, colorLUTIndex) {
    const segRepresentation = SegmentationState.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
    if (!segRepresentation) {
        throw new Error(`setColorLUT: could not find segmentation representation with UID ${segmentationRepresentationUID}`);
    }
    if (!SegmentationState.getColorLUT(colorLUTIndex)) {
        throw new Error(`setColorLUT: could not find colorLUT with index ${colorLUTIndex}`);
    }
    segRepresentation.colorLUTIndex = colorLUTIndex;
    triggerSegmentationRepresentationModified(toolGroupId, segmentationRepresentationUID);
}
function getColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex) {
    const segmentationRepresentation = SegmentationState.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
    if (!segmentationRepresentation) {
        throw new Error(`segmentation representation with UID ${segmentationRepresentationUID} does not exist for tool group ${toolGroupId}`);
    }
    const { colorLUTIndex } = segmentationRepresentation;
    const colorLUT = SegmentationState.getColorLUT(colorLUTIndex);
    return colorLUT[segmentIndex];
}
function setColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex, color) {
    const colorReference = getColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex);
    for (let i = 0; i < color.length; i++) {
        colorReference[i] = color[i];
    }
    triggerSegmentationRepresentationModified(toolGroupId, segmentationRepresentationUID);
}
export { getColorForSegmentIndex, addColorLUT, setColorLUT, setColorForSegmentIndex, };
//# sourceMappingURL=segmentationColor.js.map