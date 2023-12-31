import { cache, StackViewport, BaseVolumeViewport, } from '@cornerstonejs/core';
function isViewportPreScaled(viewport, targetId) {
    if (viewport instanceof BaseVolumeViewport) {
        const targetIdTokens = targetId.split('volumeId:');
        const volumeId = targetIdTokens.length > 1 ? targetIdTokens[1] : targetIdTokens[0];
        const volume = cache.getVolume(volumeId);
        return !!volume?.scaling && Object.keys(volume.scaling).length > 0;
    }
    else if (viewport instanceof StackViewport) {
        const { preScale } = viewport.getImageData() || {};
        return !!preScale?.scaled;
    }
    else {
        throw new Error('Viewport is not a valid type');
    }
}
export { isViewportPreScaled };
//# sourceMappingURL=isViewportPreScaled.js.map