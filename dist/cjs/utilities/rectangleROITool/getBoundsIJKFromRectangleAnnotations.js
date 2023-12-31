"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const getBoundingBoxAroundShape_1 = __importDefault(require("../boundingBox/getBoundingBoxAroundShape"));
const extend2DBoundingBoxInViewAxis_1 = __importDefault(require("../boundingBox/extend2DBoundingBoxInViewAxis"));
function getBoundsIJKFromRectangleAnnotations(annotations, referenceVolume, options = {}) {
    const AllBoundsIJK = [];
    annotations.forEach((annotation) => {
        var _a, _b;
        const { data } = annotation;
        const { points } = data.handles;
        const { imageData, dimensions } = referenceVolume;
        let pointsToUse = points;
        if ((_a = data.cachedStats) === null || _a === void 0 ? void 0 : _a.projectionPoints) {
            const { projectionPoints } = data.cachedStats;
            pointsToUse = [].concat(...projectionPoints);
        }
        const rectangleCornersIJK = pointsToUse.map((world) => core_1.utilities.transformWorldToIndex(imageData, world));
        let boundsIJK = (0, getBoundingBoxAroundShape_1.default)(rectangleCornersIJK, dimensions);
        if (options.numSlicesToProject && !((_b = data.cachedStats) === null || _b === void 0 ? void 0 : _b.projectionPoints)) {
            boundsIJK = (0, extend2DBoundingBoxInViewAxis_1.default)(boundsIJK, options.numSlicesToProject);
        }
        AllBoundsIJK.push(boundsIJK);
    });
    if (AllBoundsIJK.length === 1) {
        return AllBoundsIJK[0];
    }
    const boundsIJK = AllBoundsIJK.reduce((accumulator, currentValue) => {
        return {
            iMin: Math.min(accumulator.iMin, currentValue.iMin),
            jMin: Math.min(accumulator.jMin, currentValue.jMin),
            kMin: Math.min(accumulator.kMin, currentValue.kMin),
            iMax: Math.max(accumulator.iMax, currentValue.iMax),
            jMax: Math.max(accumulator.jMax, currentValue.jMax),
            kMax: Math.max(accumulator.kMax, currentValue.kMax),
        };
    }, {
        iMin: Infinity,
        jMin: Infinity,
        kMin: Infinity,
        iMax: -Infinity,
        jMax: -Infinity,
        kMax: -Infinity,
    });
    return boundsIJK;
}
exports.default = getBoundsIJKFromRectangleAnnotations;
//# sourceMappingURL=getBoundsIJKFromRectangleAnnotations.js.map