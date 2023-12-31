"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const state_1 = require("./state");
const stackPrefetchUtils_1 = require("./stackPrefetchUtils");
const roundNumber_1 = __importDefault(require("../roundNumber"));
let configuration = {
    maxImagesToPrefetch: Infinity,
    minBefore: 2,
    maxAfter: 2,
    directionExtraImages: 10,
    preserveExistingPool: false,
};
let resetPrefetchTimeout;
const resetPrefetchDelay = 5;
const enable = (element) => {
    const stack = (0, stackPrefetchUtils_1.getStackData)(element);
    if (!stack || !stack.imageIds || stack.imageIds.length === 0) {
        console.warn('CornerstoneTools.stackPrefetch: No images in stack.');
        return;
    }
    updateToolState(element);
    prefetch(element);
    element.removeEventListener(core_1.Enums.Events.STACK_NEW_IMAGE, onImageUpdated);
    element.addEventListener(core_1.Enums.Events.STACK_NEW_IMAGE, onImageUpdated);
    const promiseRemovedHandler = (0, stackPrefetchUtils_1.getPromiseRemovedHandler)(element);
    core_1.eventTarget.removeEventListener(core_1.Enums.Events.IMAGE_CACHE_IMAGE_REMOVED, promiseRemovedHandler);
    core_1.eventTarget.addEventListener(core_1.Enums.Events.IMAGE_CACHE_IMAGE_REMOVED, promiseRemovedHandler);
};
function prefetch(element) {
    var _a, _b;
    const stack = (0, stackPrefetchUtils_1.getStackData)(element);
    if (!((_a = stack === null || stack === void 0 ? void 0 : stack.imageIds) === null || _a === void 0 ? void 0 : _a.length)) {
        console.warn('CornerstoneTools.stackPrefetch: No images in stack.');
        return;
    }
    const stackPrefetchData = (0, state_1.getToolState)(element);
    if (!stackPrefetchData) {
        return;
    }
    const stackPrefetch = stackPrefetchData || {};
    stackPrefetch.enabled && (stackPrefetch.enabled = (_b = stackPrefetch.indicesToRequest) === null || _b === void 0 ? void 0 : _b.length);
    if (stackPrefetch.enabled === false) {
        return;
    }
    function removeFromList(imageIdIndex) {
        const index = stackPrefetch.indicesToRequest.indexOf(imageIdIndex);
        if (index > -1) {
            stackPrefetch.indicesToRequest.splice(index, 1);
        }
    }
    const indicesToRequestCopy = stackPrefetch.indicesToRequest.slice();
    const { currentImageIdIndex } = stack;
    indicesToRequestCopy.forEach((imageIdIndex) => {
        const imageId = stack.imageIds[imageIdIndex];
        if (!imageId) {
            return;
        }
        const distance = Math.abs(currentImageIdIndex - imageIdIndex);
        const imageCached = distance < 6
            ? core_1.cache.getImageLoadObject(imageId)
            : core_1.cache.isLoaded(imageId);
        if (imageCached) {
            removeFromList(imageIdIndex);
        }
    });
    if (!stackPrefetch.indicesToRequest.length) {
        return;
    }
    if (!configuration.preserveExistingPool) {
        core_1.imageLoadPoolManager.filterRequests((0, stackPrefetchUtils_1.clearFromImageIds)(stack));
    }
    function doneCallback(imageId) {
        var _a, _b;
        const imageIdIndex = stack.imageIds.indexOf(imageId);
        removeFromList(imageIdIndex);
        const image = core_1.cache.getCachedImageBasedOnImageURI(imageId);
        const { stats } = stackPrefetch;
        const decodeTimeInMS = ((_a = image === null || image === void 0 ? void 0 : image.image) === null || _a === void 0 ? void 0 : _a.decodeTimeInMS) || 0;
        if (decodeTimeInMS) {
            stats.imageIds.set(imageId, decodeTimeInMS);
            stats.decodeTimeInMS += decodeTimeInMS;
            const loadTimeInMS = ((_b = image === null || image === void 0 ? void 0 : image.image) === null || _b === void 0 ? void 0 : _b.loadTimeInMS) || 0;
            stats.loadTimeInMS += loadTimeInMS;
        }
        if (!stackPrefetch.indicesToRequest.length) {
            if (image === null || image === void 0 ? void 0 : image.sizeInBytes) {
                const { sizeInBytes } = image;
                const usage = core_1.cache.getMaxCacheSize() / 4 / sizeInBytes;
                if (!stackPrefetch.cacheFill) {
                    stats.initialTime = Date.now() - stats.start;
                    stats.initialSize = stats.imageIds.size;
                    updateToolState(element, usage);
                    prefetch(element);
                }
                else if (stats.imageIds.size) {
                    stats.fillTime = Date.now() - stats.start;
                    const { size } = stats.imageIds;
                    stats.fillSize = size;
                    console.log('Done cache fill', stats.fillTime, 'ms', size, 'items', 'average total time', (0, roundNumber_1.default)(stats.fillTime / size), 'ms', 'average load', (0, roundNumber_1.default)(stats.loadTimeInMS / size), 'ms', 'average decode', (0, roundNumber_1.default)(stats.decodeTimeInMS / size), 'ms');
                }
            }
        }
    }
    const requestFn = (imageId, options) => core_1.imageLoader
        .loadAndCacheImage(imageId, options)
        .then(() => doneCallback(imageId));
    const { useNorm16Texture } = (0, core_1.getConfiguration)().rendering;
    indicesToRequestCopy.forEach((imageIdIndex) => {
        const imageId = stack.imageIds[imageIdIndex];
        const options = {
            targetBuffer: {
                type: useNorm16Texture ? undefined : 'Float32Array',
            },
            preScale: {
                enabled: true,
            },
            requestType: stackPrefetchUtils_1.requestType,
        };
        core_1.imageLoadPoolManager.addRequest(requestFn.bind(null, imageId, options), stackPrefetchUtils_1.requestType, {
            imageId,
        }, stackPrefetchUtils_1.priority);
    });
}
function onImageUpdated(e) {
    clearTimeout(resetPrefetchTimeout);
    resetPrefetchTimeout = setTimeout(function () {
        const element = e.target;
        try {
            updateToolState(element);
            prefetch(element);
        }
        catch (error) {
            return;
        }
    }, resetPrefetchDelay);
}
const signum = (x) => (x < 0 ? -1 : 1);
const updateToolState = (element, usage) => {
    const stack = (0, stackPrefetchUtils_1.getStackData)(element);
    if (!stack || !stack.imageIds || stack.imageIds.length === 0) {
        console.warn('CornerstoneTools.stackPrefetch: No images in stack.');
        return;
    }
    const { currentImageIdIndex } = stack;
    let { maxAfter = 2, minBefore = 2 } = configuration;
    const { directionExtraImages = 10 } = configuration;
    const stackPrefetchData = (0, state_1.getToolState)(element) || {
        indicesToRequest: [],
        currentImageIdIndex,
        stackCount: 0,
        enabled: true,
        direction: 1,
        stats: {
            start: Date.now(),
            imageIds: new Map(),
            decodeTimeInMS: 0,
            loadTimeInMS: 0,
            totalBytes: 0,
        },
    };
    const delta = currentImageIdIndex - stackPrefetchData.currentImageIdIndex;
    stackPrefetchData.direction = signum(delta);
    stackPrefetchData.currentImageIdIndex = currentImageIdIndex;
    stackPrefetchData.enabled = true;
    if (stackPrefetchData.stackCount < 100) {
        stackPrefetchData.stackCount += directionExtraImages;
    }
    if (Math.abs(delta) > maxAfter || !delta) {
        stackPrefetchData.stackCount = 0;
        if (usage) {
            const positionFraction = currentImageIdIndex / stack.imageIds.length;
            minBefore = Math.ceil(usage * positionFraction);
            maxAfter = Math.ceil(usage * (1 - positionFraction));
            stackPrefetchData.cacheFill = true;
        }
        else {
            stackPrefetchData.cacheFill = false;
        }
    }
    else if (delta < 0) {
        minBefore += stackPrefetchData.stackCount;
        maxAfter = 0;
    }
    else {
        maxAfter += stackPrefetchData.stackCount;
        minBefore = 0;
    }
    const minIndex = Math.max(0, currentImageIdIndex - minBefore);
    const maxIndex = Math.min(stack.imageIds.length - 1, currentImageIdIndex + maxAfter);
    const indicesToRequest = [];
    for (let i = currentImageIdIndex + 1; i <= maxIndex; i++) {
        indicesToRequest.push(i);
    }
    for (let i = currentImageIdIndex - 1; i >= minIndex; i--) {
        indicesToRequest.push(i);
    }
    stackPrefetchData.indicesToRequest = indicesToRequest;
    (0, state_1.addToolState)(element, stackPrefetchData);
};
function disable(element) {
    clearTimeout(resetPrefetchTimeout);
    element.removeEventListener(core_1.Enums.Events.STACK_NEW_IMAGE, onImageUpdated);
    const promiseRemovedHandler = (0, stackPrefetchUtils_1.getPromiseRemovedHandler)(element);
    core_1.eventTarget.removeEventListener(core_1.Enums.Events.IMAGE_CACHE_IMAGE_REMOVED, promiseRemovedHandler);
    const stackPrefetchData = (0, state_1.getToolState)(element);
    if (stackPrefetchData && stackPrefetchData.data.length) {
        stackPrefetchData.enabled = false;
    }
}
function getConfiguration() {
    return configuration;
}
function setConfiguration(config) {
    configuration = config;
}
const stackContextPrefetch = {
    enable,
    disable,
    getConfiguration,
    setConfiguration,
};
exports.default = stackContextPrefetch;
//# sourceMappingURL=stackContextPrefetch.js.map