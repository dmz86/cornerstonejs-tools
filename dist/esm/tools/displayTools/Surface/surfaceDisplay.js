import { cache, getEnabledElementByIds, utilities, Enums, } from '@cornerstonejs/core';
import * as SegmentationState from '../../../stateManagement/segmentation/segmentationState';
import * as SegmentationConfig from '../../../stateManagement/segmentation/config/segmentationConfig';
import Representations from '../../../enums/SegmentationRepresentations';
import { getToolGroup } from '../../../store/ToolGroupManager';
import removeSurfaceFromElement from './removeSurfaceFromElement';
import addSurfaceToElement from './addSurfaceToElement';
async function addSegmentationRepresentation(toolGroupId, representationInput, toolGroupSpecificConfig) {
    const { segmentationId } = representationInput;
    const segmentationRepresentationUID = utilities.uuidv4();
    const segmentsHidden = new Set();
    const colorLUTIndex = 0;
    const active = true;
    const toolGroupSpecificRepresentation = {
        segmentationId,
        segmentationRepresentationUID,
        type: Representations.Surface,
        segmentsHidden,
        colorLUTIndex,
        active,
        segmentationRepresentationSpecificConfig: {},
        segmentSpecificConfig: {},
        config: {},
    };
    if (toolGroupSpecificConfig) {
        const currentToolGroupConfig = SegmentationConfig.getToolGroupSpecificConfig(toolGroupId);
        const mergedConfig = utilities.deepMerge(currentToolGroupConfig, toolGroupSpecificConfig);
        SegmentationConfig.setToolGroupSpecificConfig(toolGroupId, {
            renderInactiveSegmentations: mergedConfig.renderInactiveSegmentations || true,
            representations: {
                ...mergedConfig.representations,
            },
        });
    }
    SegmentationState.addSegmentationRepresentation(toolGroupId, toolGroupSpecificRepresentation);
    return segmentationRepresentationUID;
}
function removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID, renderImmediate = false) {
    _removeSurfaceFromToolGroupViewports(toolGroupId, segmentationRepresentationUID);
    SegmentationState.removeSegmentationRepresentation(toolGroupId, segmentationRepresentationUID);
    if (renderImmediate) {
        const viewportsInfo = getToolGroup(toolGroupId).getViewportsInfo();
        viewportsInfo.forEach(({ viewportId, renderingEngineId }) => {
            const enabledElement = getEnabledElementByIds(viewportId, renderingEngineId);
            enabledElement.viewport.render();
        });
    }
}
async function render(viewport, representation, toolGroupConfig) {
    const { colorLUTIndex, active, segmentationId, segmentationRepresentationUID, segmentsHidden, } = representation;
    const segmentation = SegmentationState.getSegmentation(segmentationId);
    const SurfaceData = segmentation.representationData[Representations.Surface];
    const { geometryId } = SurfaceData;
    if (!geometryId) {
        console.warn(`No Surfaces found for segmentationId ${segmentationId}. Skipping render.`);
    }
    const geometry = cache.getGeometry(geometryId);
    if (!geometry) {
        throw new Error(`No Surfaces found for geometryId ${geometryId}`);
    }
    if (geometry.type !== Enums.GeometryType.SURFACE) {
        throw new Error(`Geometry type ${geometry.type} not supported for rendering.`);
    }
    if (!geometry.data) {
        console.warn(`No Surfaces found for geometryId ${geometryId}. Skipping render.`);
        return;
    }
    const surface = geometry.data;
    const surfaceUID = `${segmentationRepresentationUID}_${surface.id}}`;
    _renderSurface(viewport, surface, surfaceUID);
    viewport.resetCamera();
    viewport.render();
}
function _renderSurface(viewport, surface, surfaceUID) {
    const actorUID = surfaceUID;
    const actorEntry = viewport.getActor(actorUID);
    if (!actorEntry) {
        addSurfaceToElement(viewport.element, surface, actorUID);
    }
    else {
        throw new Error('Not implemented yet. (Update surface)');
    }
}
function _removeSurfaceFromToolGroupViewports(toolGroupId, segmentationRepresentationUID) {
    const toolGroup = getToolGroup(toolGroupId);
    if (toolGroup === undefined) {
        throw new Error(`ToolGroup with ToolGroupId ${toolGroupId} does not exist`);
    }
    const { viewportsInfo } = toolGroup;
    for (const viewportInfo of viewportsInfo) {
        const { viewportId, renderingEngineId } = viewportInfo;
        const enabledElement = getEnabledElementByIds(viewportId, renderingEngineId);
        removeSurfaceFromElement(enabledElement.viewport.element, segmentationRepresentationUID);
    }
}
export default {
    render,
    addSegmentationRepresentation,
    removeSegmentationRepresentation,
};
//# sourceMappingURL=surfaceDisplay.js.map