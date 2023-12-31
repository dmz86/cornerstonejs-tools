"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const eventListeners_1 = require("../eventListeners");
const eventDispatchers_1 = require("../eventDispatchers");
const filterToolsWithAnnotationsForElement_1 = __importDefault(require("./filterToolsWithAnnotationsForElement"));
const state_1 = require("./state");
const getToolsWithModesForElement_1 = __importDefault(require("../utilities/getToolsWithModesForElement"));
const enums_1 = require("../enums");
const stateManagement_1 = require("../stateManagement");
const getSynchronizersForViewport_1 = __importDefault(require("./SynchronizerManager/getSynchronizersForViewport"));
const getToolGroupForViewport_1 = __importDefault(require("./ToolGroupManager/getToolGroupForViewport"));
const triggerAnnotationRender_1 = require("../utilities/triggerAnnotationRender");
const VIEWPORT_ELEMENT = 'viewport-element';
function removeEnabledElement(elementDisabledEvt) {
    const { element, viewportId } = elementDisabledEvt.detail;
    _resetSvgNodeCache(element);
    _removeSvgNode(element);
    triggerAnnotationRender_1.annotationRenderingEngine.removeViewportElement(viewportId, element);
    eventListeners_1.mouseEventListeners.disable(element);
    eventListeners_1.wheelEventListener.disable(element);
    eventListeners_1.touchEventListeners.disable(element);
    eventListeners_1.keyEventListener.disable(element);
    eventDispatchers_1.imageRenderedEventDispatcher.disable(element);
    eventDispatchers_1.cameraModifiedEventDispatcher.disable(element);
    eventDispatchers_1.imageSpacingCalibratedEventDispatcher.disable(element);
    eventDispatchers_1.mouseToolEventDispatcher.disable(element);
    eventDispatchers_1.keyboardToolEventDispatcher.disable(element);
    eventDispatchers_1.touchToolEventDispatcher.disable(element);
    _removeViewportFromSynchronizers(element);
    _removeViewportFromToolGroup(element);
    _removeEnabledElement(element);
}
const _removeViewportFromSynchronizers = (element) => {
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const synchronizers = (0, getSynchronizersForViewport_1.default)(enabledElement.viewportId, enabledElement.renderingEngineId);
    synchronizers.forEach((sync) => {
        sync.remove(enabledElement);
    });
};
const _removeViewportFromToolGroup = (element) => {
    const { renderingEngineId, viewportId } = (0, core_1.getEnabledElement)(element);
    const toolGroup = (0, getToolGroupForViewport_1.default)(viewportId, renderingEngineId);
    if (toolGroup) {
        toolGroup.removeViewports(renderingEngineId, viewportId);
    }
};
const _removeAllToolsForElement = function (element) {
    const tools = (0, getToolsWithModesForElement_1.default)(element, [
        enums_1.ToolModes.Active,
        enums_1.ToolModes.Passive,
    ]);
    const toolsWithData = (0, filterToolsWithAnnotationsForElement_1.default)(element, tools);
    toolsWithData.forEach(({ annotations }) => {
        annotations.forEach((annotation) => {
            (0, stateManagement_1.removeAnnotation)(annotation.annotationUID);
        });
    });
};
function _resetSvgNodeCache(element) {
    const { viewportUid: viewportId, renderingEngineUid: renderingEngineId } = element.dataset;
    const elementHash = `${viewportId}:${renderingEngineId}`;
    delete state_1.state.svgNodeCache[elementHash];
}
function _removeSvgNode(element) {
    const internalViewportNode = element.querySelector(`div.${VIEWPORT_ELEMENT}`);
    const svgLayer = internalViewportNode.querySelector('svg');
    if (svgLayer) {
        internalViewportNode.removeChild(svgLayer);
    }
}
const _removeEnabledElement = function (element) {
    const foundElementIndex = state_1.state.enabledElements.findIndex((el) => el === element);
    if (foundElementIndex > -1) {
        state_1.state.enabledElements.splice(foundElementIndex, 1);
    }
};
exports.default = removeEnabledElement;
//# sourceMappingURL=removeEnabledElement.js.map