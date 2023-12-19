import { utilities, cache } from '@cornerstonejs/core';
import { getVoxelOverlap } from '../segmentation/utilities';
import pointInShapeCallback from '../pointInShapeCallback';
function getDataInTime(dynamicVolume, options) {
    let dataInTime;
    const frames = options.frameNumbers || [
        ...Array(dynamicVolume.numTimePoints).keys(),
    ];
    if (!options.maskVolumeId && !options.imageCoordinate) {
        throw new Error('You should provide either maskVolumeId or imageCoordinate');
    }
    if (options.maskVolumeId && options.imageCoordinate) {
        throw new Error('You can only use one of maskVolumeId or imageCoordinate');
    }
    if (options.maskVolumeId) {
        const segmentationVolume = cache.getVolume(options.maskVolumeId);
        const dataInTime = _getTimePointDataMask(frames, dynamicVolume, segmentationVolume);
        return dataInTime;
    }
    if (options.imageCoordinate) {
        const dataInTime = _getTimePointDataCoordinate(frames, options.imageCoordinate, dynamicVolume);
        return dataInTime;
    }
    return dataInTime;
}
function _getTimePointDataCoordinate(frames, coordinate, volume) {
    const { dimensions, imageData } = volume;
    const index = imageData.worldToIndex(coordinate);
    index[0] = Math.floor(index[0]);
    index[1] = Math.floor(index[1]);
    index[2] = Math.floor(index[2]);
    if (!utilities.indexWithinDimensions(index, dimensions)) {
        throw new Error('outside bounds');
    }
    const yMultiple = dimensions[0];
    const zMultiple = dimensions[0] * dimensions[1];
    const allScalarData = volume.getScalarDataArrays();
    const value = [];
    frames.forEach((frame) => {
        const activeScalarData = allScalarData[frame];
        const scalarIndex = index[2] * zMultiple + index[1] * yMultiple + index[0];
        value.push(activeScalarData[scalarIndex]);
    });
    return value;
}
function _getTimePointDataMask(frames, dynamicVolume, segmentationVolume) {
    const { imageData: maskImageData } = segmentationVolume;
    const segScalarData = segmentationVolume.getScalarData();
    const len = segScalarData.length;
    const nonZeroVoxelIndices = [];
    nonZeroVoxelIndices.length = len;
    let actualLen = 0;
    for (let i = 0, len = segScalarData.length; i < len; i++) {
        if (segScalarData[i] !== 0) {
            nonZeroVoxelIndices[actualLen++] = i;
        }
    }
    nonZeroVoxelIndices.length = actualLen;
    const dynamicVolumeScalarDataArray = dynamicVolume.getScalarDataArrays();
    const values = [];
    const isSameVolume = dynamicVolumeScalarDataArray[0].length === len &&
        JSON.stringify(dynamicVolume.spacing) ===
            JSON.stringify(segmentationVolume.spacing);
    if (isSameVolume) {
        for (let i = 0; i < nonZeroVoxelIndices.length; i++) {
            const indexValues = [];
            frames.forEach((frame) => {
                const activeScalarData = dynamicVolumeScalarDataArray[frame];
                indexValues.push(activeScalarData[nonZeroVoxelIndices[i]]);
            });
            values.push(indexValues);
        }
        return values;
    }
    const callback = ({ pointLPS: segPointLPS, value: segValue }) => {
        if (segValue === 0) {
            return;
        }
        const overlapIJKMinMax = getVoxelOverlap(dynamicVolume.imageData, dynamicVolume.dimensions, dynamicVolume.spacing, segPointLPS);
        let count = 0;
        const perFrameSum = new Map();
        frames.forEach((frame) => perFrameSum.set(frame, 0));
        const averageCallback = ({ index }) => {
            for (let i = 0; i < frames.length; i++) {
                const value = dynamicVolumeScalarDataArray[i][index];
                const frame = frames[i];
                perFrameSum.set(frame, perFrameSum.get(frame) + value);
            }
            count++;
        };
        pointInShapeCallback(dynamicVolume.imageData, () => true, averageCallback, overlapIJKMinMax);
        const averageValues = [];
        perFrameSum.forEach((sum) => {
            averageValues.push(sum / count);
        });
        values.push(averageValues);
    };
    pointInShapeCallback(maskImageData, () => true, callback);
    return values;
}
export default getDataInTime;
//# sourceMappingURL=getDataInTime.js.map