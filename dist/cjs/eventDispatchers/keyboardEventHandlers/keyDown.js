"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../../store");
const getActiveToolForKeyboardEvent_1 = __importDefault(require("../shared/getActiveToolForKeyboardEvent"));
function keyDown(evt) {
    const activeTool = (0, getActiveToolForKeyboardEvent_1.default)(evt);
    if (!activeTool) {
        return;
    }
    const { renderingEngineId, viewportId } = evt.detail;
    const toolGroup = store_1.ToolGroupManager.getToolGroupForViewport(viewportId, renderingEngineId);
    const toolName = activeTool.getToolName();
    if (Object.keys(toolGroup.toolOptions).includes(toolName)) {
        toolGroup.setViewportsCursorByToolName(toolName);
    }
}
exports.default = keyDown;
//# sourceMappingURL=keyDown.js.map