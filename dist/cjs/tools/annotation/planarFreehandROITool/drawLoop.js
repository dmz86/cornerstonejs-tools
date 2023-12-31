"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const elementCursor_1 = require("../../../cursors/elementCursor");
const enums_1 = require("../../../enums");
const store_1 = require("../../../store");
const gl_matrix_1 = require("gl-matrix");
const interpolatePoints_1 = require("../../../utilities/planarFreehandROITool/interpolatePoints");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../../utilities/triggerAnnotationRenderForViewportIds"));
const findOpenUShapedContourVectorToPeak_1 = __importDefault(require("./findOpenUShapedContourVectorToPeak"));
const math_1 = require("../../../utilities/math");
const annotationState_1 = require("../../../stateManagement/annotation/annotationState");
const { addCanvasPointsToArray, pointsAreWithinCloseContourProximity, getFirstIntersectionWithPolyline, getSubPixelSpacingAndXYDirections, } = math_1.polyline;
function activateDraw(evt, annotation, viewportIdsToRender) {
    this.isDrawing = true;
    const eventDetail = evt.detail;
    const { currentPoints, element } = eventDetail;
    const canvasPos = currentPoints.canvas;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport } = enabledElement;
    const { spacing, xDir, yDir } = getSubPixelSpacingAndXYDirections(viewport, this.configuration.subPixelResolution);
    this.drawData = {
        canvasPoints: [canvasPos],
        polylineIndex: 0,
    };
    this.commonData = {
        annotation,
        viewportIdsToRender,
        spacing,
        xDir,
        yDir,
        movingTextBox: false,
    };
    store_1.state.isInteractingWithTool = true;
    element.addEventListener(enums_1.Events.MOUSE_UP, this.mouseUpDrawCallback);
    element.addEventListener(enums_1.Events.MOUSE_DRAG, this.mouseDragDrawCallback);
    element.addEventListener(enums_1.Events.MOUSE_CLICK, this.mouseUpDrawCallback);
    element.addEventListener(enums_1.Events.TOUCH_END, this.mouseUpDrawCallback);
    element.addEventListener(enums_1.Events.TOUCH_DRAG, this.mouseDragDrawCallback);
    element.addEventListener(enums_1.Events.TOUCH_TAP, this.mouseUpDrawCallback);
    (0, elementCursor_1.hideElementCursor)(element);
}
function deactivateDraw(element) {
    store_1.state.isInteractingWithTool = false;
    element.removeEventListener(enums_1.Events.MOUSE_UP, this.mouseUpDrawCallback);
    element.removeEventListener(enums_1.Events.MOUSE_DRAG, this.mouseDragDrawCallback);
    element.removeEventListener(enums_1.Events.MOUSE_CLICK, this.mouseUpDrawCallback);
    element.removeEventListener(enums_1.Events.TOUCH_END, this.mouseUpDrawCallback);
    element.removeEventListener(enums_1.Events.TOUCH_DRAG, this.mouseDragDrawCallback);
    element.removeEventListener(enums_1.Events.TOUCH_TAP, this.mouseUpDrawCallback);
    (0, elementCursor_1.resetElementCursor)(element);
}
function mouseDragDrawCallback(evt) {
    const eventDetail = evt.detail;
    const { currentPoints, element } = eventDetail;
    const worldPos = currentPoints.world;
    const canvasPos = currentPoints.canvas;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { renderingEngine, viewport } = enabledElement;
    const { annotation, viewportIdsToRender, xDir, yDir, spacing, movingTextBox, } = this.commonData;
    const { polylineIndex, canvasPoints } = this.drawData;
    const lastCanvasPoint = canvasPoints[canvasPoints.length - 1];
    const lastWorldPoint = viewport.canvasToWorld(lastCanvasPoint);
    const worldPosDiff = gl_matrix_1.vec3.create();
    gl_matrix_1.vec3.subtract(worldPosDiff, worldPos, lastWorldPoint);
    const xDist = Math.abs(gl_matrix_1.vec3.dot(worldPosDiff, xDir));
    const yDist = Math.abs(gl_matrix_1.vec3.dot(worldPosDiff, yDir));
    if (xDist <= spacing[0] && yDist <= spacing[1]) {
        return;
    }
    if (movingTextBox) {
        this.isDrawing = false;
        const { deltaPoints } = eventDetail;
        const worldPosDelta = deltaPoints.world;
        const { textBox } = annotation.data.handles;
        const { worldPosition } = textBox;
        worldPosition[0] += worldPosDelta[0];
        worldPosition[1] += worldPosDelta[1];
        worldPosition[2] += worldPosDelta[2];
        textBox.hasMoved = true;
    }
    else {
        const crossingIndex = this.findCrossingIndexDuringCreate(evt);
        if (crossingIndex !== undefined) {
            this.applyCreateOnCross(evt, crossingIndex);
        }
        else {
            const numPointsAdded = addCanvasPointsToArray(element, canvasPoints, canvasPos, this.commonData);
            this.drawData.polylineIndex = polylineIndex + numPointsAdded;
        }
    }
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
}
function mouseUpDrawCallback(evt) {
    const { allowOpenContours } = this.configuration;
    const { canvasPoints } = this.drawData;
    const firstPoint = canvasPoints[0];
    const lastPoint = canvasPoints[canvasPoints.length - 1];
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    if (allowOpenContours &&
        !pointsAreWithinCloseContourProximity(firstPoint, lastPoint, this.configuration.closeContourProximity)) {
        this.completeDrawOpenContour(element);
    }
    else {
        this.completeDrawClosedContour(element);
    }
}
function completeDrawClosedContour(element) {
    this.removeCrossedLinesOnCompleteDraw();
    const { canvasPoints } = this.drawData;
    if (this.haltDrawing(element, canvasPoints)) {
        return false;
    }
    const { annotation, viewportIdsToRender } = this.commonData;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport, renderingEngine } = enabledElement;
    addCanvasPointsToArray(element, canvasPoints, canvasPoints[0], this.commonData);
    canvasPoints.pop();
    const updatedPoints = (0, interpolatePoints_1.shouldInterpolate)(this.configuration)
        ? (0, interpolatePoints_1.getInterpolatedPoints)(this.configuration, canvasPoints)
        : canvasPoints;
    const worldPoints = updatedPoints.map((canvasPoint) => viewport.canvasToWorld(canvasPoint));
    annotation.data.polyline = worldPoints;
    annotation.data.isOpenContour = false;
    const { textBox } = annotation.data.handles;
    if (!textBox.hasMoved) {
        this.triggerAnnotationCompleted(annotation);
    }
    this.isDrawing = false;
    this.drawData = undefined;
    this.commonData = undefined;
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
    this.deactivateDraw(element);
    return true;
}
function removeCrossedLinesOnCompleteDraw() {
    const { canvasPoints } = this.drawData;
    const numPoints = canvasPoints.length;
    const endToStart = [canvasPoints[0], canvasPoints[numPoints - 1]];
    const canvasPointsMinusEnds = canvasPoints.slice(0, -1).slice(1);
    const lineSegment = getFirstIntersectionWithPolyline(canvasPointsMinusEnds, endToStart[0], endToStart[1], false);
    if (lineSegment) {
        const indexToRemoveUpTo = lineSegment[1];
        this.drawData.canvasPoints = canvasPoints.splice(0, indexToRemoveUpTo);
    }
}
function completeDrawOpenContour(element) {
    const { canvasPoints } = this.drawData;
    if (this.haltDrawing(element, canvasPoints)) {
        return false;
    }
    const { annotation, viewportIdsToRender } = this.commonData;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport, renderingEngine } = enabledElement;
    const updatedPoints = (0, interpolatePoints_1.shouldInterpolate)(this.configuration)
        ? (0, interpolatePoints_1.getInterpolatedPoints)(this.configuration, canvasPoints)
        : canvasPoints;
    const worldPoints = updatedPoints.map((canvasPoint) => viewport.canvasToWorld(canvasPoint));
    annotation.data.polyline = worldPoints;
    annotation.data.isOpenContour = true;
    const { textBox } = annotation.data.handles;
    annotation.data.handles.points = [
        worldPoints[0],
        worldPoints[worldPoints.length - 1],
    ];
    if (annotation.data.isOpenUShapeContour) {
        annotation.data.openUShapeContourVectorToPeak =
            (0, findOpenUShapedContourVectorToPeak_1.default)(canvasPoints, viewport);
    }
    if (!textBox.hasMoved) {
        this.triggerAnnotationCompleted(annotation);
    }
    this.isDrawing = false;
    this.drawData = undefined;
    this.commonData = undefined;
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
    this.deactivateDraw(element);
    return true;
}
function findCrossingIndexDuringCreate(evt) {
    const eventDetail = evt.detail;
    const { currentPoints, lastPoints } = eventDetail;
    const canvasPos = currentPoints.canvas;
    const lastCanvasPoint = lastPoints.canvas;
    const { canvasPoints } = this.drawData;
    const pointsLessLastOne = canvasPoints.slice(0, -1);
    const lineSegment = getFirstIntersectionWithPolyline(pointsLessLastOne, canvasPos, lastCanvasPoint, false);
    if (lineSegment === undefined) {
        return;
    }
    const crossingIndex = lineSegment[0];
    return crossingIndex;
}
function applyCreateOnCross(evt, crossingIndex) {
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    const { canvasPoints } = this.drawData;
    const { annotation, viewportIdsToRender } = this.commonData;
    addCanvasPointsToArray(element, canvasPoints, canvasPoints[crossingIndex], this.commonData);
    canvasPoints.pop();
    for (let i = 0; i < crossingIndex; i++) {
        canvasPoints.shift();
    }
    if (this.completeDrawClosedContour(element)) {
        this.activateClosedContourEdit(evt, annotation, viewportIdsToRender);
    }
}
function cancelDrawing(element) {
    const { allowOpenContours } = this.configuration;
    const { canvasPoints } = this.drawData;
    const firstPoint = canvasPoints[0];
    const lastPoint = canvasPoints[canvasPoints.length - 1];
    if (allowOpenContours &&
        !pointsAreWithinCloseContourProximity(firstPoint, lastPoint, this.configuration.closeContourProximity)) {
        this.completeDrawOpenContour(element);
    }
    else {
        this.completeDrawClosedContour(element);
    }
}
function shouldHaltDrawing(canvasPoints, subPixelResolution) {
    const minPoints = Math.max(subPixelResolution * 3, 3);
    return canvasPoints.length < minPoints;
}
function haltDrawing(element, canvasPoints) {
    const { subPixelResolution } = this.configuration;
    if (shouldHaltDrawing(canvasPoints, subPixelResolution)) {
        const { annotation, viewportIdsToRender } = this.commonData;
        const enabledElement = (0, core_1.getEnabledElement)(element);
        const { renderingEngine } = enabledElement;
        (0, annotationState_1.removeAnnotation)(annotation.annotationUID);
        this.isDrawing = false;
        this.drawData = undefined;
        this.commonData = undefined;
        (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
        this.deactivateDraw(element);
        return true;
    }
    return false;
}
function registerDrawLoop(toolInstance) {
    toolInstance.activateDraw = activateDraw.bind(toolInstance);
    toolInstance.deactivateDraw = deactivateDraw.bind(toolInstance);
    toolInstance.applyCreateOnCross = applyCreateOnCross.bind(toolInstance);
    toolInstance.findCrossingIndexDuringCreate =
        findCrossingIndexDuringCreate.bind(toolInstance);
    toolInstance.completeDrawOpenContour =
        completeDrawOpenContour.bind(toolInstance);
    toolInstance.removeCrossedLinesOnCompleteDraw =
        removeCrossedLinesOnCompleteDraw.bind(toolInstance);
    toolInstance.mouseDragDrawCallback = mouseDragDrawCallback.bind(toolInstance);
    toolInstance.mouseUpDrawCallback = mouseUpDrawCallback.bind(toolInstance);
    toolInstance.completeDrawClosedContour =
        completeDrawClosedContour.bind(toolInstance);
    toolInstance.cancelDrawing = cancelDrawing.bind(toolInstance);
    toolInstance.haltDrawing = haltDrawing.bind(toolInstance);
}
exports.default = registerDrawLoop;
//# sourceMappingURL=drawLoop.js.map