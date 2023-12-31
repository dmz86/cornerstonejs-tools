"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOpenUShapedContourVectorToPeakOnRender = void 0;
const gl_matrix_1 = require("gl-matrix");
function findOpenUShapedContourVectorToPeak(canvasPoints, viewport) {
    const first = canvasPoints[0];
    const last = canvasPoints[canvasPoints.length - 1];
    const firstToLastUnitVector = gl_matrix_1.vec2.create();
    gl_matrix_1.vec2.set(firstToLastUnitVector, last[0] - first[0], last[1] - first[1]);
    gl_matrix_1.vec2.normalize(firstToLastUnitVector, firstToLastUnitVector);
    const normalVector1 = gl_matrix_1.vec2.create();
    const normalVector2 = gl_matrix_1.vec2.create();
    gl_matrix_1.vec2.set(normalVector1, -firstToLastUnitVector[1], firstToLastUnitVector[0]);
    gl_matrix_1.vec2.set(normalVector2, firstToLastUnitVector[1], -firstToLastUnitVector[0]);
    const centerOfFirstToLast = [
        (first[0] + last[0]) / 2,
        (first[1] + last[1]) / 2,
    ];
    const furthest = {
        dist: 0,
        index: null,
    };
    for (let i = 0; i < canvasPoints.length; i++) {
        const canvasPoint = canvasPoints[i];
        const distance = gl_matrix_1.vec2.dist(canvasPoint, centerOfFirstToLast);
        if (distance > furthest.dist) {
            furthest.dist = distance;
            furthest.index = i;
        }
    }
    const toFurthest = [
        canvasPoints[furthest.index],
        centerOfFirstToLast,
    ];
    const toFurthestWorld = toFurthest.map(viewport.canvasToWorld);
    return toFurthestWorld;
}
exports.default = findOpenUShapedContourVectorToPeak;
function findOpenUShapedContourVectorToPeakOnRender(enabledElement, annotation) {
    const { viewport } = enabledElement;
    const canvasPoints = annotation.data.polyline.map(viewport.worldToCanvas);
    return findOpenUShapedContourVectorToPeak(canvasPoints, viewport);
}
exports.findOpenUShapedContourVectorToPeakOnRender = findOpenUShapedContourVectorToPeakOnRender;
//# sourceMappingURL=findOpenUShapedContourVectorToPeak.js.map