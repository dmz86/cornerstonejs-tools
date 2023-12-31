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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSegmentationEvents = exports.segmentIndex = exports.config = exports.segmentLocking = exports.removeSegmentationsFromToolGroup = exports.addSegmentationRepresentations = exports.activeSegmentation = exports.addSegmentations = exports.state = void 0;
const removeSegmentationsFromToolGroup_1 = __importDefault(require("./removeSegmentationsFromToolGroup"));
exports.removeSegmentationsFromToolGroup = removeSegmentationsFromToolGroup_1.default;
const addSegmentations_1 = __importDefault(require("./addSegmentations"));
exports.addSegmentations = addSegmentations_1.default;
const addSegmentationRepresentations_1 = __importDefault(require("./addSegmentationRepresentations"));
exports.addSegmentationRepresentations = addSegmentationRepresentations_1.default;
const activeSegmentation = __importStar(require("./activeSegmentation"));
exports.activeSegmentation = activeSegmentation;
const segmentLocking = __importStar(require("./segmentLocking"));
exports.segmentLocking = segmentLocking;
const state = __importStar(require("./segmentationState"));
exports.state = state;
const config = __importStar(require("./config"));
exports.config = config;
const segmentIndex = __importStar(require("./segmentIndex"));
exports.segmentIndex = segmentIndex;
const triggerSegmentationEvents = __importStar(require("./triggerSegmentationEvents"));
exports.triggerSegmentationEvents = triggerSegmentationEvents;
//# sourceMappingURL=index.js.map