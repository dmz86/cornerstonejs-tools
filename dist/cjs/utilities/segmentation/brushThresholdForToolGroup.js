"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrushThresholdForToolGroup = exports.setBrushThresholdForToolGroup = void 0;
const ToolGroupManager_1 = require("../../store/ToolGroupManager");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../triggerAnnotationRenderForViewportIds"));
const core_1 = require("@cornerstonejs/core");
const utilities_1 = __importDefault(require("./utilities"));
function setBrushThresholdForToolGroup(toolGroupId, threshold) {
    const toolGroup = (0, ToolGroupManager_1.getToolGroup)(toolGroupId);
    if (toolGroup === undefined) {
        return;
    }
    const brushBasedToolInstances = (0, utilities_1.default)(toolGroupId);
    brushBasedToolInstances.forEach((tool) => {
        tool.configuration.strategySpecificConfiguration.THRESHOLD_INSIDE_CIRCLE.threshold =
            threshold;
    });
    const viewportsInfo = toolGroup.getViewportsInfo();
    if (!viewportsInfo.length) {
        return;
    }
    const { renderingEngineId } = viewportsInfo[0];
    const viewportIds = toolGroup.getViewportIds();
    const renderingEngine = (0, core_1.getRenderingEngine)(renderingEngineId);
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIds);
}
exports.setBrushThresholdForToolGroup = setBrushThresholdForToolGroup;
function getBrushThresholdForToolGroup(toolGroupId) {
    const toolGroup = (0, ToolGroupManager_1.getToolGroup)(toolGroupId);
    if (toolGroup === undefined) {
        return;
    }
    const toolInstances = toolGroup._toolInstances;
    if (!Object.keys(toolInstances).length) {
        return;
    }
    const brushBasedToolInstances = (0, utilities_1.default)(toolGroupId);
    const brushToolInstance = brushBasedToolInstances[0];
    if (!brushToolInstance) {
        return;
    }
    return brushToolInstance.configuration.strategySpecificConfiguration
        .THRESHOLD_INSIDE_CIRCLE.threshold;
}
exports.getBrushThresholdForToolGroup = getBrushThresholdForToolGroup;
//# sourceMappingURL=brushThresholdForToolGroup.js.map