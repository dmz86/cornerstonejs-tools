"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drawingSvg_1 = require("../../../drawingSvg");
const math_1 = require("../../../utilities/math");
const findOpenUShapedContourVectorToPeak_1 = require("./findOpenUShapedContourVectorToPeak");
const { pointsAreWithinCloseContourProximity } = math_1.polyline;
function _getRenderingOptions(enabledElement, annotation) {
    const styleSpecifier = {
        toolGroupId: this.toolGroupId,
        toolName: this.getToolName(),
        viewportId: enabledElement.viewport.id,
        annotationUID: annotation.annotationUID,
    };
    const lineWidth = this.getStyle('lineWidth', styleSpecifier, annotation);
    const lineDash = this.getStyle('lineDash', styleSpecifier, annotation);
    const color = this.getStyle('color', styleSpecifier, annotation);
    const isOpenContour = annotation.data.isOpenContour;
    const options = {
        color: color === undefined ? undefined : color,
        width: lineWidth === undefined ? undefined : lineWidth,
        lineDash: lineDash === undefined ? undefined : lineDash,
        connectLastToFirst: !isOpenContour,
    };
    return options;
}
function renderContour(enabledElement, svgDrawingHelper, annotation) {
    var _a;
    if (!((_a = enabledElement === null || enabledElement === void 0 ? void 0 : enabledElement.viewport) === null || _a === void 0 ? void 0 : _a.getImageData())) {
        return;
    }
    if (annotation.data.isOpenContour) {
        if (annotation.data.isOpenUShapeContour) {
            calculateUShapeContourVectorToPeakIfNotPresent(enabledElement, annotation);
            this.renderOpenUShapedContour(enabledElement, svgDrawingHelper, annotation);
        }
        else {
            this.renderOpenContour(enabledElement, svgDrawingHelper, annotation);
        }
    }
    else {
        this.renderClosedContour(enabledElement, svgDrawingHelper, annotation);
    }
}
function calculateUShapeContourVectorToPeakIfNotPresent(enabledElement, annotation) {
    if (!annotation.data.openUShapeContourVectorToPeak) {
        annotation.data.openUShapeContourVectorToPeak =
            (0, findOpenUShapedContourVectorToPeak_1.findOpenUShapedContourVectorToPeakOnRender)(enabledElement, annotation);
    }
}
function renderClosedContour(enabledElement, svgDrawingHelper, annotation) {
    const { viewport } = enabledElement;
    const options = this._getRenderingOptions(enabledElement, annotation);
    const canvasPoints = annotation.data.polyline.map((worldPos) => viewport.worldToCanvas(worldPos));
    const polylineUID = '1';
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, polylineUID, canvasPoints, options);
}
function renderOpenContour(enabledElement, svgDrawingHelper, annotation) {
    var _a;
    const { viewport } = enabledElement;
    const options = this._getRenderingOptions(enabledElement, annotation);
    const canvasPoints = annotation.data.polyline.map((worldPos) => viewport.worldToCanvas(worldPos));
    const polylineUID = '1';
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, polylineUID, canvasPoints, options);
    const activeHandleIndex = annotation.data.handles.activeHandleIndex;
    if (((_a = this.configuration.alwaysRenderOpenContourHandles) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
        const radius = this.configuration.alwaysRenderOpenContourHandles.radius;
        const handleGroupUID = '0';
        const handlePoints = [
            canvasPoints[0],
            canvasPoints[canvasPoints.length - 1],
        ];
        if (activeHandleIndex === 0) {
            handlePoints.shift();
        }
        else if (activeHandleIndex === 1) {
            handlePoints.pop();
        }
        (0, drawingSvg_1.drawHandles)(svgDrawingHelper, annotation.annotationUID, handleGroupUID, handlePoints, {
            color: options.color,
            handleRadius: radius,
        });
    }
    if (activeHandleIndex !== null) {
        const handleGroupUID = '1';
        const indexOfCanvasPoints = activeHandleIndex === 0 ? 0 : canvasPoints.length - 1;
        const handlePoint = canvasPoints[indexOfCanvasPoints];
        (0, drawingSvg_1.drawHandles)(svgDrawingHelper, annotation.annotationUID, handleGroupUID, [handlePoint], { color: options.color });
    }
}
function renderOpenUShapedContour(enabledElement, svgDrawingHelper, annotation) {
    const { viewport } = enabledElement;
    const { polyline, openUShapeContourVectorToPeak } = annotation.data;
    this.renderOpenContour(enabledElement, svgDrawingHelper, annotation);
    if (!openUShapeContourVectorToPeak) {
        return;
    }
    const firstCanvasPoint = viewport.worldToCanvas(polyline[0]);
    const lastCanvasPoint = viewport.worldToCanvas(polyline[polyline.length - 1]);
    const openUShapeContourVectorToPeakCanvas = [
        viewport.worldToCanvas(openUShapeContourVectorToPeak[0]),
        viewport.worldToCanvas(openUShapeContourVectorToPeak[1]),
    ];
    const options = this._getRenderingOptions(enabledElement, annotation);
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, 'first-to-last', [firstCanvasPoint, lastCanvasPoint], {
        color: options.color,
        width: options.width,
        connectLastToFirst: false,
        lineDash: '2,2',
    });
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, 'midpoint-to-open-contour', [
        openUShapeContourVectorToPeakCanvas[0],
        openUShapeContourVectorToPeakCanvas[1],
    ], {
        color: options.color,
        width: options.width,
        connectLastToFirst: false,
        lineDash: '2,2',
    });
}
function renderContourBeingDrawn(enabledElement, svgDrawingHelper, annotation) {
    const options = this._getRenderingOptions(enabledElement, annotation);
    const { allowOpenContours } = this.configuration;
    const { canvasPoints } = this.drawData;
    options.connectLastToFirst = false;
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, '1', canvasPoints, options);
    if (allowOpenContours) {
        const firstPoint = canvasPoints[0];
        const lastPoint = canvasPoints[canvasPoints.length - 1];
        if (pointsAreWithinCloseContourProximity(firstPoint, lastPoint, this.configuration.closeContourProximity)) {
            (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, '2', [lastPoint, firstPoint], options);
        }
        else {
            const handleGroupUID = '0';
            (0, drawingSvg_1.drawHandles)(svgDrawingHelper, annotation.annotationUID, handleGroupUID, [firstPoint], { color: options.color, handleRadius: 2 });
        }
    }
}
function renderClosedContourBeingEdited(enabledElement, svgDrawingHelper, annotation) {
    const { fusedCanvasPoints } = this.editData;
    if (fusedCanvasPoints === undefined) {
        this.renderClosedContour(enabledElement, svgDrawingHelper, annotation);
        return;
    }
    const options = this._getRenderingOptions(enabledElement, annotation);
    const polylineUIDToRender = 'preview-1';
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, polylineUIDToRender, fusedCanvasPoints, options);
}
function renderOpenContourBeingEdited(enabledElement, svgDrawingHelper, annotation) {
    const { fusedCanvasPoints } = this.editData;
    if (fusedCanvasPoints === undefined) {
        this.renderOpenContour(enabledElement, svgDrawingHelper, annotation);
        return;
    }
    const options = this._getRenderingOptions(enabledElement, annotation);
    const polylineUIDToRender = 'preview-1';
    (0, drawingSvg_1.drawPolyline)(svgDrawingHelper, annotation.annotationUID, polylineUIDToRender, fusedCanvasPoints, options);
}
function registerRenderMethods(toolInstance) {
    toolInstance.renderContour = renderContour.bind(toolInstance);
    toolInstance.renderClosedContour = renderClosedContour.bind(toolInstance);
    toolInstance.renderOpenContour = renderOpenContour.bind(toolInstance);
    toolInstance.renderOpenUShapedContour =
        renderOpenUShapedContour.bind(toolInstance);
    toolInstance.renderContourBeingDrawn =
        renderContourBeingDrawn.bind(toolInstance);
    toolInstance.renderClosedContourBeingEdited =
        renderClosedContourBeingEdited.bind(toolInstance);
    toolInstance.renderOpenContourBeingEdited =
        renderOpenContourBeingEdited.bind(toolInstance);
    toolInstance._getRenderingOptions = _getRenderingOptions.bind(toolInstance);
}
exports.default = registerRenderMethods;
//# sourceMappingURL=renderMethods.js.map