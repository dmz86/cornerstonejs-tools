"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const store_1 = require("../../../store");
const enums_1 = require("../../../enums");
const elementCursor_1 = require("../../../cursors/elementCursor");
const gl_matrix_1 = require("gl-matrix");
const math_1 = require("../../../utilities/math");
const interpolatePoints_1 = require("../../../utilities/planarFreehandROITool/interpolatePoints");
const triggerAnnotationRenderForViewportIds_1 = __importDefault(require("../../../utilities/triggerAnnotationRenderForViewportIds"));
const findOpenUShapedContourVectorToPeak_1 = __importDefault(require("./findOpenUShapedContourVectorToPeak"));
const { addCanvasPointsToArray, getSubPixelSpacingAndXYDirections } = math_1.polyline;
function activateOpenContourEdit(evt, annotation, viewportIdsToRender) {
    this.isEditingOpen = true;
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
    element.addEventListener(enums_1.Events.MOUSE_UP, this.mouseUpOpenContourEditCallback);
    element.addEventListener(enums_1.Events.MOUSE_DRAG, this.mouseDragOpenContourEditCallback);
    element.addEventListener(enums_1.Events.MOUSE_CLICK, this.mouseUpOpenContourEditCallback);
    element.addEventListener(enums_1.Events.TOUCH_END, this.mouseUpOpenContourEditCallback);
    element.addEventListener(enums_1.Events.TOUCH_DRAG, this.mouseDragOpenContourEditCallback);
    element.addEventListener(enums_1.Events.TOUCH_TAP, this.mouseUpOpenContourEditCallback);
    (0, elementCursor_1.hideElementCursor)(element);
}
function deactivateOpenContourEdit(element) {
    store_1.state.isInteractingWithTool = false;
    element.removeEventListener(enums_1.Events.MOUSE_UP, this.mouseUpOpenContourEditCallback);
    element.removeEventListener(enums_1.Events.MOUSE_DRAG, this.mouseDragOpenContourEditCallback);
    element.removeEventListener(enums_1.Events.MOUSE_CLICK, this.mouseUpOpenContourEditCallback);
    element.removeEventListener(enums_1.Events.TOUCH_END, this.mouseUpOpenContourEditCallback);
    element.removeEventListener(enums_1.Events.TOUCH_DRAG, this.mouseDragOpenContourEditCallback);
    element.removeEventListener(enums_1.Events.TOUCH_TAP, this.mouseUpOpenContourEditCallback);
    (0, elementCursor_1.resetElementCursor)(element);
}
function mouseDragOpenContourEditCallback(evt) {
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
        this.checkForFirstCrossing(evt, false);
    }
    this.editData.snapIndex = this.findSnapIndex();
    this.editData.fusedCanvasPoints = this.fuseEditPointsWithOpenContour(evt);
    if (startCrossingIndex !== undefined &&
        this.checkForSecondCrossing(evt, false)) {
        this.removePointsAfterSecondCrossing(false);
        this.finishEditOpenOnSecondCrossing(evt);
    }
    else if (this.checkIfShouldOverwriteAnEnd(evt)) {
        this.openContourEditOverwriteEnd(evt);
    }
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
}
function openContourEditOverwriteEnd(evt) {
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport } = enabledElement;
    const { annotation, viewportIdsToRender } = this.commonData;
    const fusedCanvasPoints = this.fuseEditPointsForOpenContourEndEdit();
    const worldPoints = fusedCanvasPoints.map((canvasPoint) => viewport.canvasToWorld(canvasPoint));
    annotation.data.polyline = worldPoints;
    annotation.data.isOpenContour = true;
    annotation.data.handles.points = [
        worldPoints[0],
        worldPoints[worldPoints.length - 1],
    ];
    annotation.data.handles.activeHandleIndex = 1;
    this.triggerAnnotationModified(annotation, enabledElement);
    this.isEditingOpen = false;
    this.editData = undefined;
    this.commonData = undefined;
    this.deactivateOpenContourEdit(element);
    this.activateOpenContourEndEdit(evt, annotation, viewportIdsToRender, null);
}
function checkIfShouldOverwriteAnEnd(evt) {
    const eventDetail = evt.detail;
    const { currentPoints, lastPoints } = eventDetail;
    const canvasPos = currentPoints.canvas;
    const lastCanvasPos = lastPoints.canvas;
    const { snapIndex, prevCanvasPoints, startCrossingIndex } = this.editData;
    if (startCrossingIndex === undefined || snapIndex === undefined) {
        return false;
    }
    if (snapIndex === -1) {
        return true;
    }
    if (snapIndex !== 0 && snapIndex !== prevCanvasPoints.length - 1) {
        return false;
    }
    const p1 = canvasPos;
    const p2 = lastCanvasPos;
    const p3 = prevCanvasPoints[snapIndex];
    const a = gl_matrix_1.vec2.create();
    const b = gl_matrix_1.vec2.create();
    gl_matrix_1.vec2.set(a, p1[0] - p2[0], p1[1] - p2[1]);
    gl_matrix_1.vec2.set(b, p1[0] - p3[0], p1[1] - p3[1]);
    const aDotb = gl_matrix_1.vec2.dot(a, b);
    const magA = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    const magB = Math.sqrt(b[0] * b[0] + b[1] * b[1]);
    const theta = Math.acos(aDotb / (magA * magB));
    if (theta < Math.PI / 2) {
        return true;
    }
    return false;
}
function fuseEditPointsForOpenContourEndEdit() {
    const { snapIndex, prevCanvasPoints, editCanvasPoints, startCrossingIndex } = this.editData;
    const newCanvasPoints = [];
    if (snapIndex === 0) {
        for (let i = prevCanvasPoints.length - 1; i >= startCrossingIndex; i--) {
            const canvasPoint = prevCanvasPoints[i];
            newCanvasPoints.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    else {
        for (let i = 0; i < startCrossingIndex; i++) {
            const canvasPoint = prevCanvasPoints[i];
            newCanvasPoints.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    const distanceBetweenCrossingIndexAndFirstPoint = gl_matrix_1.vec2.distance(prevCanvasPoints[startCrossingIndex], editCanvasPoints[0]);
    const distanceBetweenCrossingIndexAndLastPoint = gl_matrix_1.vec2.distance(prevCanvasPoints[startCrossingIndex], editCanvasPoints[editCanvasPoints.length - 1]);
    if (distanceBetweenCrossingIndexAndFirstPoint <
        distanceBetweenCrossingIndexAndLastPoint) {
        for (let i = 0; i < editCanvasPoints.length; i++) {
            const canvasPoint = editCanvasPoints[i];
            newCanvasPoints.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    else {
        for (let i = editCanvasPoints.length - 1; i >= 0; i--) {
            const canvasPoint = editCanvasPoints[i];
            newCanvasPoints.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    return newCanvasPoints;
}
function fuseEditPointsWithOpenContour(evt) {
    const { prevCanvasPoints, editCanvasPoints, startCrossingIndex, snapIndex } = this.editData;
    if (startCrossingIndex === undefined || snapIndex === undefined) {
        return undefined;
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
    const pointsToRender = [];
    for (let i = 0; i < lowIndex; i++) {
        const canvasPoint = prevCanvasPoints[i];
        pointsToRender.push([canvasPoint[0], canvasPoint[1]]);
    }
    const inPlaceDistance = distanceBetweenLowAndFirstPoint + distanceBetweenHighAndLastPoint;
    const reverseDistance = distanceBetweenLowAndLastPoint + distanceBetweenHighAndFirstPoint;
    if (inPlaceDistance < reverseDistance) {
        for (let i = 0; i < augmentedEditCanvasPoints.length; i++) {
            const canvasPoint = augmentedEditCanvasPoints[i];
            pointsToRender.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    else {
        for (let i = augmentedEditCanvasPoints.length - 1; i >= 0; i--) {
            const canvasPoint = augmentedEditCanvasPoints[i];
            pointsToRender.push([canvasPoint[0], canvasPoint[1]]);
        }
    }
    for (let i = highIndex; i < prevCanvasPoints.length; i++) {
        const canvasPoint = prevCanvasPoints[i];
        pointsToRender.push([canvasPoint[0], canvasPoint[1]]);
    }
    return pointsToRender;
}
function finishEditOpenOnSecondCrossing(evt) {
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport, renderingEngine } = enabledElement;
    const { annotation, viewportIdsToRender } = this.commonData;
    const { fusedCanvasPoints, editCanvasPoints } = this.editData;
    const worldPoints = fusedCanvasPoints.map((canvasPoint) => viewport.canvasToWorld(canvasPoint));
    annotation.data.polyline = worldPoints;
    annotation.data.isOpenContour = true;
    annotation.data.handles.points = [
        worldPoints[0],
        worldPoints[worldPoints.length - 1],
    ];
    this.triggerAnnotationModified(annotation, enabledElement);
    const lastEditCanvasPoint = editCanvasPoints.pop();
    this.editData = {
        prevCanvasPoints: fusedCanvasPoints,
        editCanvasPoints: [lastEditCanvasPoint],
        startCrossingIndex: undefined,
        editIndex: 0,
    };
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
}
function mouseUpOpenContourEditCallback(evt) {
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    this.completeOpenContourEdit(element);
}
function completeOpenContourEdit(element) {
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
        annotation.data.isOpenContour = true;
        annotation.data.handles.points = [
            worldPoints[0],
            worldPoints[worldPoints.length - 1],
        ];
        if (annotation.data.isOpenUShapeContour) {
            annotation.data.openUShapeContourVectorToPeak =
                (0, findOpenUShapedContourVectorToPeak_1.default)(fusedCanvasPoints, viewport);
        }
        annotation.invalidated = true;
        this.triggerAnnotationModified(annotation, enabledElement);
    }
    this.isEditingOpen = false;
    this.editData = undefined;
    this.commonData = undefined;
    (0, triggerAnnotationRenderForViewportIds_1.default)(renderingEngine, viewportIdsToRender);
    this.deactivateOpenContourEdit(element);
}
function cancelOpenContourEdit(element) {
    this.completeOpenContourEdit(element);
}
function registerOpenContourEditLoop(toolInstance) {
    toolInstance.activateOpenContourEdit =
        activateOpenContourEdit.bind(toolInstance);
    toolInstance.deactivateOpenContourEdit =
        deactivateOpenContourEdit.bind(toolInstance);
    toolInstance.mouseDragOpenContourEditCallback =
        mouseDragOpenContourEditCallback.bind(toolInstance);
    toolInstance.mouseUpOpenContourEditCallback =
        mouseUpOpenContourEditCallback.bind(toolInstance);
    toolInstance.fuseEditPointsWithOpenContour =
        fuseEditPointsWithOpenContour.bind(toolInstance);
    toolInstance.finishEditOpenOnSecondCrossing =
        finishEditOpenOnSecondCrossing.bind(toolInstance);
    toolInstance.checkIfShouldOverwriteAnEnd =
        checkIfShouldOverwriteAnEnd.bind(toolInstance);
    toolInstance.fuseEditPointsForOpenContourEndEdit =
        fuseEditPointsForOpenContourEndEdit.bind(toolInstance);
    toolInstance.openContourEditOverwriteEnd =
        openContourEditOverwriteEnd.bind(toolInstance);
    toolInstance.cancelOpenContourEdit = cancelOpenContourEdit.bind(toolInstance);
    toolInstance.completeOpenContourEdit =
        completeOpenContourEdit.bind(toolInstance);
}
exports.default = registerOpenContourEditLoop;
//# sourceMappingURL=openContourEditLoop.js.map