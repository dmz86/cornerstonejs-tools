"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cornerstonejs/core");
const store_1 = require("../../../store");
const enums_1 = require("../../../enums");
const elementCursor_1 = require("../../../cursors/elementCursor");
const math_1 = require("../../../utilities/math");
const { getSubPixelSpacingAndXYDirections } = math_1.polyline;
function activateOpenContourEndEdit(evt, annotation, viewportIdsToRender, handle) {
    this.isDrawing = true;
    const eventDetail = evt.detail;
    const { element } = eventDetail;
    const enabledElement = (0, core_1.getEnabledElement)(element);
    const { viewport } = enabledElement;
    const { spacing, xDir, yDir } = getSubPixelSpacingAndXYDirections(viewport, this.configuration.subPixelResolution);
    const canvasPoints = annotation.data.polyline.map(viewport.worldToCanvas);
    const handleIndexGrabbed = annotation.data.handles.activeHandleIndex;
    if (handleIndexGrabbed === 0) {
        canvasPoints.reverse();
    }
    let movingTextBox = false;
    if (handle.worldPosition) {
        movingTextBox = true;
    }
    this.drawData = {
        canvasPoints: canvasPoints,
        polylineIndex: canvasPoints.length - 1,
    };
    this.commonData = {
        annotation,
        viewportIdsToRender,
        spacing,
        xDir,
        yDir,
        movingTextBox,
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
function registerOpenContourEndEditLoop(toolInstance) {
    toolInstance.activateOpenContourEndEdit =
        activateOpenContourEndEdit.bind(toolInstance);
}
exports.default = registerOpenContourEndEditLoop;
//# sourceMappingURL=openContourEndEditLoop.js.map