import { triggerEvent, eventTarget, utilities as csUtils, } from '@cornerstonejs/core';
import { Events } from '../../enums';
import { defaultFrameOfReferenceSpecificAnnotationManager } from './FrameOfReferenceSpecificAnnotationManager';
import { triggerAnnotationAddedForElement, triggerAnnotationAddedForFOR, } from './helpers/state';
let defaultManager = defaultFrameOfReferenceSpecificAnnotationManager;
function getAnnotationManager() {
    return defaultManager;
}
function setAnnotationManager(annotationManager) {
    defaultManager = annotationManager;
}
function resetAnnotationManager() {
    defaultManager = defaultFrameOfReferenceSpecificAnnotationManager;
}
function getAnnotations(toolName, annotationGroupSelector) {
    const manager = getAnnotationManager();
    const groupKey = manager.getGroupKey(annotationGroupSelector);
    return manager.getAnnotations(groupKey, toolName);
}
function addAnnotation(annotation, annotationGroupSelector) {
    if (annotation.annotationUID === undefined) {
        annotation.annotationUID = csUtils.uuidv4();
    }
    const manager = getAnnotationManager();
    const groupKey = manager.getGroupKey(annotationGroupSelector);
    manager.addAnnotation(annotation, groupKey);
    if (annotationGroupSelector instanceof HTMLDivElement) {
        triggerAnnotationAddedForElement(annotation, annotationGroupSelector);
    }
    else {
        triggerAnnotationAddedForFOR(annotation);
    }
    return annotation.annotationUID;
}
function getNumberOfAnnotations(toolName, annotationGroupSelector) {
    const manager = getAnnotationManager();
    const groupKey = manager.getGroupKey(annotationGroupSelector);
    return manager.getNumberOfAnnotations(groupKey, toolName);
}
function removeAnnotation(annotationUID) {
    const manager = getAnnotationManager();
    const annotation = manager.getAnnotation(annotationUID);
    if (!annotation) {
        return;
    }
    manager.removeAnnotation(annotationUID);
    const eventType = Events.ANNOTATION_REMOVED;
    const eventDetail = {
        annotation,
        annotationManagerUID: manager.uid,
    };
    triggerEvent(eventTarget, eventType, eventDetail);
}
function getAnnotation(annotationUID) {
    const manager = getAnnotationManager();
    const annotation = manager.getAnnotation(annotationUID);
    return annotation;
}
function removeAllAnnotations() {
    const manager = getAnnotationManager();
    manager.removeAllAnnotations();
}
export { getAnnotations, getNumberOfAnnotations, addAnnotation, getAnnotation, removeAnnotation, removeAllAnnotations, setAnnotationManager, getAnnotationManager, resetAnnotationManager, };
//# sourceMappingURL=annotationState.js.map