"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearFromImageIds = exports.getPromiseRemovedHandler = exports.getStackData = exports.nearestIndex = exports.range = exports.priority = exports.requestType = void 0;
const core_1 = require("@cornerstonejs/core");
const state_1 = require("./state");
exports.requestType = core_1.Enums.RequestType.Prefetch;
exports.priority = 0;
function range(lowEnd, highEnd) {
    lowEnd = Math.round(lowEnd) || 0;
    highEnd = Math.round(highEnd) || 0;
    const arr = [];
    let c = highEnd - lowEnd + 1;
    if (c <= 0) {
        return arr;
    }
    while (c--) {
        arr[c] = highEnd--;
    }
    return arr;
}
exports.range = range;
function nearestIndex(arr, x) {
    let low = 0;
    let high = arr.length - 1;
    arr.forEach((v, idx) => {
        if (v < x) {
            low = Math.max(idx, low);
        }
        else if (v > x) {
            high = Math.min(idx, high);
        }
    });
    return { low, high };
}
exports.nearestIndex = nearestIndex;
function getStackData(element) {
    const enabledElement = (0, core_1.getEnabledElement)(element);
    if (!enabledElement) {
        return null;
    }
    const { viewport } = enabledElement;
    if (!(viewport instanceof core_1.StackViewport)) {
        throw new Error('stackPrefetch: element must be a StackViewport, VolumeViewport stackPrefetch not yet implemented');
    }
    return {
        currentImageIdIndex: viewport.getCurrentImageIdIndex(),
        imageIds: viewport.getImageIds(),
    };
}
exports.getStackData = getStackData;
function getPromiseRemovedHandler(element) {
    return function (e) {
        const eventData = e.detail;
        let stackData;
        try {
            stackData = getStackData(element);
        }
        catch (error) {
            return;
        }
        if (!stackData || !stackData.imageIds || stackData.imageIds.length === 0) {
            return;
        }
        const stack = stackData;
        const imageIdIndex = stack.imageIds.indexOf(eventData.imageId);
        if (imageIdIndex < 0) {
            return;
        }
        const stackPrefetchData = (0, state_1.getToolState)(element);
        if (!stackPrefetchData ||
            !stackPrefetchData.data ||
            !stackPrefetchData.data.length) {
            return;
        }
        stackPrefetchData.indicesToRequest.push(imageIdIndex);
    };
}
exports.getPromiseRemovedHandler = getPromiseRemovedHandler;
const clearFromImageIds = (stack) => {
    const imageIdSet = new Set(stack.imageIds);
    return (requestDetails) => requestDetails.type !== exports.requestType ||
        !imageIdSet.has(requestDetails.additionalDetails.imageId);
};
exports.clearFromImageIds = clearFromImageIds;
//# sourceMappingURL=stackPrefetchUtils.js.map