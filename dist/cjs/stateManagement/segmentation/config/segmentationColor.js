"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setColorForSegmentIndex = exports.setColorLUT = exports.addColorLUT = exports.getColorForSegmentIndex = void 0;
const core_1 = require("@cornerstonejs/core");
const SegmentationState = __importStar(require("../../../stateManagement/segmentation/segmentationState"));
const triggerSegmentationEvents_1 = require("../triggerSegmentationEvents");
function addColorLUT(colorLUT, colorLUTIndex) {
    if (!colorLUT) {
        throw new Error('addColorLUT: colorLUT is required');
    }
    if (!core_1.utilities.isEqual(colorLUT[0], [0, 0, 0, 0])) {
        console.warn('addColorLUT: [0, 0, 0, 0] color is not provided for the background color (segmentIndex =0), automatically adding it');
        colorLUT.unshift([0, 0, 0, 0]);
    }
    SegmentationState.addColorLUT(colorLUT, colorLUTIndex);
}
exports.addColorLUT = addColorLUT;
function setColorLUT(toolGroupId, segmentationRepresentationUID, colorLUTIndex) {
    const segRepresentation = SegmentationState.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
    if (!segRepresentation) {
        throw new Error(`setColorLUT: could not find segmentation representation with UID ${segmentationRepresentationUID}`);
    }
    if (!SegmentationState.getColorLUT(colorLUTIndex)) {
        throw new Error(`setColorLUT: could not find colorLUT with index ${colorLUTIndex}`);
    }
    segRepresentation.colorLUTIndex = colorLUTIndex;
    (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationModified)(toolGroupId, segmentationRepresentationUID);
}
exports.setColorLUT = setColorLUT;
function getColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex) {
    const segmentationRepresentation = SegmentationState.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationUID);
    if (!segmentationRepresentation) {
        throw new Error(`segmentation representation with UID ${segmentationRepresentationUID} does not exist for tool group ${toolGroupId}`);
    }
    const { colorLUTIndex } = segmentationRepresentation;
    const colorLUT = SegmentationState.getColorLUT(colorLUTIndex);
    return colorLUT[segmentIndex];
}
exports.getColorForSegmentIndex = getColorForSegmentIndex;
function setColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex, color) {
    const colorReference = getColorForSegmentIndex(toolGroupId, segmentationRepresentationUID, segmentIndex);
    for (let i = 0; i < color.length; i++) {
        colorReference[i] = color[i];
    }
    (0, triggerSegmentationEvents_1.triggerSegmentationRepresentationModified)(toolGroupId, segmentationRepresentationUID);
}
exports.setColorForSegmentIndex = setColorForSegmentIndex;
//# sourceMappingURL=segmentationColor.js.map