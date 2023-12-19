import { getEnabledElement, Enums, VolumeViewport3D, } from '@cornerstonejs/core';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkClipClosedSurface from '@kitware/vtk.js/Filters/General/ClipClosedSurface';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';
import { pointToString } from '../../../utilities/pointToString';
const polyDataCache = new Map();
function addSurfaceToElement(element, surface, actorUID) {
    const enabledElement = getEnabledElement(element);
    const { viewport } = enabledElement;
    const points = surface.getPoints();
    const polys = surface.getPolys();
    const color = surface.getColor();
    const polyData = vtkPolyData.newInstance();
    polyData.getPoints().setData(points, 3);
    const triangles = vtkCellArray.newInstance({
        values: Float32Array.from(polys),
    });
    polyData.setPolys(triangles);
    const mapper = vtkMapper.newInstance({});
    let clippingFilter;
    if (!(viewport instanceof VolumeViewport3D)) {
        clippingFilter = vtkClipClosedSurface.newInstance({
            clippingPlanes: [],
            activePlaneId: 2,
            passPointData: false,
        });
        clippingFilter.setInputData(polyData);
        clippingFilter.setGenerateOutline(true);
        clippingFilter.setGenerateFaces(false);
        clippingFilter.update();
        const filteredData = clippingFilter.getOutputData();
        mapper.setInputData(filteredData);
    }
    else {
        mapper.setInputData(polyData);
    }
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().setColor(color[0] / 255, color[1] / 255, color[2] / 255);
    viewport.addActor({
        actor,
        uid: actorUID,
        clippingFilter,
    });
    element.addEventListener(Enums.Events.CLIPPING_PLANES_UPDATED, updateSurfacePlanes);
}
function updateSurfacePlanes(evt) {
    const { actorEntry, vtkPlanes, viewport } = evt.detail;
    if (!actorEntry?.clippingFilter) {
        return;
    }
    const mapper = actorEntry.actor.getMapper();
    const { viewPlaneNormal } = viewport.getCamera();
    const imageIndex = viewport.getCurrentImageIdIndex();
    const cacheId = `${viewport.id}-${pointToString(viewPlaneNormal)}-${imageIndex}`;
    let actorCache = polyDataCache.get(actorEntry.uid);
    if (!actorCache) {
        actorCache = new Map();
        polyDataCache.set(actorEntry.uid, actorCache);
    }
    let polyData = actorCache.get(cacheId);
    if (!polyData) {
        const clippingFilter = actorEntry.clippingFilter;
        clippingFilter.setClippingPlanes(vtkPlanes);
        try {
            clippingFilter.update();
            polyData = clippingFilter.getOutputData();
            actorCache.set(cacheId, polyData);
        }
        catch (e) {
            console.error('Error clipping surface', e);
        }
    }
    mapper.setInputData(polyData);
}
export default addSurfaceToElement;
//# sourceMappingURL=addSurfaceToElement.js.map