"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidLabelmapConfig = void 0;
const defaultLabelmapConfig = {
    renderOutline: true,
    outlineWidthActive: 3,
    outlineWidthInactive: 2,
    renderFill: true,
    renderFillInactive: true,
    fillAlpha: 0.7,
    fillAlphaInactive: 0.65,
    outlineOpacity: 1,
    outlineOpacityInactive: 0.85,
};
function getDefaultLabelmapConfig() {
    return defaultLabelmapConfig;
}
function isValidLabelmapConfig(config) {
    return (config &&
        typeof config.renderOutline === 'boolean' &&
        typeof config.outlineWidthActive === 'number' &&
        typeof config.outlineWidthInactive === 'number' &&
        typeof config.renderFill === 'boolean' &&
        typeof config.renderFillInactive === 'boolean' &&
        typeof config.fillAlpha === 'number' &&
        typeof config.fillAlphaInactive === 'number' &&
        typeof config.outlineOpacity === 'number' &&
        typeof config.outlineOpacityInactive === 'number');
}
exports.isValidLabelmapConfig = isValidLabelmapConfig;
exports.default = getDefaultLabelmapConfig;
//# sourceMappingURL=labelmapConfig.js.map