"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventListeners_1 = require("../eventListeners");
const eventDispatchers_1 = require("../eventDispatchers");
const state_1 = require("./state");
const triggerAnnotationRender_1 = require("../utilities/triggerAnnotationRender");
function addEnabledElement(evt) {
    const { element, viewportId } = evt.detail;
    const svgLayer = _createSvgAnnotationLayer(viewportId);
    _setSvgNodeCache(element);
    _appendChild(svgLayer, element);
    triggerAnnotationRender_1.annotationRenderingEngine.addViewportElement(viewportId, element);
    eventListeners_1.mouseEventListeners.enable(element);
    eventListeners_1.wheelEventListener.enable(element);
    eventListeners_1.touchEventListeners.enable(element);
    eventListeners_1.keyEventListener.enable(element);
    eventDispatchers_1.imageRenderedEventDispatcher.enable(element);
    eventDispatchers_1.cameraModifiedEventDispatcher.enable(element);
    eventDispatchers_1.imageSpacingCalibratedEventDispatcher.enable(element);
    eventDispatchers_1.mouseToolEventDispatcher.enable(element);
    eventDispatchers_1.keyboardToolEventDispatcher.enable(element);
    eventDispatchers_1.touchToolEventDispatcher.enable(element);
    state_1.state.enabledElements.push(element);
}
exports.default = addEnabledElement;
function _createSvgAnnotationLayer(viewportId) {
    const svgns = 'http://www.w3.org/2000/svg';
    const svgLayer = document.createElementNS(svgns, 'svg');
    const svgLayerId = `svg-layer-${viewportId}`;
    svgLayer.classList.add('svg-layer');
    svgLayer.setAttribute('id', svgLayerId);
    svgLayer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgLayer.style.width = '100%';
    svgLayer.style.height = '100%';
    svgLayer.style.pointerEvents = 'none';
    svgLayer.style.position = 'absolute';
    const defs = document.createElementNS(svgns, 'defs');
    const filter = document.createElementNS(svgns, 'filter');
    const feOffset = document.createElementNS(svgns, 'feOffset');
    const feColorMatrix = document.createElementNS(svgns, 'feColorMatrix');
    const feBlend = document.createElementNS(svgns, 'feBlend');
    filter.setAttribute('id', `shadow-${svgLayerId}`);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    feOffset.setAttribute('result', 'offOut');
    feOffset.setAttribute('in', 'SourceGraphic');
    feOffset.setAttribute('dx', '0.5');
    feOffset.setAttribute('dy', '0.5');
    feColorMatrix.setAttribute('result', 'matrixOut');
    feColorMatrix.setAttribute('in', 'offOut');
    feColorMatrix.setAttribute('in2', 'matrix');
    feColorMatrix.setAttribute('values', '0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0');
    feBlend.setAttribute('in', 'SourceGraphic');
    feBlend.setAttribute('in2', 'matrixOut');
    feBlend.setAttribute('mode', 'normal');
    filter.appendChild(feOffset);
    filter.appendChild(feColorMatrix);
    filter.appendChild(feBlend);
    defs.appendChild(filter);
    svgLayer.appendChild(defs);
    return svgLayer;
}
function _setSvgNodeCache(element) {
    const { viewportUid: viewportId, renderingEngineUid: renderingEngineId } = element.dataset;
    const elementHash = `${viewportId}:${renderingEngineId}`;
    state_1.state.svgNodeCache[elementHash] = {};
}
function _appendChild(newNode, referenceNode) {
    referenceNode.querySelector('div.viewport-element').appendChild(newNode);
}
//# sourceMappingURL=addEnabledElement.js.map