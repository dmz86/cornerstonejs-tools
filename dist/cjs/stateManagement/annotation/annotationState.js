"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAnnotationManager = exports.getAnnotationManager = exports.setAnnotationManager = exports.removeAllAnnotations = exports.removeAnnotation = exports.getAnnotation = exports.addAnnotation = exports.getNumberOfAnnotations = exports.getAnnotations = void 0;
const core_1 = require("@cornerstonejs/core");
const enums_1 = require("../../enums");
const FrameOfReferenceSpecificAnnotationManager_1 = require("./FrameOfReferenceSpecificAnnotationManager");
const state_1 = require("./helpers/state");
let defaultManager = FrameOfReferenceSpecificAnnotationManager_1.defaultFrameOfReferenceSpecificAnnotationManager;
function getAnnotationManager() {
    return defaultManager;
}
exports.getAnnotationManager = getAnnotationManager;
function setAnnotationManager(annotationManager) {
    defaultManager = annotationManager;
}
exports.setAnnotationManager = setAnnotationManager;
function resetAnnotationManager() {
    defaultManager = FrameOfReferenceSpecificAnnotationManager_1.defaultFrameOfReferenceSpecificAnnotationManager;
}
exports.resetAnnotationManager = resetAnnotationManager;
function getAnnotations(toolName, annotationGroupSelector) {
    const manager = getAnnotationManager();
    const groupKey = manager.getGroupKey(annotationGroupSelector);
    return manager.getAnnotations(groupKey, toolName);
}
exports.getAnnotations = getAnnotations;
function addAnnotation(annotation, annotationGroupSelector) {
    if (annotation.annotationUID === undefined) {
        annotation.annotationUID = core_1.utilities.uuidv4();
    }
    const manager = getAnnotationManager();
    const groupKey = manager.getGroupKey(annotationGroupSelector);
    manager.addAnnotation(annotation, groupKey);
    if (annotationGroupSelector instanceof HTMLDivElement) {
        (0, state_1.triggerAnnotationAddedForElement)(annotation, annotationGroupSelector);
    }
    else {
        (0, state_1.triggerAnnotationAddedForFOR)(annotation);
    }
    return annotation.annotationUID;
}
exports.addAnnotation = addAnnotation;
function getNumberOfAnnotations(toolName, annotationGroupSelector) {
    const manager = getAnnotationManager();
    const groupKey = manager.getGroupKey(annotationGroupSelector);
    return manager.getNumberOfAnnotations(groupKey, toolName);
}
exports.getNumberOfAnnotations = getNumberOfAnnotations;
function removeAnnotation(annotationUID) {
    const manager = getAnnotationManager();
    const annotation = manager.getAnnotation(annotationUID);
    if (!annotation) {
        return;
    }
    manager.removeAnnotation(annotationUID);
    const eventType = enums_1.Events.ANNOTATION_REMOVED;
    const eventDetail = {
        annotation,
        annotationManagerUID: manager.uid,
    };
    (0, core_1.triggerEvent)(core_1.eventTarget, eventType, eventDetail);
}
exports.removeAnnotation = removeAnnotation;
function getAnnotation(annotationUID) {
    const manager = getAnnotationManager();
    const annotation = manager.getAnnotation(annotationUID);
    return annotation;
}
exports.getAnnotation = getAnnotation;
function removeAllAnnotations() {
    const manager = getAnnotationManager();
    manager.removeAllAnnotations();
}
exports.removeAllAnnotations = removeAllAnnotations;
//# sourceMappingURL=annotationState.js.map