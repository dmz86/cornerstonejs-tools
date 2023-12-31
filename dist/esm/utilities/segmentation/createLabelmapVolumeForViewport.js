import { _cloneDeep } from 'lodash.clonedeep';
import { getEnabledElementByIds, volumeLoader, VolumeViewport, utilities as csUtils, } from '@cornerstonejs/core';
export default async function createLabelmapVolumeForViewport(input) {
    const { viewportId, renderingEngineId, options } = input;
    let { segmentationId } = input;
    const enabledElement = getEnabledElementByIds(viewportId, renderingEngineId);
    if (!enabledElement) {
        throw new Error('element disabled');
    }
    const { viewport } = enabledElement;
    if (!(viewport instanceof VolumeViewport)) {
        throw new Error('Segmentation only supports VolumeViewport');
    }
    const { uid } = viewport.getDefaultActor();
    if (segmentationId === undefined) {
        segmentationId = `${uid}-based-segmentation-${options?.volumeId ?? csUtils.uuidv4().slice(0, 8)}`;
    }
    if (options) {
        const properties = _cloneDeep(options);
        await volumeLoader.createLocalVolume(properties, segmentationId);
    }
    else {
        const { uid: volumeId } = viewport.getDefaultActor();
        await volumeLoader.createAndCacheDerivedVolume(volumeId, {
            volumeId: segmentationId,
        });
    }
    return segmentationId;
}
//# sourceMappingURL=createLabelmapVolumeForViewport.js.map