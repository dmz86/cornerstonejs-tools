function isWithinThreshold(index, imageVolume, strategySpecificConfiguration) {
    const { THRESHOLD_INSIDE_CIRCLE } = strategySpecificConfiguration;
    const voxelValue = imageVolume.getScalarData()[index];
    const { threshold } = THRESHOLD_INSIDE_CIRCLE;
    return threshold[0] <= voxelValue && voxelValue <= threshold[1];
}
export default isWithinThreshold;
//# sourceMappingURL=isWithinThreshold.js.map