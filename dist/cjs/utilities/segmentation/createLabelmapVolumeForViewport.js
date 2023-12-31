"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_clonedeep_1 = require("lodash.clonedeep");
const core_1 = require("@cornerstonejs/core");
function createLabelmapVolumeForViewport(input) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { viewportId, renderingEngineId, options } = input;
        let { segmentationId } = input;
        const enabledElement = (0, core_1.getEnabledElementByIds)(viewportId, renderingEngineId);
        if (!enabledElement) {
            throw new Error('element disabled');
        }
        const { viewport } = enabledElement;
        if (!(viewport instanceof core_1.VolumeViewport)) {
            throw new Error('Segmentation only supports VolumeViewport');
        }
        const { uid } = viewport.getDefaultActor();
        if (segmentationId === undefined) {
            segmentationId = `${uid}-based-segmentation-${(_a = options === null || options === void 0 ? void 0 : options.volumeId) !== null && _a !== void 0 ? _a : core_1.utilities.uuidv4().slice(0, 8)}`;
        }
        if (options) {
            const properties = (0, lodash_clonedeep_1._cloneDeep)(options);
            yield core_1.volumeLoader.createLocalVolume(properties, segmentationId);
        }
        else {
            const { uid: volumeId } = viewport.getDefaultActor();
            yield core_1.volumeLoader.createAndCacheDerivedVolume(volumeId, {
                volumeId: segmentationId,
            });
        }
        return segmentationId;
    });
}
exports.default = createLabelmapVolumeForViewport;
//# sourceMappingURL=createLabelmapVolumeForViewport.js.map