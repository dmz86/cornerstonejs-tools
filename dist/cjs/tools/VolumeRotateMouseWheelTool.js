"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const core_1 = require("@cornerstonejs/core");
const gl_matrix_1 = require("gl-matrix");
const DIRECTIONS = {
    X: [1, 0, 0],
    Y: [0, 1, 0],
    Z: [0, 0, 1],
    CUSTOM: [],
};
class VolumeRotateMouseWheelTool extends base_1.BaseTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            direction: DIRECTIONS.Z,
            rotateIncrementDegrees: 0.5,
        },
    }) {
        super(toolProps, defaultToolProps);
    }
    mouseWheelCallback(evt) {
        const { element, wheel } = evt.detail;
        const enabledElement = (0, core_1.getEnabledElement)(element);
        const { viewport } = enabledElement;
        const { direction, rotateIncrementDegrees } = this.configuration;
        const camera = viewport.getCamera();
        const { viewUp, position, focalPoint } = camera;
        const { direction: deltaY } = wheel;
        const [cx, cy, cz] = focalPoint;
        const [ax, ay, az] = direction;
        const angle = deltaY * rotateIncrementDegrees;
        const newPosition = [0, 0, 0];
        const newFocalPoint = [0, 0, 0];
        const newViewUp = [0, 0, 0];
        const transform = gl_matrix_1.mat4.identity(new Float32Array(16));
        gl_matrix_1.mat4.translate(transform, transform, [cx, cy, cz]);
        gl_matrix_1.mat4.rotate(transform, transform, angle, [ax, ay, az]);
        gl_matrix_1.mat4.translate(transform, transform, [-cx, -cy, -cz]);
        gl_matrix_1.vec3.transformMat4(newPosition, position, transform);
        gl_matrix_1.vec3.transformMat4(newFocalPoint, focalPoint, transform);
        gl_matrix_1.mat4.identity(transform);
        gl_matrix_1.mat4.rotate(transform, transform, angle, [ax, ay, az]);
        gl_matrix_1.vec3.transformMat4(newViewUp, viewUp, transform);
        viewport.setCamera({
            position: newPosition,
            viewUp: newViewUp,
            focalPoint: newFocalPoint,
        });
        viewport.render();
    }
}
VolumeRotateMouseWheelTool.toolName = 'VolumeRotateMouseWheel';
exports.default = VolumeRotateMouseWheelTool;
//# sourceMappingURL=VolumeRotateMouseWheelTool.js.map