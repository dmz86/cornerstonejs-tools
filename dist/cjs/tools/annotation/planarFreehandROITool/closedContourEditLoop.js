"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const store_1 = require("../../../store");
const enums_1 = require("../../../enums");
const elementCursor_1 = require("../../../cursors/elementCursor");
const math_1 = require("../../../utilities/math");
const gl_matrix_1 = require("gl-matrix");
const interpolatePoints_1 = require("../../../utilities/planarFreehandROITool/interpolatePoints");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../../utilities/triggerAnnotationRenderForViewportIds"));
const { getSubPixelSpacingAndXYDirections, addCanvasPointsToArray, calculateAreaOfPoints, } = math_1.polyline;
function activateClosedContourEdit(evt, annotation, viewportIdsToRender) {
    this.isEditingClosed = true;
    const eventDetail = evt.detail;
    const { currentPoints, element } = eventDetail;
    const canvasPos = currentPoints.canvas;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport } = enabledElement;
    const prevCanvasPoints = annotation.data.polyline.map(viewport.worldToCanvas);
    const { spacing, xDir, yDir } = getSubPixelSpacingAndXYDirections(viewport, this.configuration.subPixelResolution);
    this.editData = {
        prevCanvasPoints,
        editCanvasPoints: [canvasPos],
        startCrossingIndex: undefined,
        editIndex: 0,
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
    element.addEventListener(enums_1.Events.MOUSE_UP, this.mouseUpClosedContourEditCallback);
    element.addEventListener(enums_1.Events.MOUSE_DRAG, this.mouseDragClosedContourEditCallback);
    element.addEventListener(enums_1.Events.MOUSE_CLICK, this.mouseUpClosedContourEditCallback);
    element.addEventListener(enums_1.Events.TOUCH_END, this.mouseUpClosedContourEditCallback);
    element.addEventListener(enums_1.Events.TOUCH_DRAG, this.mouseDragClosedContourEditCallback);
    element.addEventListener(enums_1.Events.TOUCH_TAP, this.mouseUpClosedContourEditCallback);
    (0, elementCursor_1.hideElementCursor)(element);
}
function deactivateClosedContourEdit(element) {
    store_1.state.isInteractingWithTool = false;
    element.removeEventListener(enums_1.Events.MOUSE_UP, this.mouseUpClosedContourEditCallback);
    element.removeEventListener(enums_1.Events.MOUSE_DRAG, this.mouseDragClosedContourEditCallback);
    element.removeEventListener(enums_1.Events.MOUSE_CLICK, this.mouseUpClosedContourEditCallback);
    element.removeEventListener(enums_1.Events.TOUCH_END, this.mouseUpClosedContourEditCallback);
    element.removeEventListener(enums_1.Events.TOUCH_DRAG, this.mouseDragClosedContourEditCallback);
    element.removeEventListener(enums_1.Events.TOUCH_TAP, this.mouseUpClosedContourEditCallback);
    (0, elementCursor_1.resetElementCursor)(element);
}
function mouseDragClosedContourEditCallback(evt) {
    const eventDetail = evt.detail;
    const { currentPoints, element } = eventDetail;
    const worldPos = currentPoints.world;
    const canvasPos = currentPoints.canvas;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { renderingEngine, viewport } = enabledElement;
    const { viewportIdsToRender, xDir, yDir, spacing } = this.commonData;
    const { editIndex, editCanvasPoints, startCrossingIndex } = this.editData;
    const lastCanvasPoint = editCanvasPoints[editCanvasPoints.length - 1];
    const lastWorldPoint = viewport.canvasToWorld(lastCanvasPoint);
    const worldPosDiff = gl_matrix_1.vec3.create();
    gl_matrix_1.vec3.subtract(worldPosDiff, worldPos, lastWorldPoint);
    const xDist = Math.abs(gl_matrix_1.vec3.dot(worldPosDiff, xDir));
    const yDist = Math.abs(gl_matrix_1.vec3.dot(worldPosDiff, yDir));
    if (xDist <= spacing[0] && yDist <= spacing[1]) {
        return;
    }
    if (startCrossingIndex !== undefined) {
        this.checkAndRemoveCrossesOnEditLine(evt);
    }
    const numPointsAdded = addCanvasPointsToArray(element, editCanvasPoints, canvasPos, this.commonData);
    const currentEditIndex = editIndex + numPointsAdded;
    this.editData.editIndex = currentEditIndex;
    if (startCrossingIndex === undefined && editCanvasPoints.length > 1) {
        this.checkForFirstCrossing(evt, true);
    }
    this.editData.snapIndex = this.findSnapIndex();
    if (this.editData.snapIndex === -1) {
        this.finishEditAndStartNewEdit(evt);
        return;
    }
    this.editData.fusedCanvasPoints = this.fuseEditPointsWithClosedContour(evt);
    if (startCrossingIndex !== undefined &&
        this.checkForSecondCrossing(evt, true)) {
        this.removePointsAfterSecondCrossing(true);
        this.finishEditAndStartNewEdit(evt);
    }
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
}
function finishEditAndStartNewEdit(evt) {
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport, renderingEngine } = enabledElement;
    const { annotation, viewportIdsToRender } = this.commonData;
    const { fusedCanvasPoints, editCanvasPoints } = this.editData;
    const worldPoints = fusedCanvasPoints.map((canvasPoint) => viewport.canvasToWorld(canvasPoint));
    annotation.data.polyline = worldPoints;
    annotation.data.isOpenContour = false;
    this.triggerAnnotationModified(annotation, enabledElement);
    const lastEditCanvasPoint = editCanvasPoints.pop();
    this.editData = {
        prevCanvasPoints: fusedCanvasPoints,
        editCanvasPoints: [lastEditCanvasPoint],
        startCrossingIndex: undefined,
        editIndex: 0,
        snapIndex: undefined,
    };
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
}
function fuseEditPointsWithClosedContour(evt) {
    const { prevCanvasPoints, editCanvasPoints, startCrossingIndex, snapIndex } = this.editData;
    if (startCrossingIndex === undefined || snapIndex === undefined) {
        return;
    }
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    const augmentedEditCanvasPoints = [...editCanvasPoints];
    addCanvasPointsToArray(element, augmentedEditCanvasPoints, prevCanvasPoints[snapIndex], this.commonData);
    if (augmentedEditCanvasPoints.length > editCanvasPoints.length) {
        augmentedEditCanvasPoints.pop();
    }
    let lowIndex;
    let highIndex;
    if (startCrossingIndex > snapIndex) {
        lowIndex = snapIndex;
        highIndex = startCrossingIndex;
    }
    else {
        lowIndex = startCrossingIndex;
        highIndex = snapIndex;
    }
    const distanceBetweenLowAndFirstPoint = gl_matrix_1.vec2.distance(prevCanvasPoints[lowIndex], augmentedEditCanvasPoints[0]);
    const distanceBetweenLowAndLastPoint = gl_matrix_1.vec2.distance(prevCanvasPoints[lowIndex], augmentedEditCanvasPoints[augmentedEditCanvasPoints.length - 1]);
    const distanceBetweenHighAndFirstPoint = gl_matrix_1.vec2.distance(prevCanvasPoints[highIndex], augmentedEditCanvasPoints[0]);
    const distanceBetweenHighAndLastPoint = gl_matrix_1.vec2.distance(prevCanvasPoints[highIndex], augmentedEditCanvasPoints[augmentedEditCanvasPoints.length - 1]);
    const pointSet1 = [];
    for (let i = 0; i < lowIndex; i++) {
        const canvasPoint = prevCanvasPoints[i];
        pointSet1.push([canvasPoint[0], canvasPoint[1]]);
    }
    let inPlaceDistance = distanceBetweenLowAndFirstPoint + distanceBetweenHighAndLastPoint;
    let reverseDistance = distanceBetweenLowAndLastPoint + distanceBetweenHighAndFirstPoint;
    if (inPlaceDistance < reverseDistance) {
        for (let i = 0; i < augmentedEditCanvasPoints.length; i++) {
            const canvasPoint = augmentedEditCanvasPoints[i];
            pointSet1.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    else {
        for (let i = augmentedEditCanvasPoints.length - 1; i >= 0; i--) {
            const canvasPoint = augmentedEditCanvasPoints[i];
            pointSet1.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    for (let i = highIndex; i < prevCanvasPoints.length; i++) {
        const canvasPoint = prevCanvasPoints[i];
        pointSet1.push([canvasPoint[0], canvasPoint[1]]);
    }
    const pointSet2 = [];
    for (let i = lowIndex; i < highIndex; i++) {
        const canvasPoint = prevCanvasPoints[i];
        pointSet2.push([canvasPoint[0], canvasPoint[1]]);
    }
    inPlaceDistance =
        distanceBetweenHighAndFirstPoint + distanceBetweenLowAndLastPoint;
    reverseDistance =
        distanceBetweenHighAndLastPoint + distanceBetweenLowAndFirstPoint;
    if (inPlaceDistance < reverseDistance) {
        for (let i = 0; i < augmentedEditCanvasPoints.length; i++) {
            const canvasPoint = augmentedEditCanvasPoints[i];
            pointSet2.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    else {
        for (let i = augmentedEditCanvasPoints.length - 1; i >= 0; i--) {
            const canvasPoint = augmentedEditCanvasPoints[i];
            pointSet2.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    const areaPointSet1 = calculateAreaOfPoints(pointSet1);
    const areaPointSet2 = calculateAreaOfPoints(pointSet2);
    const pointsToRender = areaPointSet1 > areaPointSet2 ? pointSet1 : pointSet2;
    return pointsToRender;
}
function mouseUpClosedContourEditCallback(evt) {
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    this.completeClosedContourEdit(element);
}
function completeClosedContourEdit(element) {
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport, renderingEngine } = enabledElement;
    const { annotation, viewportIdsToRender } = this.commonData;
    const { fusedCanvasPoints, prevCanvasPoints } = this.editData;
    if (fusedCanvasPoints) {
        const updatedPoints = (0, interpolatePoints_1.shouldInterpolate)(this.configuration)
            ? (0, interpolatePoints_1.getInterpolatedPoints)(this.configuration, fusedCanvasPoints, prevCanvasPoints)
            : fusedCanvasPoints;
        const worldPoints = updatedPoints.map((canvasPoint) => viewport.canvasToWorld(canvasPoint));
        annotation.data.polyline = worldPoints;
        annotation.data.isOpenContour = false;
        annotation.invalidated = true;
        this.triggerAnnotationModified(annotation, enabledElement);
    }
    this.isEditingClosed = false;
    this.editData = undefined;
    this.commonData = undefined;
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
    this.deactivateClosedContourEdit(element);
}
function cancelClosedContourEdit(element) {
    this.completeClosedContourEdit(element);
}
function registerClosedContourEditLoop(toolInstance) {
    toolInstance.activateClosedContourEdit =
        activateClosedContourEdit.bind(toolInstance);
    toolInstance.deactivateClosedContourEdit =
        deactivateClosedContourEdit.bind(toolInstance);
    toolInstance.mouseDragClosedContourEditCallback =
        mouseDragClosedContourEditCallback.bind(toolInstance);
    toolInstance.mouseUpClosedContourEditCallback =
        mouseUpClosedContourEditCallback.bind(toolInstance);
    toolInstance.finishEditAndStartNewEdit =
        finishEditAndStartNewEdit.bind(toolInstance);
    toolInstance.fuseEditPointsWithClosedContour =
        fuseEditPointsWithClosedContour.bind(toolInstance);
    toolInstance.cancelClosedContourEdit =
        cancelClosedContourEdit.bind(toolInstance);
    toolInstance.completeClosedContourEdit =
        completeClosedContourEdit.bind(toolInstance);
}
exports.default = registerClosedContourEditLoop;
//# sourceMappingURL=closedContourEditLoop.js.map