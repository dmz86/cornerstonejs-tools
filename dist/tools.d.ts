import { Corners } from '@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget/Constants';
import type { GetGPUTier } from 'detect-gpu';
import { IColorMapPreset } from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import type { mat4 } from 'gl-matrix';
import type { TierResult } from 'detect-gpu';
import type vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkAnnotatedCubeActor from '@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor';
import type { vtkColorTransferFunction } from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import type { vtkImageData } from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import type { vtkPiecewiseFunction } from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import type vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';

declare namespace activeSegmentation {
    export {
        getActiveSegmentationRepresentation,
        setActiveSegmentationRepresentation
    }
}

declare type Actor = vtkActor;

/**
 * Cornerstone Actor Entry including actor uid, actual Actor, and
 * slabThickness for the actor. ActorEntry is the object that
 * is retrieved from viewport when calling viewport.getActor(s)
 */
declare type ActorEntry = {
    /** actor UID */
    uid: string;
    /** actual actor object */
    actor: Actor | VolumeActor | ImageActor;
    /** the id of the reference volume from which this actor is derived or created*/
    referenceId?: string;
    /** slab thickness for the actor */
    slabThickness?: number;
    /** clipping filter applied to actor surfaces*/
    clippingFilter?: any;
};

/**
 * Object containing the min, max and current position in the normal direction
 * for the actor
 */
declare type ActorSliceRange = {
    actor: VolumeActor;
    viewPlaneNormal: Point3;
    focalPoint: Point3;
    min: number;
    max: number;
    current: number;
};

declare function addAnnotation(annotation: Annotation, annotationGroupSelector: AnnotationGroupSelector): string;

declare const addCanvasPointsToArray: (element: HTMLDivElement, canvasPoints: Types_2.Point2[], newCanvasPoint: Types_2.Point2, commonData: PlanarFreehandROICommonData) => number;

declare function addColorLUT(colorLUT: ColorLUT, index: number): void;

declare function addColorLUT_2(colorLUT: ColorLUT, colorLUTIndex: number): void;

declare function addSegmentation(segmentationInput: SegmentationPublicInput, suppressEvents?: boolean): void;

declare function addSegmentationRepresentation(toolGroupId: string, segmentationRepresentation: ToolGroupSpecificRepresentation, suppressEvents?: boolean): void;

declare function addSegmentationRepresentations(toolGroupId: string, representationInputArray: RepresentationPublicInput[], toolGroupSpecificRepresentationConfig?: SegmentationRepresentationConfig): Promise<string[]>;

declare function addSegmentations(segmentationInputArray: SegmentationPublicInput[]): void;

export declare function addTool(ToolClass: any): void;

declare function addToolState(element: HTMLDivElement, data: CINETypes.ToolData): void;

declare interface AdvancedMagnifyAnnotation extends Annotation {
    data: {
        zoomFactor: number;
        sourceViewportId: string;
        magnifyViewportId: string;
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
        };
    };
}

export declare class AdvancedMagnifyTool extends AnnotationTool {
    static toolName: any;
    magnifyViewportManager: AdvancedMagnifyViewportManager;
    touchDragCallback: any;
    mouseDragCallback: any;
    editData: {
        annotation: any;
        viewportIdsToRender: Array<string>;
        handleIndex?: number;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => AdvancedMagnifyAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: AdvancedMagnifyAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: AdvancedMagnifyAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: AdvancedMagnifyAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragDrawCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragModifyCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragHandle: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    showZoomFactorsList(evt: EventTypes_2.InteractionEventType, annotation: AdvancedMagnifyAnnotation): void;
    private _getZoomFactorsListDropdown;
    private _getWorldHandlesPoints;
}

declare class AdvancedMagnifyViewport {
    private _viewportId;
    private _sourceEnabledElement;
    private _enabledElement;
    private _sourceToolGroup;
    private _magnifyToolGroup;
    private _isViewportReady;
    private _radius;
    private _resized;
    private _resizeViewportAsync;
    private _canAutoPan;
    private _autoPan;
    position: Types_2.Point2;
    zoomFactor: number;
    visible: boolean;
    constructor({ magnifyViewportId, sourceEnabledElement, radius, position, zoomFactor, autoPan, }: {
        magnifyViewportId?: string;
        sourceEnabledElement: Types_2.IEnabledElement;
        radius?: number;
        position?: Types_2.Point2;
        zoomFactor: number;
        autoPan: {
            enabled: boolean;
            padding: number;
            callback: AutoPanCallback;
        };
    });
    get sourceEnabledElement(): Types_2.IEnabledElement;
    get viewportId(): string;
    get radius(): number;
    set radius(radius: number);
    update(): void;
    dispose(): void;
    private _handleToolModeChanged;
    private _inheritBorderRadius;
    private _createViewportNode;
    private _convertZoomFactorToParalellScale;
    private _isStackViewport;
    private _isVolumeViewport;
    private _cloneToolGroups;
    private _cloneStack;
    private _cloneVolumes;
    private _cloneViewport;
    private _cancelMouseEventCallback;
    private _browserMouseUpCallback;
    private _browserMouseDownCallback;
    private _mouseDragCallback;
    private _addBrowserEventListeners;
    private _removeBrowserEventListeners;
    private _addEventListeners;
    private _removeEventListeners;
    private _initialize;
    private _syncViewportsCameras;
    private _syncStackViewports;
    private _syncViewports;
    private _resizeViewport;
}

declare class AdvancedMagnifyViewportManager {
    private static _singleton;
    private _magnifyViewportsMap;
    constructor();
    static getInstance(): AdvancedMagnifyViewportManager;
    createViewport: (annotation: AdvancedMagnifyAnnotation, viewportInfo: MagnifyViewportInfo) => AdvancedMagnifyViewport;
    getViewport(magnifyViewportId: string): AdvancedMagnifyViewport;
    dispose(): void;
    private _destroyViewport;
    private _destroyViewports;
    private _annotationRemovedCallback;
    private _getMagnifyViewportsMapEntriesBySourceViewportId;
    private _newStackImageCallback;
    private _newVolumeImageCallback;
    private _addEventListeners;
    private _removeEventListeners;
    private _addSourceElementEventListener;
    private _removeSourceElementEventListener;
    private _initialize;
}

declare type AffineMatrix = [
[number, number, number, number],
[number, number, number, number],
[number, number, number, number],
[number, number, number, number]
];

declare interface AngleAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats: {
            [targetId: string]: {
                angle: number;
            };
        };
    };
}

export declare class AngleTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    angleStartedNotYetCompleted: boolean;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => AngleAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: AngleAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: AngleAnnotation) => void;
    handleSelectedCallback(evt: EventTypes_2.InteractionEventType, annotation: AngleAnnotation, handle: ToolHandle): void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: HTMLDivElement) => void;
    _deactivateModify: (element: HTMLDivElement) => void;
    _activateDraw: (element: HTMLDivElement) => void;
    _deactivateDraw: (element: HTMLDivElement) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats(annotation: any, renderingEngine: any, enabledElement: any): any;
}

declare type Annotation = {
    annotationUID?: string;
    highlighted?: boolean;
    isLocked?: boolean;
    isVisible?: boolean;
    invalidated?: boolean;
    metadata: {
        cameraPosition?: Types_2.Point3;
        cameraFocalPoint?: Types_2.Point3;
        viewPlaneNormal?: Types_2.Point3;
        viewUp?: Types_2.Point3;
        FrameOfReferenceUID: string;
        toolName: string;
        referencedImageId?: string;
        volumeId?: string;
    };
    data: {
        handles?: {
            points?: Types_2.Point3[];
            activeHandleIndex?: number | null;
            textBox?: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox?: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
            [key: string]: any;
        };
        [key: string]: any;
        cachedStats?: unknown;
    };
};

declare namespace annotation {
    export {
        config,
        locking,
        selection,
        state_2 as state,
        visibility,
        FrameOfReferenceSpecificAnnotationManager
    }
}
export { annotation }

declare type AnnotationAddedEventDetail = {
    viewportId: string;
    renderingEngineId: string;
    annotation: Annotation;
};

declare type AnnotationAddedEventType = Types_2.CustomEventType<AnnotationAddedEventDetail>;

declare type AnnotationCompletedEventDetail = {
    annotation: Annotation;
};

declare type AnnotationCompletedEventType = Types_2.CustomEventType<AnnotationCompletedEventDetail>;

export declare abstract class AnnotationDisplayTool extends BaseTool {
    static toolName: any;
    abstract renderAnnotation(enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper): any;
    filterInteractableAnnotationsForElement(element: HTMLDivElement, annotations: Annotations): Annotations | undefined;
    onImageSpacingCalibrated: (evt: Types_2.EventTypes.ImageSpacingCalibratedEvent) => void;
    protected getReferencedImageId(viewport: Types_2.IViewport, worldPos: Types_2.Point3, viewPlaneNormal: Types_2.Point3, viewUp: Types_2.Point3): string;
    getStyle(property: string, specifications: StyleSpecifier, annotation?: Annotation): unknown;
}

declare type AnnotationGroupSelector = HTMLDivElement | string;

declare type AnnotationHandle = Types_2.Point3;

declare type AnnotationLockChangeEventDetail = {
    added: Array<Annotation>;
    removed: Array<Annotation>;
    locked: Array<Annotation>;
};

declare type AnnotationLockChangeEventType = Types_2.CustomEventType<AnnotationLockChangeEventDetail>;

declare type AnnotationModifiedEventDetail = {
    viewportId: string;
    renderingEngineId: string;
    annotation: Annotation;
};

declare type AnnotationModifiedEventType = Types_2.CustomEventType<AnnotationModifiedEventDetail>;

declare type AnnotationRemovedEventDetail = {
    annotation: Annotation;
    annotationManagerUID: string;
};

declare type AnnotationRemovedEventType = Types_2.CustomEventType<AnnotationRemovedEventDetail>;

declare type AnnotationRenderedEventDetail = {
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
};

declare type AnnotationRenderedEventType = Types_2.CustomEventType<AnnotationRenderedEventDetail>;

declare type Annotations = Array<Annotation>;

declare type AnnotationSelectionChangeEventDetail = {
    added: Array<string>;
    removed: Array<string>;
    selection: Array<string>;
};

declare type AnnotationSelectionChangeEventType = Types_2.CustomEventType<AnnotationSelectionChangeEventDetail>;

declare type AnnotationState = {
    [key: string]: GroupSpecificAnnotations;
};

declare namespace AnnotationStyle {
    export {
        AnnotationStyle_2 as AnnotationStyle,
        ToolStyleConfig,
        StyleConfig,
        StyleSpecifier
    }
}

declare type AnnotationStyle_2 = {
    [key in `${Properties}${States}${Modes}`]?: string;
};

declare enum AnnotationStyleStates {
    Default = "",
    Highlighted = "Highlighted",
    Selected = "Selected",
    Locked = "Locked"
}

export declare abstract class AnnotationTool extends AnnotationDisplayTool {
    static toolName: any;
    constructor(toolProps: PublicToolProps, defaultToolProps: ToolProps);
    abstract addNewAnnotation(evt: EventTypes_2.InteractionEventType, interactionType: InteractionTypes): Annotation;
    abstract cancel(element: HTMLDivElement): any;
    abstract handleSelectedCallback(evt: EventTypes_2.InteractionEventType, annotation: Annotation, handle: ToolHandle, interactionType: InteractionTypes): void;
    abstract toolSelectedCallback(evt: EventTypes_2.InteractionEventType, annotation: Annotation, interactionType: InteractionTypes, canvasCoords?: Types_2.Point2): void;
    abstract isPointNearTool(element: HTMLDivElement, annotation: Annotation, canvasCoords: Types_2.Point2, proximity: number, interactionType: string): boolean;
    mouseMoveCallback: (evt: EventTypes_2.MouseMoveEventType, filteredAnnotations?: Annotations) => boolean;
    getHandleNearImagePoint(element: HTMLDivElement, annotation: Annotation, canvasCoords: Types_2.Point2, proximity: number): ToolHandle | undefined;
    getLinkedTextBoxStyle(specifications: StyleSpecifier, annotation?: Annotation): Record<string, unknown>;
    isSuvScaled(viewport: Types_2.IStackViewport | Types_2.IVolumeViewport, targetId: string, imageId?: string): boolean;
    private _imagePointNearToolOrHandle;
}

declare type AnnotationVisibilityChangeEventDetail = {
    lastHidden: Array<string>;
    lastVisible: Array<string>;
    hidden: Array<string>;
};

declare type AnnotationVisibilityChangeEventType = Types_2.CustomEventType<AnnotationVisibilityChangeEventDetail>;

export declare class ArrowAnnotateTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => ArrowAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: ArrowAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: ArrowAnnotation) => void;
    handleSelectedCallback(evt: EventTypes_2.InteractionEventType, annotation: ArrowAnnotation, handle: ToolHandle): void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    touchTapCallback: (evt: EventTypes_2.TouchTapEventType) => void;
    doubleClickCallback: (evt: EventTypes_2.TouchTapEventType) => void;
    _doneChangingTextCallback(element: any, annotation: any, updatedText: any): void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: HTMLDivElement) => void;
    _deactivateModify: (element: HTMLDivElement) => void;
    _activateDraw: (element: HTMLDivElement) => void;
    _deactivateDraw: (element: HTMLDivElement) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _isInsideVolume(index1: any, index2: any, dimensions: any): boolean;
}

declare interface ArrowAnnotation extends Annotation {
    data: {
        text: string;
        handles: {
            points: Types_2.Point3[];
            arrowFirst: boolean;
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
    };
}

declare type AutoPanCallback = (data: AutoPanCallbackData) => void;

declare type AutoPanCallbackData = {
    points: {
        currentPosition: {
            canvas: Types_2.Point2;
            world: Types_2.Point3;
        };
        newPosition: {
            canvas: Types_2.Point2;
            world: Types_2.Point3;
        };
    };
    delta: {
        canvas: Types_2.Point2;
        world: Types_2.Point3;
    };
};

export declare abstract class BaseTool implements IBaseTool {
    static toolName: any;
    supportedInteractionTypes: InteractionTypes[];
    configuration: Record<string, any>;
    toolGroupId: string;
    mode: ToolModes;
    constructor(toolProps: PublicToolProps, defaultToolProps: ToolProps);
    getToolName(): string;
    applyActiveStrategy(enabledElement: Types_2.IEnabledElement, operationData: unknown): any;
    setConfiguration(newConfiguration: Record<string, any>): void;
    setActiveStrategy(strategyName: string): void;
    private getTargetVolumeId;
    protected getTargetIdImage(targetId: string, renderingEngine: Types_2.IRenderingEngine): Types_2.IImageData | Types_2.CPUIImageData | Types_2.IImageVolume;
    protected getTargetId(viewport: Types_2.IViewport): string | undefined;
}

declare namespace BasicStatsCalculator {
    export {
        BasicStatsCalculator_2 as BasicStatsCalculator,
        Calculator
    }
}

declare class BasicStatsCalculator_2 extends Calculator {
    private static max;
    private static currentMax;
    private static sum;
    private static sumSquares;
    private static squaredDiffSum;
    private static count;
    static statsCallback: ({ value: newValue }: {
        value: any;
    }) => void;
    static getStatistics: () => Statistics[];
}

declare interface BidirectionalAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats: {
            [targetId: string]: {
                length: number;
                width: number;
                unit: string;
            };
        };
    };
}

export declare class BidirectionalTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    preventHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation(evt: EventTypes_2.InteractionEventType): BidirectionalAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: BidirectionalAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: BidirectionalAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: BidirectionalAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragDrawCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragModifyCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragModifyHandle: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _movingLongAxisWouldPutItThroughShortAxis: (firstLineSegment: any, secondLineSegment: any) => boolean;
    _calculateLength(pos1: any, pos2: any): number;
    _calculateCachedStats: (annotation: any, renderingEngine: any, enabledElement: any) => any;
    _isInsideVolume: (index1: any, index2: any, index3: any, index4: any, dimensions: any) => boolean;
    _getSignedAngle: (vector1: any, vector2: any) => number;
}

/**
 * Enums for blendModes for viewport images based on vtk.js
 *
 * It should be noted that if crosshairs are enabled and can modify the slab thickness,
 * then it will not show any difference unless MAXIMUM_INTENSITY_BLEND is set on the viewport
 * as the blend.
 */
declare enum BlendModes {
    /** composite blending - suitable for compositing multiple images */
    COMPOSITE = BlendMode.COMPOSITE_BLEND,
    /** maximum intensity projection */
    MAXIMUM_INTENSITY_BLEND = BlendMode.MAXIMUM_INTENSITY_BLEND,
    /** minimum intensity projection */
    MINIMUM_INTENSITY_BLEND = BlendMode.MINIMUM_INTENSITY_BLEND,
    /** average intensity projection */
    AVERAGE_INTENSITY_BLEND = BlendMode.AVERAGE_INTENSITY_BLEND,
}

declare namespace boundingBox {
    export {
        extend2DBoundingBoxInViewAxis,
        getBoundingBoxAroundShape
    }
}

declare type BoundsIJK = [Types_2.Point2, Types_2.Point2, Types_2.Point2];

export declare class BrushTool extends BaseTool {
    static toolName: any;
    private _editData;
    private _hoverData?;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    onSetToolPassive: () => void;
    onSetToolEnabled: () => void;
    onSetToolDisabled: () => void;
    private disableCursor;
    preMouseDownCallback: (evt: EventTypes_2.MouseDownActivateEventType) => boolean;
    mouseMoveCallback: (evt: EventTypes_2.InteractionEventType) => void;
    private updateCursor;
    private _dragCallback;
    private _calculateCursor;
    private _endCallback;
    private _activateDraw;
    private _deactivateDraw;
    invalidateBrushCursor(): void;
    renderAnnotation(enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper): void;
}

declare function calculateAreaOfPoints(points: Types_2.Point2[]): number;

declare abstract class Calculator {
    static run: ({ value }: {
        value: any;
    }) => void;
    static getStatistics: () => Statistics[];
}

declare function calibrateImageSpacing(imageId: string, renderingEngine: Types_2.IRenderingEngine, calibrationOrScale: Types_2.IImageCalibration | number): void;

/**
 * Defines the calibration types available.  These define how the units
 * for measurements are specified.
 */
declare enum CalibrationTypes {
    /**
     * Not applicable means the units are directly defind by the underlying
     * hardware, such as CT and MR volumetric displays, so no special handling
     * or notification is required.
     */
    NOT_APPLICABLE = '',
    /**
     * ERMF is estimated radiographic magnification factor.  This defines how
     * much the image is magnified at the detector as opposed to the location in
     * the body of interest.  This occurs because the radiation beam is expanding
     * and effectively magnifies the image on the detector compared to where the
     * point of interest in the body is.
     * This suggests that measurements can be partially trusted, but the user
     * still needs to be aware that different depths within the body have differing
     * ERMF values, so precise measurements would still need to be manually calibrated.
     */
    ERMF = 'ERMF',
    /**
     * User calibration means that the user has provided a custom calibration
     * specifying how large the image data is.  This type can occur on
     * volumetric images, eg for scout images that might have invalid spacing
     * tags.
     */
    USER = 'User',
    /**
     * A projection calibration means the raw detector size, without any
     * ERMF applied, meaning that the size in the body cannot be trusted and
     * that a calibration should be applied.
     * This is different from Error in that there is simply no magnification
     * factor applied as opposed to having multiple, inconsistent magnification
     * factors.
     */
    PROJECTION = 'Proj',
    /**
     * A region calibration is used for other types of images, typically
     * ultrasouunds where the distance in the image may mean something other than
     * physical distance, such as mV or Hz or some other measurement values.
     */
    REGION = 'Region',
    /**
     * Error is used to define mismatches between various units, such as when
     * there are two different ERMF values specified.  This is an indication to
     * NOT trust the measurement values but to manually calibrate.
     */
    ERROR = 'Error',
    /** Uncalibrated image */
    UNCALIBRATED = 'Uncalibrated',
}

/**
 * CameraModified Event type
 */
declare type CameraModifiedEvent = CustomEvent_2<CameraModifiedEventDetail>;

/**
 * CAMERA_MODIFIED Event's data
 */
declare type CameraModifiedEventDetail = {
    /** Previous camera properties */
    previousCamera: ICamera;
    /** Current camera properties */
    camera: ICamera;
    /** Viewport HTML element in the DOM */
    element: HTMLDivElement;
    /** Viewport Unique ID in the renderingEngine */
    viewportId: string;
    /** Unique ID for the renderingEngine */
    renderingEngineId: string;
    /** Rotation Optional */
    rotation?: number;
};

export declare function cancelActiveManipulations(element: HTMLDivElement): string | undefined;

declare type canvasCoordinates = [
Types_2.Point2,
Types_2.Point2,
Types_2.Point2,
Types_2.Point2
];

declare function checkAndDefineIsLockedProperty(annotation: Annotation): void;

declare function checkAndDefineIsVisibleProperty(annotation: Annotation): void;

declare namespace cine {
    export {
        playClip,
        stopClip,
        Events_2 as Events,
        getToolState,
        addToolState
    }
}

declare type CinePlayContext = {
    get numScrollSteps(): number;
    get currentStepIndex(): number;
    get frameTimeVectorEnabled(): boolean;
    waitForRenderedCount?: number;
    scroll(delta: number): void;
};

declare namespace CINETypes {
    export {
        PlayClipOptions,
        ToolData,
        CinePlayContext
    }
}

declare interface CircleROIAnnotation extends Annotation {
    data: {
        handles: {
            points: [Types_2.Point3, Types_2.Point3];
            activeHandleIndex: number | null;
            textBox?: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats?: ROICachedStats & {
            [targetId: string]: {
                radius: number;
                radiusUnit: string;
                perimeter: number;
            };
        };
    };
}

export declare class CircleROITool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: Array<string>;
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => CircleROIAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: CircleROIAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: CircleROIAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: CircleROIAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragDrawCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragModifyCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragHandle: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats: (annotation: any, viewport: any, renderingEngine: any, enabledElement: any) => any;
    _isInsideVolume: (index1: any, index2: any, dimensions: any) => boolean;
}

export declare class CircleScissorsTool extends BaseTool {
    static toolName: any;
    editData: {
        annotation: any;
        segmentation: any;
        segmentIndex: number;
        segmentationId: string;
        segmentsLocked: number[];
        segmentColor: [number, number, number, number];
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
        centerCanvas?: Array<number>;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    preMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}

declare function clip(a: any, b: any, box: any, da?: any, db?: any): 0 | 1;

declare function clip_2(val: number, low: number, high: number): number;

declare interface CobbAngleAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats: {
            [targetId: string]: {
                angle: number;
                arc1Angle: number;
                arc2Angle: number;
                points: {
                    world: {
                        arc1Start: Types_2.Point3;
                        arc1End: Types_2.Point3;
                        arc2Start: Types_2.Point3;
                        arc2End: Types_2.Point3;
                        arc1Angle: number;
                        arc2Angle: number;
                    };
                    canvas: {
                        arc1Start: Types_2.Point2;
                        arc1End: Types_2.Point2;
                        arc2Start: Types_2.Point2;
                        arc2End: Types_2.Point2;
                        arc1Angle: number;
                        arc2Angle: number;
                    };
                };
            };
        };
    };
}

export declare class CobbAngleTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    angleStartedNotYetCompleted: boolean;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
        isNearFirstLine?: boolean;
        isNearSecondLine?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.MouseDownActivateEventType) => CobbAngleAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: CobbAngleAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.MouseDownEventType, annotation: CobbAngleAnnotation, interactionType: InteractionTypes, canvasCoords: Types_2.Point2, proximity?: number) => void;
    handleSelectedCallback(evt: EventTypes_2.MouseDownEventType, annotation: CobbAngleAnnotation, handle: ToolHandle, interactionType?: string): void;
    _mouseUpCallback: (evt: EventTypes_2.MouseUpEventType | EventTypes_2.MouseClickEventType) => void;
    _mouseDownCallback: (evt: EventTypes_2.MouseUpEventType | EventTypes_2.MouseClickEventType) => void;
    _mouseDragCallback: (evt: EventTypes_2.MouseDragEventType | EventTypes_2.MouseMoveEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: HTMLDivElement) => void;
    _deactivateModify: (element: HTMLDivElement) => void;
    _activateDraw: (element: HTMLDivElement) => void;
    _deactivateDraw: (element: HTMLDivElement) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats(annotation: any, renderingEngine: any, enabledElement: any): any;
    distanceToLines: ({ viewport, points, canvasCoords, proximity }: {
        viewport: any;
        points: any;
        canvasCoords: any;
        proximity: any;
    }) => {
        distanceToPoint: number;
        distanceToPoint2: number;
        isNearFirstLine: boolean;
        isNearSecondLine: boolean;
    };
    getArcsStartEndPoints: ({ firstLine, secondLine, mid1, mid2, }: {
        firstLine: any;
        secondLine: any;
        mid1: any;
        mid2: any;
    }) => {
        arc1Start: Types_2.Point2;
        arc1End: Types_2.Point2;
        arc2Start: Types_2.Point2;
        arc2End: Types_2.Point2;
        arc1Angle: number;
        arc2Angle: number;
    };
}

declare type Color = [number, number, number, number];

declare namespace color {
    export {
        getColorForSegmentIndex,
        addColorLUT_2 as addColorLUT,
        setColorLUT,
        setColorForSegmentIndex
    }
}

declare class Colorbar extends Widget {
    private _colormaps;
    private _activeColormapName;
    private _eventListenersManager;
    private _canvas;
    private _ticksBar;
    private _rangeTextPosition;
    private _isMouseOver;
    private _isInteracting;
    constructor(props: ColorbarProps);
    get activeColormapName(): string;
    set activeColormapName(colormapName: string);
    get imageRange(): ColorbarVOIRange;
    set imageRange(imageRange: ColorbarVOIRange);
    get voiRange(): ColorbarVOIRange;
    set voiRange(voiRange: ColorbarVOIRange);
    get showFullImageRange(): boolean;
    set showFullImageRange(value: boolean);
    destroy(): void;
    protected createRootElement(): HTMLElement;
    protected onContainerResize(): void;
    protected getVOIMultipliers(): [number, number];
    protected onVoiChange(voiRange: ColorbarVOIRange): void;
    protected showTicks(): void;
    protected hideTicks(): void;
    private static getColormapsMap;
    private static getInitialColormapName;
    private _createCanvas;
    _createTicksBar(props: ColorbarProps): ColorbarTicks;
    private _getPointsFromMouseEvent;
    private updateTicksBar;
    private _mouseOverCallback;
    private _mouseOutCallback;
    private _mouseDownCallback;
    private _mouseDragCallback;
    private _mouseUpCallback;
    private _addRootElementEventListeners;
    private _addVOIEventListeners;
    private _removeVOIEventListeners;
}

declare namespace colorbar {
    export {
        Types_3 as Types,
        Enums_2 as Enums,
        Colorbar,
        ViewportColorbar
    }
}

declare type ColorbarCommonProps = {
    imageRange?: ColorbarImageRange;
    voiRange?: ColorbarVOIRange;
    ticks?: {
        position?: ColorbarRangeTextPosition;
        style?: ColorbarTicksStyle;
    };
    showFullPixelValueRange?: boolean;
};

declare type ColorbarImageRange = {
    lower: number;
    upper: number;
};

declare type ColorbarProps = (WidgetProps & ColorbarCommonProps) & {
    colormaps: IColorMapPreset[];
    activeColormapName?: string;
};

declare enum ColorbarRangeTextPosition {
    Top = "top",
    Left = "left",
    Bottom = "bottom",
    Right = "right"
}

declare type ColorbarSize = {
    width: number;
    height: number;
};

declare class ColorbarTicks {
    private _canvas;
    private _imageRange;
    private _voiRange;
    private _color;
    private _tickSize;
    private _tickWidth;
    private _labelMargin;
    private _maxNumTicks;
    private _rangeTextPosition;
    private _showFullPixelValueRange;
    private _font;
    constructor(props: ColorbarTicksProps);
    get size(): ColorbarSize;
    set size(size: ColorbarSize);
    get top(): number;
    set top(top: number);
    get left(): number;
    set left(left: number);
    get imageRange(): ColorbarVOIRange;
    set imageRange(imageRange: ColorbarVOIRange);
    get voiRange(): ColorbarVOIRange;
    set voiRange(voiRange: ColorbarVOIRange);
    get tickSize(): number;
    set tickSize(tickSize: number);
    get tickWidth(): number;
    set tickWidth(tickWidth: number);
    get color(): string;
    set color(color: string);
    get showFullPixelValueRange(): boolean;
    set showFullPixelValueRange(showFullRange: boolean);
    get visible(): boolean;
    set visible(visible: boolean);
    appendTo(container: HTMLElement): void;
    private static validateProps;
    private _setCanvasSize;
    private _createCanvasElement;
    private _getTicks;
    private _getLeftTickInfo;
    private _getRightTickInfo;
    private _getTopTickInfo;
    private _getBottomTickInfo;
    private render;
}

declare type ColorbarTicksProps = ColorbarCommonProps & {
    top?: number;
    left?: number;
    size?: ColorbarSize;
    container?: HTMLElement;
};

declare type ColorbarTicksStyle = {
    font?: string;
    color?: string;
    tickSize?: number;
    tickWidth?: number;
    labelMargin?: number;
    maxNumTicks?: number;
};

declare type ColorbarVOIRange = ColorbarImageRange;

declare type ColorLUT = Array<Color>;

declare type ColormapPublic = {
    /** name of the colormap */
    name?: string;
    opacity?: OpacityMapping[] | number;
    /** midpoint mapping between values to opacity if the colormap
    * is getting used for fusion, this is an array of arrays which
    * each array containing 2 values, the first value is the value
    * to map to opacity and the second value is the opacity value.
    * By default, the minimum value is mapped to 0 opacity and the
    * maximum value is mapped to 1 opacity, but you can configure
    * the points in the middle to be mapped to different opacities
    * instead of a linear mapping from 0 to 1.
    */
};

declare type ColormapRegistration = {
    ColorSpace: string;
    Name: string;
    RGBPoints: RGB[];
};

declare namespace config {
    export {
        getState,
        getFont,
        toolStyle as style
    }
}

declare namespace config_2 {
    export {
        color,
        visibility_2 as visibility,
        getGlobalConfig_2 as getGlobalConfig,
        getGlobalRepresentationConfig,
        getToolGroupSpecificConfig_2 as getToolGroupSpecificConfig,
        setGlobalConfig_2 as setGlobalConfig,
        setGlobalRepresentationConfig,
        setToolGroupSpecificConfig_2 as setToolGroupSpecificConfig,
        setSegmentSpecificConfig,
        getSegmentSpecificConfig,
        setSegmentationRepresentationSpecificConfig_2 as setSegmentationRepresentationSpecificConfig,
        getSegmentationRepresentationSpecificConfig_2 as getSegmentationRepresentationSpecificConfig
    }
}

declare namespace CONSTANTS {
    export {
        CORNERSTONE_COLOR_LUT as COLOR_LUT
    }
}
export { CONSTANTS }

declare type ContourConfig = {
    outlineWidthActive?: number;
    outlineWidthInactive?: number;
    outlineOpacity?: number;
    outlineOpacityInactive?: number;
    renderOutline?: boolean;
    renderFill?: boolean;
    fillAlpha?: number;
    fillAlphaInactive?: number;
};

declare type ContourData = {
    points: Point3[];
    type: ContourType;
    color: Point3;
    segmentIndex: number;
};

declare type ContourRenderingConfig = {};

declare type ContourSegmentationData = {
    geometryIds: string[];
};

declare type ContourSetData = {
    id: string;
    data: ContourData[];
    frameOfReferenceUID: string;
    color?: Point3;
    segmentIndex?: number;
};

declare enum ContourType {
    CLOSED_PLANAR = 'CLOSED_PLANAR',
    OPEN_PLANAR = 'OPEN_PLANAR',
}

declare function copyPoints(points: ITouchPoints): ITouchPoints;

declare function copyPointsList(points: ITouchPoints[]): ITouchPoints[];

declare type Cornerstone3DConfig = {
    /**
     * It is used to store the device information,
     * we use it if provided if not a network call is performed.
     * Its type is the `TierResult` in the `detect-gpu` library.
     * https://github.com/pmndrs/detect-gpu/blob/master/src/index.ts#L82
     */
    gpuTier?: TierResult;
    /**
     * When the `gpuTier` is not provided, the `detectGPUConfig` is passed as
     * an argument to the `getGPUTier` method.
     * Its type is the `GetGPUTier` in the `detect-gpu` library.
     * https://github.com/pmndrs/detect-gpu/blob/master/src/index.ts#L20
     */
    detectGPUConfig: GetGPUTier;
    rendering: {
        // vtk.js supports 8bit integer textures and 32bit float textures.
        // However, if the client has norm16 textures (it can be seen by visiting
        // the webGl report at https://webglreport.com/?v=2), vtk will be default
        // to use it to improve memory usage. However, if the client don't have
        // it still another level of optimization can happen by setting the
        // preferSizeOverAccuracy since it will reduce the size of the texture to half
        // float at the cost of accuracy in rendering. This is a tradeoff that the
        // client can decide.
        //
        // Read more in the following Pull Request:
        // 1. HalfFloat: https://github.com/Kitware/vtk-js/pull/2046
        // 2. Norm16: https://github.com/Kitware/vtk-js/pull/2058
        preferSizeOverAccuracy: boolean;
        // Whether the EXT_texture_norm16 extension is supported by the browser.
        // WebGL 2 report (link: https://webglreport.com/?v=2) can be used to check
        // if the browser supports this extension.
        // In case the browser supports this extension, instead of using 32bit float
        // textures, 16bit float textures will be used to reduce the memory usage where
        // possible.
        // Norm16 may not work currently due to the two active bugs in chrome + safari
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1408247
        // https://bugs.webkit.org/show_bug.cgi?id=252039
        useNorm16Texture: boolean;
        useCPURendering: boolean;
        /**
         * flag to control whether to use fallback behavior for z-spacing calculation in
         * volume viewports when the necessary metadata is missing. If enabled,
         * we will fall back to using slice thickness or a default value of 1 to render
         * the volume viewport when z-spacing cannot be calculated from images
         * This can help improve the usability and robustness of the visualization
         * in scenarios where the metadata is incomplete or missing, but
         * it might be wrong assumption in certain scenarios.
         */
        strictZSpacingForVolumeViewport: boolean;
    };
};

declare const CORNERSTONE_COLOR_LUT: number[][];

declare interface CPUFallbackColormap {
    /** Get id of colormap */
    getId: () => string;
    getColorSchemeName: () => string;
    setColorSchemeName: (name: string) => void;
    getNumberOfColors: () => number;
    setNumberOfColors: (numColors: number) => void;
    getColor: (index: number) => Point4;
    getColorRepeating: (index: number) => Point4;
    setColor: (index: number, rgba: Point4) => void;
    addColor: (rgba: Point4) => void;
    insertColor: (index: number, rgba: Point4) => void;
    removeColor: (index: number) => void;
    clearColors: () => void;
    buildLookupTable: (lut: CPUFallbackLookupTable) => void;
    createLookupTable: () => CPUFallbackLookupTable;
    isValidIndex: (index: number) => boolean;
}

declare type CPUFallbackColormapData = {
    name: string;
    numOfColors?: number;
    colors?: Point4[];
    segmentedData?: unknown;
    numColors?: number;
    gamma?: number;
};

declare type CPUFallbackColormapsData = {
    [key: string]: CPUFallbackColormapData;
};

declare interface CPUFallbackEnabledElement {
    scale?: number;
    pan?: Point2;
    zoom?: number;
    rotation?: number;
    image?: IImage;
    canvas?: HTMLCanvasElement;
    viewport?: CPUFallbackViewport;
    colormap?: CPUFallbackColormap;
    options?: {
        [key: string]: unknown;
        colormap?: CPUFallbackColormap;
    };
    renderingTools?: CPUFallbackRenderingTools;
    transform?: CPUFallbackTransform;
    invalid?: boolean;
    needsRedraw?: boolean;
    metadata?: {
        direction?: Mat3;
        /** Last index is always 1 for CPU */
        dimensions?: Point3;
        /** Last spacing is always EPSILON for CPU */
        spacing?: Point3;
        origin?: Point3;
        imagePlaneModule?: ImagePlaneModule;
        imagePixelModule?: ImagePixelModule;
    };
}

declare interface CPUFallbackLookupTable {
    setNumberOfTableValues: (number: number) => void;
    setRamp: (ramp: string) => void;
    setTableRange: (start: number, end: number) => void;
    setHueRange: (start: number, end: number) => void;
    setSaturationRange: (start: number, end: number) => void;
    setValueRange: (start: number, end: number) => void;
    setRange: (start: number, end: number) => void;
    setAlphaRange: (start: number, end: number) => void;
    getColor: (scalar: number) => Point4;
    build: (force: boolean) => void;
    setTableValue(index: number, rgba: Point4);
}

declare type CPUFallbackLUT = {
    lut: number[];
};

declare type CPUFallbackRenderingTools = {
    renderCanvas?: HTMLCanvasElement;
    lastRenderedIsColor?: boolean;
    lastRenderedImageId?: string;
    lastRenderedViewport?: {
        windowWidth: number | number[];
        windowCenter: number | number[];
        invert: boolean;
        rotation: number;
        hflip: boolean;
        vflip: boolean;
        modalityLUT: CPUFallbackLUT;
        voiLUT: CPUFallbackLUT;
        colormap: unknown;
    };
    renderCanvasContext?: CanvasRenderingContext2D;
    colormapId?: string;
    colorLUT?: CPUFallbackLookupTable;
    renderCanvasData?: ImageData;
};

declare interface CPUFallbackTransform {
    reset: () => void;
    clone: () => CPUFallbackTransform;
    multiply: (matrix: TransformMatrix2D) => void;
    getMatrix: () => TransformMatrix2D;
    invert: () => void;
    rotate: (rad: number) => void;
    translate: (x: number, y: number) => void;
    scale: (sx: number, sy: number) => void;
    transformPoint: (point: Point2) => Point2;
}

declare type CPUFallbackViewport = {
    scale?: number;
    parallelScale?: number;
    focalPoint?: number[];
    translation?: {
        x: number;
        y: number;
    };
    voi?: {
        windowWidth: number;
        windowCenter: number;
    };
    invert?: boolean;
    pixelReplication?: boolean;
    rotation?: number;
    hflip?: boolean;
    vflip?: boolean;
    modalityLUT?: CPUFallbackLUT;
    voiLUT?: CPUFallbackLUT;
    colormap?: CPUFallbackColormap;
    displayedArea?: CPUFallbackViewportDisplayedArea;
    modality?: string;
};

declare type CPUFallbackViewportDisplayedArea = {
    tlhc: {
        x: number;
        y: number;
    };
    brhc: {
        x: number;
        y: number;
    };
    rowPixelSpacing: number;
    columnPixelSpacing: number;
    presentationSizeMode: string;
};

declare type CPUIImageData = {
    dimensions: Point3;
    direction: Mat3;
    spacing: Point3;
    origin: Point3;
    imageData: CPUImageData;
    metadata: { Modality: string };
    scalarData: PixelDataTypedArray;
    scaling: Scaling;
    /** whether the image has pixel spacing and it is not undefined */
    hasPixelSpacing?: boolean;
    calibration?: IImageCalibration;

    /** preScale object */
    preScale?: {
        /** boolean flag to indicate whether the image has been scaled */
        scaled?: boolean;
        /** scaling parameters */
        scalingParameters?: {
            /** modality of the image */
            modality?: string;
            /** rescale slop */
            rescaleSlope?: number;
            /** rescale intercept */
            rescaleIntercept?: number;
            /** PT suvbw */
            suvbw?: number;
        };
    };
};

declare type CPUImageData = {
    worldToIndex?: (point: Point3) => Point3;
    indexToWorld?: (point: Point3) => Point3;
    getWorldToIndex?: () => Point3;
    getIndexToWorld?: () => Point3;
    /** Last spacing is always EPSILON */
    getSpacing?: () => Point3;
    getDirection?: () => Mat3;
    getScalarData?: () => PixelDataTypedArray;
    /** Last index is always 1 */
    getDimensions?: () => Point3;
};

declare function createCameraPositionSynchronizer(synchronizerName: string): Synchronizer;

declare function createLabelmapVolumeForViewport(input: {
    viewportId: string;
    renderingEngineId: string;
    segmentationId?: string;
    options?: {
        volumeId?: string;
        scalarData?: Float32Array | Uint8Array | Uint16Array | Int16Array;
        targetBuffer?: {
            type: 'Float32Array' | 'Uint8Array' | 'Uint16Array' | 'Int8Array';
        };
        metadata?: any;
        dimensions?: Types_2.Point3;
        spacing?: Types_2.Point3;
        origin?: Types_2.Point3;
        direction?: Float32Array;
    };
}): Promise<string>;

declare function createMergedLabelmapForIndex(labelmaps: Array<Types_2.IImageVolume>, segmentIndex?: number, volumeId?: string): Types_2.IImageVolume;

declare function createStackImageSynchronizer(synchronizerName: string): Synchronizer;

declare function createSynchronizer(synchronizerId: string, eventName: string, eventHandler: ISynchronizerEventHandler, options?: any): Synchronizer;

declare function createToolGroup(toolGroupId: string): IToolGroup | undefined;

declare function createVOISynchronizer(synchronizerName: string, options?: VOISynchronizerOptions): Synchronizer;

declare function createZoomPanSynchronizer(synchronizerName: string): Synchronizer;

declare interface CrosshairsAnnotation extends Annotation {
    data: {
        handles: {
            rotationPoints: any[];
            slabThicknessPoints: any[];
            activeOperation: number | null;
            toolCenter: Types_2.Point3;
        };
        activeViewportIds: string[];
        viewportId: string;
    };
}

export declare class CrosshairsTool extends AnnotationTool {
    static toolName: any;
    toolCenter: Types_2.Point3;
    _getReferenceLineColor?: (viewportId: string) => string;
    _getReferenceLineControllable?: (viewportId: string) => boolean;
    _getReferenceLineDraggableRotatable?: (viewportId: string) => boolean;
    _getReferenceLineSlabThicknessControlsOn?: (viewportId: string) => boolean;
    editData: {
        annotation: any;
    } | null;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    initializeViewport: ({ renderingEngineId, viewportId, }: Types_2.IViewportId) => {
        normal: Types_2.Point3;
        point: Types_2.Point3;
    };
    _getViewportsInfo: () => Types_2.IViewportId[];
    onSetToolActive(): void;
    onSetToolPassive(): void;
    onSetToolEnabled(): void;
    onSetToolDisabled(): void;
    computeToolCenter: (viewportsInfo: any) => void;
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => CrosshairsAnnotation;
    cancel: () => void;
    getHandleNearImagePoint(element: HTMLDivElement, annotation: Annotation, canvasCoords: Types_2.Point2, proximity: number): ToolHandle | undefined;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: Annotation) => void;
    isPointNearTool: (element: HTMLDivElement, annotation: CrosshairsAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: Annotation, interactionType: InteractionTypes) => void;
    onCameraModified: (evt: any) => void;
    mouseMoveCallback: (evt: EventTypes_2.MouseMoveEventType, filteredToolAnnotations: Annotations) => boolean;
    filterInteractableAnnotationsForElement: (element: any, annotations: any) => any;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _getAnnotations: (enabledElement: Types_2.IEnabledElement) => Annotations;
    _onNewVolume: (e: any) => void;
    _unsubscribeToViewportNewVolumeSet(viewportsInfo: any): void;
    _subscribeToViewportNewVolumeSet(viewports: any): void;
    _autoPanViewportIfNecessary(viewportId: string, renderingEngine: Types_2.IRenderingEngine): void;
    _areViewportIdArraysEqual: (viewportIdArrayOne: any, viewportIdArrayTwo: any) => boolean;
    _getAnnotationsForViewportsWithDifferentCameras: (enabledElement: any, annotations: any) => any;
    _filterViewportWithSameOrientation: (enabledElement: any, referenceAnnotation: any, annotations: any) => any;
    _filterAnnotationsByUniqueViewportOrientations: (enabledElement: any, annotations: any) => any[];
    _checkIfViewportsRenderingSameScene: (viewport: any, otherViewport: any) => boolean;
    _jump: (enabledElement: any, jumpWorld: any) => boolean;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    setSlabThickness(viewport: any, slabThickness: any): void;
    _isClockWise(a: any, b: any, c: any): boolean;
    _applyDeltaShiftToSelectedViewportCameras(renderingEngine: any, viewportsAnnotationsToUpdate: any, delta: any): void;
    _applyDeltaShiftToViewportCamera(renderingEngine: Types_2.IRenderingEngine, annotation: any, delta: any): void;
    _pointNearReferenceLine: (annotation: any, canvasCoords: any, proximity: any, lineViewport: any) => boolean;
    _getRotationHandleNearImagePoint(viewport: any, annotation: any, canvasCoords: any, proximity: any): any;
    _getSlabThicknessHandleNearImagePoint(viewport: any, annotation: any, canvasCoords: any, proximity: any): any;
    _pointNearTool(element: any, annotation: any, canvasCoords: any, proximity: any): boolean;
}

declare const CursorNames: string[];

declare namespace cursors {
    export {
        MouseCursor,
        ImageMouseCursor,
        SVGMouseCursor,
        elementCursor,
        registerCursor,
        CursorNames,
        CursorSVG,
        setCursorForElement
    }
}
export { cursors }

declare const CursorSVG: Record<string, SVGCursorDescriptor>;

declare interface CustomEvent_2<T = any> extends Event {
    /**
     * Returns any custom data event was created with. Typically used for synthetic events.
     */
    readonly detail: T;
    initCustomEvent(
    typeArg: string,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    detailArg: T
    ): void;
}

declare function debounce(func: Function, wait?: number, options?: {
    leading?: boolean;
    maxWait?: number;
    trailing?: boolean;
}): Function;

declare const _default: {
    filterAnnotationsWithinSlice: typeof filterAnnotationsWithinSlice;
    getWorldWidthAndHeightFromCorners: typeof getWorldWidthAndHeightFromCorners;
    filterAnnotationsForDisplay: typeof filterAnnotationsForDisplay;
    getPointInLineOfSightWithCriteria: typeof getPointInLineOfSightWithCriteria;
};

declare const _default_2: {
    interpolateAnnotation: typeof interpolateAnnotation;
};

declare function deselectAnnotation(annotationUID?: string): void;

export declare function destroy(): void;

declare function destroy_2(): void;

declare function destroy_3(): void;

declare function destroySynchronizer(synchronizerId: string): void;

declare function destroyToolGroup(toolGroupId: string): void;

declare function disable(element: any): void;

declare function disable_2(element: any): void;

declare type DisplayArea = {
    imageArea: [number, number]; // areaX, areaY
    imageCanvasPoint: {
        imagePoint: [number, number]; // imageX, imageY
        canvasPoint: [number, number]; // canvasX, canvasY
    };
    storeAsInitialCamera: boolean;
};

/**
 * DISPLAY_AREA_MODIFIED Event type
 */
declare type DisplayAreaModifiedEvent = CustomEvent_2<DisplayAreaModifiedEventDetail>;

/**
 * DISPLAY_AREA_MODIFIED Event's data
 */
declare type DisplayAreaModifiedEventDetail = {
    /** Viewport Unique ID in the renderingEngine */
    viewportId: string;
    /** new display area */
    displayArea: DisplayArea;
    /** Unique ID for the volume in the cache */
    volumeId?: string;
    /** Whether displayArea was stored as initial view */
    storeAsInitialCamera?: boolean;
};

declare function distanceToPoint(lineStart: Types_2.Point2, lineEnd: Types_2.Point2, point: Types_2.Point2): number;

declare function distanceToPoint_2(rect: number[], point: Types_2.Point2): number;

declare function distanceToPoint_3(p1: Point, p2: Point): number;

declare function distanceToPointSquared(lineStart: Types_2.Point2, lineEnd: Types_2.Point2, point: Types_2.Point2): number;

export declare class DragProbeTool extends ProbeTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        newAnnotation?: boolean;
    } | null;
    eventDispatchDetail: {
        viewportId: string;
        renderingEngineId: string;
    };
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    postMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => ProbeAnnotation;
    postTouchStartCallback: (evt: EventTypes_2.InteractionEventType) => ProbeAnnotation;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}

declare function draw(element: HTMLDivElement, fn: (svgDrawingElement: any) => any): void;

declare function drawArrow(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, arrowUID: string, start: Types_2.Point2, end: Types_2.Point2, options?: {}): void;

declare function drawCircle(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, circleUID: string, center: Types_2.Point2, radius: number, options?: {}, dataId?: string): void;

declare function drawEllipse(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, ellipseUID: string, corner1: Types_2.Point2, corner2: Types_2.Point2, options?: {}, dataId?: string): void;

declare function drawHandles(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, handleGroupUID: string, handlePoints: Array<Types_2.Point2>, options?: {}): void;

declare namespace drawing {
    export {
        draw,
        drawCircle,
        drawEllipse,
        drawHandles,
        drawLine,
        drawPolyline,
        drawLinkedTextBox,
        drawRect,
        drawTextBox,
        drawArrow,
        drawRedactionRect,
        setAttributesIfNecessary,
        setNewAttributesIfValid
    }
}
export { drawing }

declare namespace drawing_2 {
    export {
        getTextBoxCoordsCanvas
    }
}

declare function drawLine(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, lineUID: string, start: Types_2.Point2, end: Types_2.Point2, options?: {}, dataId?: string): void;

declare function drawLinkedTextBox(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, textBoxUID: string, textLines: Array<string>, textBoxPosition: Types_2.Point2, annotationAnchorPoints: Array<Types_2.Point2>, textBox: unknown, options?: {}): SVGRect;

declare function drawPolyline(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, polylineUID: string, points: Types_2.Point2[], options: {
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
    width?: number;
    lineWidth?: number;
    lineDash?: string;
    connectLastToFirst?: boolean;
}): void;

declare function drawRect(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, rectangleUID: string, start: Types_2.Point2, end: Types_2.Point2, options?: {}, dataId?: string): void;

declare function drawRedactionRect(svgDrawingHelper: any, annotationUID: string, rectangleUID: string, start: any, end: any, options?: {}): void;

declare function drawTextBox(svgDrawingHelper: SVGDrawingHelper, annotationUID: string, textUID: string, textLines: Array<string>, position: Types_2.Point2, options?: {}): SVGRect;

declare namespace dynamicVolume {
    export {
        getDataInTime,
        generateImageFromTimeData
    }
}

declare namespace elementCursor {
    export {
        initElementCursor,
        resetElementCursor,
        hideElementCursor,
        _setElementCursor as setElementCursor
    }
}

/**
 * ELEMENT_DISABLED Event type
 */
declare type ElementDisabledEvent = CustomEvent_2<ElementDisabledEventDetail>;

/**
 * ELEMENT_DISABLED Event's data
 */
declare type ElementDisabledEventDetail = {
    /** Viewport HTML element in the DOM */
    element: HTMLDivElement;
    /** Viewport Unique ID in the renderingEngine */
    viewportId: string;
    /** Unique ID for the renderingEngine */
    renderingEngineId: string;
};

/**
 * ELEMENT_ENABLED Event type
 */
declare type ElementEnabledEvent = CustomEvent_2<ElementEnabledEventDetail>;

/**
 * ELEMENT_Enabled Event's data
 */
declare type ElementEnabledEventDetail = {
    /** Viewport HTML element in the DOM */
    element: HTMLDivElement;
    /** Viewport Unique ID in the renderingEngine */
    viewportId: string;
    /** Unique ID for the renderingEngine */
    renderingEngineId: string;
};

declare type Ellipse = {
    center: Types_2.Point3;
    xRadius: number;
    yRadius: number;
    zRadius: number;
};

declare namespace ellipse {
    export {
        pointInEllipse,
        getCanvasEllipseCorners
    }
}

declare interface EllipticalROIAnnotation extends Annotation {
    data: {
        handles: {
            points: [Types_2.Point3, Types_2.Point3, Types_2.Point3, Types_2.Point3];
            activeHandleIndex: number | null;
            textBox?: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats?: ROICachedStats;
        initialRotation: number;
    };
}

export declare class EllipticalROITool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: Array<string>;
        handleIndex?: number;
        movingTextBox?: boolean;
        centerWorld?: Array<number>;
        canvasWidth?: number;
        canvasHeight?: number;
        originalHandleCanvas?: Array<number>;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => EllipticalROIAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: EllipticalROIAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: EllipticalROIAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: EllipticalROIAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragDrawCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragModifyCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragHandle: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats: (annotation: any, viewport: any, renderingEngine: any, enabledElement: any) => any;
    _isInsideVolume: (index1: any, index2: any, dimensions: any) => boolean;
    _pointInEllipseCanvas(ellipse: any, location: Types_2.Point2): boolean;
    _getCanvasEllipseCenter(ellipseCanvasPoints: Types_2.Point2[]): Types_2.Point2;
}

declare function enable(element: any): void;

declare namespace Enums {
    export {
        MouseBindings,
        KeyboardBindings,
        ToolModes,
        AnnotationStyleStates,
        Events,
        SegmentationRepresentations,
        Swipe
    }
}
export { Enums }

declare namespace Enums_2 {
    export {
        ColorbarRangeTextPosition
    }
}

declare enum Events {
    TOOL_ACTIVATED = "CORNERSTONE_TOOLS_TOOL_ACTIVATED",
    TOOL_MODE_CHANGED = "CORNERSTONE_TOOLS_TOOL_MODE_CHANGED",
    ANNOTATION_ADDED = "CORNERSTONE_TOOLS_ANNOTATION_ADDED",
    ANNOTATION_COMPLETED = "CORNERSTONE_TOOLS_ANNOTATION_COMPLETED",
    ANNOTATION_MODIFIED = "CORNERSTONE_TOOLS_ANNOTATION_MODIFIED",
    ANNOTATION_REMOVED = "CORNERSTONE_TOOLS_ANNOTATION_REMOVED",
    ANNOTATION_SELECTION_CHANGE = "CORNERSTONE_TOOLS_ANNOTATION_SELECTION_CHANGE",
    ANNOTATION_LOCK_CHANGE = "CORNERSTONE_TOOLS_ANNOTATION_LOCK_CHANGE",
    ANNOTATION_VISIBILITY_CHANGE = "CORNERSTONE_TOOLS_ANNOTATION_VISIBILITY_CHANGE",
    ANNOTATION_RENDERED = "CORNERSTONE_TOOLS_ANNOTATION_RENDERED",
    SEGMENTATION_MODIFIED = "CORNERSTONE_TOOLS_SEGMENTATION_MODIFIED",
    SEGMENTATION_RENDERED = "CORNERSTONE_TOOLS_SEGMENTATION_RENDERED",
    SEGMENTATION_REPRESENTATION_MODIFIED = "CORNERSTONE_TOOLS_SEGMENTATION_REPRESENTATION_MODIFIED",
    SEGMENTATION_REMOVED = "CORNERSTONE_TOOLS_SEGMENTATION_REMOVED",
    SEGMENTATION_REPRESENTATION_REMOVED = "CORNERSTONE_TOOLS_SEGMENTATION_REPRESENTATION_REMOVED",
    SEGMENTATION_DATA_MODIFIED = "CORNERSTONE_TOOLS_SEGMENTATION_DATA_MODIFIED",
    KEY_DOWN = "CORNERSTONE_TOOLS_KEY_DOWN",
    KEY_UP = "CORNERSTONE_TOOLS_KEY_UP",
    MOUSE_DOWN = "CORNERSTONE_TOOLS_MOUSE_DOWN",
    MOUSE_UP = "CORNERSTONE_TOOLS_MOUSE_UP",
    MOUSE_DOWN_ACTIVATE = "CORNERSTONE_TOOLS_MOUSE_DOWN_ACTIVATE",
    MOUSE_DRAG = "CORNERSTONE_TOOLS_MOUSE_DRAG",
    MOUSE_MOVE = "CORNERSTONE_TOOLS_MOUSE_MOVE",
    MOUSE_CLICK = "CORNERSTONE_TOOLS_MOUSE_CLICK",
    MOUSE_DOUBLE_CLICK = "CORNERSTONE_TOOLS_MOUSE_DOUBLE_CLICK",
    MOUSE_WHEEL = "CORNERSTONE_TOOLS_MOUSE_WHEEL",
    TOUCH_START = "CORNERSTONE_TOOLS_TOUCH_START",
    TOUCH_START_ACTIVATE = "CORNERSTONE_TOOLS_TOUCH_START_ACTIVATE",
    TOUCH_PRESS = "CORNERSTONE_TOOLS_TOUCH_PRESS",
    TOUCH_DRAG = "CORNERSTONE_TOOLS_TOUCH_DRAG",
    TOUCH_END = "CORNERSTONE_TOOLS_TOUCH_END",
    TOUCH_TAP = "CORNERSTONE_TOOLS_TAP",
    TOUCH_SWIPE = "CORNERSTONE_TOOLS_SWIPE"
}

declare enum Events_2 {
    CLIP_STOPPED = "CORNERSTONE_CINE_TOOL_STOPPED",
    CLIP_STARTED = "CORNERSTONE_CINE_TOOL_STARTED"
}

declare namespace EventTypes {
    export {
        CameraModifiedEventDetail,
        CameraModifiedEvent,
        VoiModifiedEvent,
        VoiModifiedEventDetail,
        DisplayAreaModifiedEvent,
        DisplayAreaModifiedEventDetail,
        ElementDisabledEvent,
        ElementDisabledEventDetail,
        ElementEnabledEvent,
        ElementEnabledEventDetail,
        ImageRenderedEventDetail,
        ImageRenderedEvent,
        ImageVolumeModifiedEvent,
        ImageVolumeModifiedEventDetail,
        ImageVolumeLoadingCompletedEvent,
        ImageVolumeLoadingCompletedEventDetail,
        ImageLoadedEvent,
        ImageLoadedEventDetail,
        ImageLoadedFailedEventDetail,
        ImageLoadedFailedEvent,
        VolumeLoadedEvent,
        VolumeLoadedEventDetail,
        VolumeLoadedFailedEvent,
        VolumeLoadedFailedEventDetail,
        ImageCacheImageAddedEvent,
        ImageCacheImageAddedEventDetail,
        ImageCacheImageRemovedEvent,
        ImageCacheImageRemovedEventDetail,
        VolumeCacheVolumeAddedEvent,
        VolumeCacheVolumeAddedEventDetail,
        VolumeCacheVolumeRemovedEvent,
        VolumeCacheVolumeRemovedEventDetail,
        StackNewImageEvent,
        StackNewImageEventDetail,
        PreStackNewImageEvent,
        PreStackNewImageEventDetail,
        ImageSpacingCalibratedEvent,
        ImageSpacingCalibratedEventDetail,
        ImageLoadProgressEvent,
        ImageLoadProgressEventDetail,
        VolumeNewImageEvent,
        VolumeNewImageEventDetail,
        StackViewportNewStackEvent,
        StackViewportNewStackEventDetail,
        StackViewportScrollEvent,
        StackViewportScrollEventDetail
    }
}

declare namespace EventTypes_2 {
    export {
        InteractionStartType,
        InteractionEndType,
        InteractionEventType,
        NormalizedInteractionEventDetail,
        NormalizedMouseEventType,
        NormalizedTouchEventType,
        ToolModeChangedEventDetail,
        ToolModeChangedEventType,
        ToolActivatedEventDetail,
        ToolActivatedEventType,
        AnnotationAddedEventDetail,
        AnnotationAddedEventType,
        AnnotationCompletedEventDetail,
        AnnotationCompletedEventType,
        AnnotationModifiedEventDetail,
        AnnotationModifiedEventType,
        AnnotationRemovedEventDetail,
        AnnotationRemovedEventType,
        AnnotationSelectionChangeEventDetail,
        AnnotationSelectionChangeEventType,
        AnnotationRenderedEventDetail,
        AnnotationRenderedEventType,
        AnnotationLockChangeEventDetail,
        AnnotationVisibilityChangeEventDetail,
        AnnotationLockChangeEventType,
        AnnotationVisibilityChangeEventType,
        SegmentationDataModifiedEventType,
        SegmentationRepresentationModifiedEventDetail,
        SegmentationRepresentationModifiedEventType,
        SegmentationRepresentationRemovedEventDetail,
        SegmentationRepresentationRemovedEventType,
        SegmentationRemovedEventType,
        SegmentationRemovedEventDetail,
        SegmentationDataModifiedEventDetail,
        SegmentationRenderedEventType,
        SegmentationRenderedEventDetail,
        SegmentationModifiedEventType,
        SegmentationModifiedEventDetail,
        KeyDownEventDetail,
        KeyDownEventType,
        KeyUpEventDetail,
        KeyUpEventType,
        MouseDownEventDetail,
        TouchStartEventDetail,
        MouseDownEventType,
        TouchStartEventType,
        MouseDownActivateEventDetail,
        TouchStartActivateEventDetail,
        MouseDownActivateEventType,
        TouchStartActivateEventType,
        MouseDragEventDetail,
        TouchDragEventDetail,
        MouseDragEventType,
        TouchDragEventType,
        MouseUpEventDetail,
        TouchEndEventDetail,
        MouseUpEventType,
        TouchEndEventType,
        MouseClickEventDetail,
        MouseClickEventType,
        TouchTapEventDetail,
        TouchTapEventType,
        TouchSwipeEventDetail,
        TouchSwipeEventType,
        TouchPressEventDetail,
        TouchPressEventType,
        MouseMoveEventDetail,
        MouseMoveEventType,
        MouseDoubleClickEventDetail,
        MouseDoubleClickEventType,
        MouseWheelEventDetail,
        MouseWheelEventType,
        VolumeScrollOutOfBoundsEventDetail,
        VolumeScrollOutOfBoundsEventType
    }
}

declare function extend2DBoundingBoxInViewAxis(boundsIJK: [Types_2.Point2, Types_2.Point2, Types_2.Point2], numSlicesToProject: number): [Types_2.Point2, Types_2.Point2, Types_2.Point2];

declare function filterAnnotationsForDisplay(viewport: Types_2.IViewport, annotations: Annotations): Annotations;

declare function filterAnnotationsWithinSlice(annotations: Annotations, camera: Types_2.ICamera, spacingInNormalDirection: number): Annotations;

declare function filterViewportsWithFrameOfReferenceUID(viewports: Array<Types_2.IViewport>, FrameOfReferenceUID: string): Array<Types_2.IStackViewport | Types_2.IVolumeViewport>;

declare function filterViewportsWithParallelNormals(viewports: any, camera: any, EPS?: number): any;

declare function filterViewportsWithToolEnabled(viewports: Array<Types_2.IViewport>, toolName: string): Array<Types_2.IStackViewport | Types_2.IVolumeViewport>;

declare function findClosestPoint(sourcePoints: Array<Types_2.Point2>, targetPoint: Types_2.Point2): Types_2.Point2;

/**
 * Flip direction which can be horizontal or vertical.
 */
declare type FlipDirection = {
    flipHorizontal?: boolean;
    flipVertical?: boolean;
};

declare function floodFill(getter: FloodFillGetter, seed: Types_2.Point2 | Types_2.Point3, options?: FloodFillOptions): FloodFillResult;

declare type FloodFillGetter = FloodFillGetter2D | FloodFillGetter3D;

declare type FloodFillGetter2D = (x: number, y: number) => number;

declare type FloodFillGetter3D = (x: number, y: number, z: number) => number;

declare type FloodFillOptions = {
    onFlood?: (x: any, y: any) => void;
    onBoundary?: (x: any, y: any) => void;
    equals?: (a: any, b: any) => boolean;
    diagonals?: boolean;
};

declare type FloodFillResult = {
    flooded: Types_2.Point2[] | Types_2.Point3[];
    boundaries: Types_2.Point2[] | Types_2.Point3[];
};

declare class FrameOfReferenceSpecificAnnotationManager implements IAnnotationManager {
    private annotations;
    readonly uid: string;
    constructor(uid?: string);
    getGroupKey: (annotationGroupSelector: AnnotationGroupSelector) => string;
    _imageVolumeModifiedHandler: (evt: Types_2.EventTypes.ImageVolumeModifiedEvent) => void;
    getFramesOfReference: () => Array<string>;
    getAnnotations: (groupKey: string, toolName?: string) => GroupSpecificAnnotations | Annotations;
    getAnnotation: (annotationUID: string) => Annotation | undefined;
    getNumberOfAnnotations: (groupKey: string, toolName?: string) => number;
    addAnnotation: (annotation: Annotation, groupKey?: string) => void;
    removeAnnotation: (annotationUID: string) => void;
    removeAnnotations: (groupKey: string, toolName?: string) => void;
    saveAnnotations: (groupKey?: string, toolName?: string) => AnnotationState | GroupSpecificAnnotations | Annotations;
    restoreAnnotations: (state: AnnotationState | GroupSpecificAnnotations | Annotations, groupKey?: string, toolName?: string) => void;
    getNumberOfAllAnnotations: () => number;
    removeAllAnnotations: () => void;
}

declare function generateImageFromTimeData(dynamicVolume: Types_2.IDynamicImageVolume, operation: string, frameNumbers?: number[]): Float32Array;

declare enum GeometryType {
    CONTOUR = 'contour',
    SURFACE = 'Surface',
}

declare function getActiveSegmentationRepresentation(toolGroupId: string): ToolGroupSpecificRepresentation;

declare function getActiveSegmentIndex(segmentationId: string): number | undefined;

declare function getAllSegmentationRepresentations(): Record<string, ToolGroupSpecificRepresentation[]>;

declare function getAllSynchronizers(): Array<Synchronizer>;

declare function getAllToolGroups(): Array<IToolGroup>;

declare function getAnnotation(annotationUID: string): Annotation;

declare function getAnnotationManager(): FrameOfReferenceSpecificAnnotationManager;

declare function getAnnotationNearPoint(element: HTMLDivElement, canvasPoint: Types_2.Point2, proximity?: number): Annotation | null;

declare function getAnnotationNearPointOnEnabledElement(enabledElement: Types_2.IEnabledElement, point: Types_2.Point2, proximity: number): Annotation | null;

declare function getAnnotations(toolName: string, annotationGroupSelector: AnnotationGroupSelector): Annotations;

declare function getAnnotationsLocked(): Array<Annotation>;

declare function getAnnotationsLockedCount(): number;

declare function getAnnotationsSelected(): Array<string>;

declare function getAnnotationsSelectedByToolName(toolName: string): Array<string>;

declare function getAnnotationsSelectedCount(): number;

declare function getBoundingBoxAroundShape(points: Types_2.Point3[], dimensions?: Types_2.Point3): [Types_2.Point2, Types_2.Point2, Types_2.Point2];

declare function getBoundsIJKFromRectangleAnnotations(annotations: any, referenceVolume: any, options?: Options): any;

declare function getBrushSizeForToolGroup(toolGroupId: string, toolName?: string): void;

declare function getBrushThresholdForToolGroup(toolGroupId: string): any;

declare function getCanvasEllipseCorners(ellipseCanvasPoints: canvasCoordinates): Array<Types_2.Point2>;

declare function getClosestIntersectionWithPolyline(points: Types_2.Point2[], p1: Types_2.Point2, q1: Types_2.Point2, closed?: boolean): {
    segment: Types_2.Point2;
    distance: number;
} | undefined;

declare function getColorForSegmentIndex(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number): Color;

declare function getColorLUT(index: number): ColorLUT | undefined;

declare function getConfiguration(): {
    maxImagesToPrefetch: number;
    preserveExistingPool: boolean;
};

declare function getConfiguration_2(): {
    maxImagesToPrefetch: number;
    minBefore: number;
    maxAfter: number;
    directionExtraImages: number;
    preserveExistingPool: boolean;
};

declare function getDataInTime(dynamicVolume: Types_2.IDynamicImageVolume, options: {
    frameNumbers?: any;
    maskVolumeId?: any;
    imageCoordinate?: any;
}): number[] | number[][];

declare function getDefaultRepresentationConfig(segmentation: Segmentation): LabelmapConfig;

declare function getDefaultSegmentationStateManager(): SegmentationStateManager;

declare function getDeltaDistance(currentPoints: IPoints[], lastPoints: IPoints[]): IDistance;

declare function getDeltaDistanceBetweenIPoints(currentPoints: IPoints[], lastPoints: IPoints[]): IDistance;

declare function getDeltaPoints(currentPoints: IPoints[], lastPoints: IPoints[]): IPoints;

declare function getDeltaRotation(currentPoints: ITouchPoints[], lastPoints: ITouchPoints[]): void;

declare function getFirstIntersectionWithPolyline(points: Types_2.Point2[], p1: Types_2.Point2, q1: Types_2.Point2, closed?: boolean): Types_2.Point2 | undefined;

declare function getFont(styleSpecifier: StyleSpecifier, state?: AnnotationStyleStates, mode?: ToolModes): string;

declare function getGlobalConfig(): SegmentationRepresentationConfig;

declare function getGlobalConfig_2(): SegmentationRepresentationConfig;

declare function getGlobalRepresentationConfig(representationType: SegmentationRepresentations): RepresentationConfig['LABELMAP'];

declare function getLockedSegments(segmentationId: string): number[] | [];

declare function getMeanPoints(points: IPoints[]): IPoints;

declare function getMeanTouchPoints(points: ITouchPoints[]): ITouchPoints;

declare function getNumberOfAnnotations(toolName: string, annotationGroupSelector: AnnotationGroupSelector): number;

declare function getOrientationStringLPS(vector: Types_2.Point3): string;

declare function getPoint(points: any, idx: any): any[];

declare function getPointInLineOfSightWithCriteria(viewport: Types_2.IVolumeViewport, worldPos: Types_2.Point3, targetVolumeId: string, criteriaFunction: (intensity: number, point: Types_2.Point3) => Types_2.Point3, stepSize?: number): Types_2.Point3;

declare function getPolyDataPointIndexes(polyData: vtkPolyData): any[];

declare function getPolyDataPoints(polyData: vtkPolyData): any[];

declare function getSegmentation(segmentationId: string): Segmentation | undefined;

declare function getSegmentationRepresentationByUID(toolGroupId: string, segmentationRepresentationUID: string): ToolGroupSpecificRepresentation | undefined;

declare function getSegmentationRepresentations(toolGroupId: string): ToolGroupSpecificRepresentations | [];

declare function getSegmentationRepresentationSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string): RepresentationConfig;

declare function getSegmentationRepresentationSpecificConfig_2(toolGroupId: string, segmentationRepresentationUID: string): RepresentationConfig;

declare function getSegmentations(): Segmentation[] | [];

declare function getSegmentationVisibility(toolGroupId: string, segmentationRepresentationUID: string): boolean | undefined;

declare function getSegmentSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number): RepresentationConfig;

declare function getSegmentSpecificRepresentationConfig(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number): RepresentationConfig;

declare function getState(annotation?: Annotation): AnnotationStyleStates;

declare const getSubPixelSpacingAndXYDirections: (viewport: Types_2.IStackViewport | Types_2.IVolumeViewport, subPixelResolution: number) => {
    spacing: Types_2.Point2;
    xDir: Types_2.Point3;
    yDir: Types_2.Point3;
};

declare function getSynchronizer(synchronizerId: string): Synchronizer | void;

declare function getSynchronizersForViewport(viewportId: string, renderingEngineId: string): Array<Synchronizer>;

declare function getTextBoxCoordsCanvas(annotationCanvasPoints: Array<Types_2.Point2>): Types_2.Point2;

declare function getToolGroup(toolGroupId: string): IToolGroup | undefined;

declare function getToolGroupForViewport(viewportId: string, renderingEngineId: string): IToolGroup | undefined;

declare function getToolGroupIdsWithSegmentation(segmentationId: string): string[];

declare function getToolGroupSpecificConfig(toolGroupId: string): SegmentationRepresentationConfig;

declare function getToolGroupSpecificConfig_2(toolGroupId: string): SegmentationRepresentationConfig;

declare function getToolGroupsWithToolName(toolName: string): IToolGroup[] | [];

declare function getToolState(element: HTMLDivElement): CINETypes.ToolData | undefined;

declare function getViewportIdsWithToolToRender(element: HTMLDivElement, toolName: string, requireParallelNormals?: boolean): string[];

declare function getWorldWidthAndHeightFromCorners(viewPlaneNormal: Types_2.Point3, viewUp: Types_2.Point3, topLeftWorld: Types_2.Point3, bottomRightWorld: Types_2.Point3): {
    worldWidth: number;
    worldHeight: number;
};

declare type GroupSpecificAnnotations = {
    [toolName: string]: Annotations;
};

declare function hideElementCursor(element: HTMLDivElement): void;

declare interface IAnnotationManager {
    getGroupKey: (annotationGroupSelector: AnnotationGroupSelector) => string;
    addAnnotation: (annotation: Annotation, groupKey: string) => void;
    getAnnotations: (groupKey: string, toolName?: string) => GroupSpecificAnnotations | Annotations;
    getAnnotation: (annotationUID: string) => Annotation;
    removeAnnotation: (annotationUID: string) => void;
    removeAnnotations: (groupKey: string) => void;
    removeAllAnnotations: () => void;
    getNumberOfAnnotations: (groupKey: string, toolName?: string) => number;
    getNumberOfAllAnnotations: () => number;
}

declare interface IBaseTool {
    toolGroupId: string;
    supportedInteractionTypes: InteractionTypes[];
    mode: ToolModes;
    configuration: {
        preventHandleOutsideImage?: boolean;
        strategies?: Record<string, any>;
        defaultStrategy?: string;
        activeStrategy?: string;
        strategyOptions?: Record<string, unknown>;
    };
}

declare interface ICache {
    /** Set the maximum cache size  */
    setMaxCacheSize: (maxCacheSize: number) => void;
    /** Get the maximum cache size  */
    getMaxCacheSize: () => number;
    /** Get the current cache size  */
    getCacheSize: () => number;
    /** Stores the imageLoad Object inside the cache */
    putImageLoadObject: (
    imageId: string,
    imageLoadObject: IImageLoadObject
    ) => Promise<any>;
    /** Retrieves the imageLoad Object from the cache */
    getImageLoadObject: (imageId: string) => IImageLoadObject | void;
    /** Stores the volumeLoad Object inside the cache */
    putVolumeLoadObject: (
    volumeId: string,
    volumeLoadObject: IVolumeLoadObject
    ) => Promise<any>;
    /** Retrieves the volumeLoad Object from the cache */
    getVolumeLoadObject: (volumeId: string) => IVolumeLoadObject | void;
    /** Purge cache both image and volume */
    purgeCache: () => void;
}

declare interface ICachedGeometry {
    geometryId: string;
    geometryLoadObject: IGeometryLoadObject;
    loaded: boolean;
    timeStamp: number;
    sizeInBytes: number;
    geometry?: IGeometry;
}

declare interface ICachedImage {
    image?: IImage;
    imageId: string;
    imageLoadObject: IImageLoadObject;
    loaded: boolean;
    sharedCacheKey?: string;
    timeStamp: number;
    sizeInBytes: number;
}

declare interface ICachedVolume {
    volume?: IImageVolume;
    volumeId: string;
    volumeLoadObject: IVolumeLoadObject;
    loaded: boolean;
    timeStamp: number;
    sizeInBytes: number;
}

/**
 * Camera Interface. See {@link https://kitware.github.io/vtk-examples/site/VTKBook/03Chapter3/#35-cameras} if you
 * want to know more about the camera.
 */
declare interface ICamera {
    /** Camera Focal point */
    focalPoint?: Point3;
    /** Camera Parallel Projection flag - whether camera is using parallel projection */
    parallelProjection?: boolean;
    /** Camera parallel scale - used for parallel projection zoom, smaller values zoom in */
    parallelScale?: number;
    /**
     * Scale factor for the camera, it is the ratio of how much an image pixel takes
     * up one screen pixel
     */
    scale?: number;
    /** Camera position */
    position?: Point3;
    /** Camera view angle - 90 degrees is orthographic */
    viewAngle?: number;
    /** Camera viewPlaneNormal - negative of the direction the camera is pointing or directionOfProjection*/
    viewPlaneNormal?: Point3;
    /** Camera viewUp - the direction of viewUP in camera */
    viewUp?: Point3;
    /** flip Horizontal */
    flipHorizontal?: boolean;
    /** flip Vertical */
    flipVertical?: boolean;
    /** clipping range */
    clippingRange?: Point2;
}

declare interface IContour {
    readonly id: string;
    readonly sizeInBytes: number;
    points: Point3[];
    color: any;
    _getSizeInBytes(): number;
    /**
     * It returns the value of the points property of the data object
     * @returns The points property of the data object.
     */
    getPoints(): Point3[];
    getColor(): Point3;
    getType(): ContourType;
    getFlatPointsArray(): number[];
}

/**
 * This class represents a set of contours in 3d space.
 * Usually contours are grouped together in a contour set to represent a meaningful shape.
 */
declare interface IContourSet {
    readonly id: string;
    readonly sizeInBytes: number;
    readonly frameOfReferenceUID: string;
    contours: IContour[];
    _createEachContour(data: ContourData[]): void;
    getSizeInBytes(): number;
    getSegmentIndex(): number;
    getCentroid(): Point3;
    getColor(): any;
    /**
     * This function returns the contours of the image
     * @returns The contours of the image.
     */
    getContours(): IContour[];
    /**
     * It returns an array of all the points in the glyph
     * @returns An array of points.
     */
    getFlatPointsArray(): Point3[];
    /**
     * This function returns the number of contours in the current shape.
     * @returns The number of contours in the glyph.
     */
    getNumberOfContours(): number;
    /**
     * It loops through each contour in the `contours` array, and adds the number of
     * points in each contour to the `numberOfPoints` variable
     * @returns The number of points in the contours.
     */
    getTotalNumberOfPoints(): number;
    /**
     * It returns an array of the number of points in each contour.
     * @returns An array of numbers.
     */
    getNumberOfPointsArray(): number[];
    /**
     * It returns the points in a contour.
     * @param contourIndex - The index of the contour you want to get the
     * points from.
     * @returns An array of Point3 objects.
     */
    getPointsInContour(contourIndex: number): Point3[];
    /**
     * "This function returns the number of points in a contour."
     *
     * @param contourIndex - The index of the contour you want to get the
     * number of points from.
     * @returns The number of points in the contour.
     */
    getNumberOfPointsInAContour(contourIndex: number): number;
}

declare interface ICornerstoneTools3dState {
    isInteractingWithTool: boolean;
    isMultiPartToolActive: boolean;
    tools: Record<string, {
        toolClass: IToolClassReference;
    }>;
    toolGroups: Array<IToolGroup>;
    synchronizers: Array<Synchronizer>;
    svgNodeCache: Record<string, unknown>;
    enabledElements: Array<unknown>;
    handleRadius: number;
}

declare type IDistance = {
    page: number;
    client: number;
    canvas: number;
    world: number;
};

/**
 * Cornerstone ImageVolume interface. Todo: we should define new IVolume class
 * with appropriate typings for the other types of volume that don't have images (nrrd, nifti)
 */
declare interface IDynamicImageVolume extends IImageVolume {
    /** Returns the active time point index */
    get timePointIndex(): number;
    /** Set the active time point index which also updates the active scalar data */
    set timePointIndex(newTimePointIndex: number);
    /** Returns the number of time points */
    get numTimePoints(): number;
    /** return scalar data arrays (one per timepoint) */
    getScalarDataArrays(): VolumeScalarData[];
}

/**
 * Cornerstone Enabled Element interface
 */
declare interface IEnabledElement {
    /** Cornerstone Viewport instance - can be Stack or Volume, or Video Viewport as of now.
     * For the moment, need to cast to unknown first before casting to IVideoViewport
     * (TODO) - this will be done as part of adding annotation tools for video
     */
    viewport: IStackViewport | IVolumeViewport;
    /** Cornerstone Rendering Engine instance */
    renderingEngine: IRenderingEngine;
    /** Unique ID of the viewport in the renderingEngine */
    viewportId: string;
    /** Unique ID of the renderingEngine */
    renderingEngineId: string;
    /** FrameOfReference the enabledElement is rendering inside */
    FrameOfReferenceUID: string;
}

declare interface IGeometry {
    id: string;
    type: GeometryType;
    data: IContourSet | Surface;
    sizeInBytes: number;
}

declare interface IGeometryLoadObject {
    /** promise that resolves to an ImageVolume */
    promise: Promise<IGeometry>;
    /** optional cancel function for loading*/
    cancelFn?: () => void;
    /** optional decache function */
    decache?: () => void;
}

/**
 * Cornerstone Image interface, it is used for both CPU and GPU rendering
 */
declare interface IImage {
    /** Image Id */
    imageId: string;
    sharedCacheKey?: string;
    /** Whether the image is Pre-scaled during loading */
    isPreScaled?: boolean;
    /** preScale object */
    preScale?: {
        /** boolean flag to indicate whether the image has been scaled */
        scaled?: boolean;
        /** scaling parameters */
        scalingParameters?: {
            /** modality of the image */
            modality?: string;
            /** rescale slop */
            rescaleSlope?: number;
            /** rescale intercept */
            rescaleIntercept?: number;
            /** PT suvbw */
            suvbw?: number;
        };
    };
    /** minimum pixel value of the image */
    minPixelValue: number;
    /* maximum pixel value of the image */
    maxPixelValue: number;
    /** slope from metadata for scaling */
    slope: number;
    /** intercept from metadata for scaling */
    intercept: number;
    /** windowCenter from metadata */
    windowCenter: number[] | number;
    /** windowWidth from metadata */
    windowWidth: number[] | number;
    /** voiLUTFunction from metadata */
    voiLUTFunction: string;
    /** function that returns the pixelData as an array */
    getPixelData: () => PixelDataTypedArray;
    getCanvas: () => HTMLCanvasElement;
    /** image number of rows */
    rows: number;
    /** image number of columns */
    columns: number;
    /** image height */
    height: number;
    /** image width */
    width: number;
    /** is image a color image */
    color: boolean;
    /** is image rgb and alpha */
    rgba: boolean;
    /** number of components in the image */
    numComps: number;
    /** CPU: custom render method for the image */
    render?: (
    enabledElement: CPUFallbackEnabledElement,
    invalidated: boolean
    ) => unknown;
    /** column pixel spacing */
    columnPixelSpacing: number;
    /** row pixel spacing */
    rowPixelSpacing: number;
    /** slice thickness */
    sliceThickness?: number;
    /** whether image pixels are inverted in color */
    invert: boolean;
    /** image photometric interpretation */
    photometricInterpretation?: string;
    /** image size in number of bytes */
    sizeInBytes: number;
    /** CPU: custom modality LUT for image  */
    modalityLUT?: CPUFallbackLUT;
    /** CPU: custom VOI LUT for image  */
    voiLUT?: CPUFallbackLUT;
    /** CPU: custom color map for image  */
    colormap?: CPUFallbackColormap;
    /** image scaling metadata - including PT suv values */
    scaling?: {
        PT?: {
            // @TODO: Do these values exist?
            SUVlbmFactor?: number;
            SUVbsaFactor?: number;
            // accessed in ProbeTool
            suvbwToSuvlbm?: number;
            suvbwToSuvbsa?: number;
        };
    };
    loadTimeInMS?: number;
    decodeTimeInMS?: number;
    /** CPU: image statistics for rendering */
    stats?: {
        lastStoredPixelDataToCanvasImageDataTime?: number;
        lastGetPixelDataTime?: number;
        lastPutImageDataTime?: number;
        lastLutGenerateTime?: number;
        lastRenderedViewport?: unknown;
        lastRenderTime?: number;
    };
    /** CPU: image cached LUT */
    cachedLut?: {
        windowWidth?: number | number[];
        windowCenter?: number | number[];
        invert?: boolean;
        lutArray?: Uint8ClampedArray;
        modalityLUT?: unknown;
        voiLUT?: CPUFallbackLUT;
    };
}

/**
 * IImageCalibration is an object that stores information about the type
 * of image calibration.
 */
declare interface IImageCalibration {
    /**
     * The pixel spacing for the image, in mm between pixel centers
     * These are not required, and are deprecated in favour of getting the original
     * image spacing and then applying the transforms.  The values here should
     * be identical to original spacing.
     */
    rowPixelSpacing?: number;
    columnPixelSpacing?: number;
    /** The scaling of measurement values relative to the base pixel spacing (1 if not specified) */
    scale?: number;
    /**
     * The calibration aspect ratio for non-square calibrations.
     * This is the aspect ratio similar to the scale above that applies when
     * the viewport is displaying non-square image pixels as square screen pixels.
     *
     * Defaults to 1 if not specified, and is also 1 if the Viewport has squared
     * up the image pixels so that they are displayed as a square.
     * Not well handled currently as this needs to be incorporated into
     * tools when doing calculations.
     */
    aspect?: number;
    /** The type of the pixel spacing, distinguishing between various
     * types projection (CR/DX/MG) spacing and volumetric spacing (the type is
     * an empty string as it doesn't get a suffix, but this distinguishes it
     * from other types)
     */
    type: CalibrationTypes;
    /** A tooltip which can be used to explain the calibration information */
    tooltip?: string;
    /** The DICOM defined ultrasound regions.  Used for non-distance spacing units. */
    sequenceOfUltrasoundRegions?: Record<string, unknown>[];
}

/**
 * IImageData of an image, which stores actual scalarData and metaData about the image.
 * IImageData is different from vtkImageData.
 */
declare interface IImageData {
    /** image dimensions */
    dimensions: Point3;
    /** image direction */
    direction: Mat3;
    /** image spacing */
    spacing: Point3;
    /** image origin */
    origin: Point3;
    /** image scalarData which stores the array of pixelData */
    scalarData: Float32Array | Uint16Array | Uint8Array | Int16Array;
    /** vtkImageData object */
    imageData: vtkImageData;
    /** image metadata - currently only modality */
    metadata: { Modality: string };
    /** image scaling for scaling pixelArray */
    scaling?: Scaling;
    /** whether the image has pixel spacing and it is not undefined */
    hasPixelSpacing?: boolean;

    calibration?: IImageCalibration;

    /** preScale object */
    preScale?: {
        /** boolean flag to indicate whether the image has been scaled */
        scaled?: boolean;
        /** scaling parameters */
        scalingParameters?: {
            /** modality of the image */
            modality?: string;
            /** rescale slop */
            rescaleSlope?: number;
            /** rescale intercept */
            rescaleIntercept?: number;
            /** PT suvbw */
            suvbw?: number;
        };
    };
}

/**
 * ImageLoadObject interface which any imageLoader should return
 */
declare interface IImageLoadObject {
    /** promise that resolves to an image */
    promise: Promise<IImage>;
    /** optional cancel function for loading*/
    cancelFn?: () => void;
    /** optional decache function */
    decache?: () => void;
}

/**
 * Cornerstone ImageVolume interface. Todo: we should define new IVolume class
 * with appropriate typings for the other types of volume that don't have images (nrrd, nifti)
 */
declare interface IImageVolume {
    /** unique identifier of the volume in the cache */
    readonly volumeId: string;
    /** volume dimensions */
    dimensions: Point3;
    /** volume direction */
    direction: Mat3;
    /** volume metadata */
    metadata: Metadata;
    /** volume origin - set to the imagePositionPatient of the last image in the volume */
    origin: Point3;
    /** Whether preScaling has been performed on the volume */
    isPreScaled: boolean;
    /** volume scaling metadata */
    scaling?: {
        PT?: {
            SUVlbmFactor?: number;
            SUVbsaFactor?: number;
            suvbwToSuvlbm?: number;
            suvbwToSuvbsa?: number;
        };
    };
    /** volume size in bytes */
    sizeInBytes?: number;
    /** volume spacing */
    spacing: Point3;
    /** number of voxels in the volume */
    numVoxels: number;
    /** volume image data as vtkImageData */
    imageData?: vtkImageData;
    /** openGL texture for the volume */
    vtkOpenGLTexture: any;
    /** loading status object for the volume containing loaded/loading statuses */
    loadStatus?: Record<string, any>;
    /** imageIds of the volume (if it is built of separate imageIds) */
    imageIds: Array<string>;
    /** volume referencedVolumeId (if it is derived from another volume) */
    referencedVolumeId?: string; // if volume is derived from another volume
    /** whether the metadata for the pixel spacing is not undefined  */
    hasPixelSpacing: boolean;
    /** return true if it is a 4D volume or false if it is 3D volume */
    isDynamicVolume(): boolean;
    /** method to convert the volume data in the volume cache, to separate images in the image cache */
    convertToCornerstoneImage?: (
    imageId: string,
    imageIdIndex: number
    ) => IImageLoadObject;

    //cancel load
    cancelLoading?: () => void;

    /** return the volume scalar data */
    getScalarData(): VolumeScalarData;

    /** return the index of a given imageId */
    getImageIdIndex(imageId: string): number;

    /** return the index of a given imageURI */
    getImageURIIndex(imageURI: string): number;

    /** destroy the volume and make it unusable */
    destroy(): void;
}

declare type ImageActor = vtkImageSlice;

/**
 * IMAGE_CACHE_IMAGE_ADDED Event type
 */
declare type ImageCacheImageAddedEvent =
CustomEvent_2<ImageCacheImageAddedEventDetail>;

/**
 * IMAGE_CACHE_IMAGE_ADDED Event's data
 */
declare type ImageCacheImageAddedEventDetail = {
    /** the added image */
    image: ICachedImage;
};

/**
 * IMAGE_CACHE_IMAGE_REMOVED Event type
 */
declare type ImageCacheImageRemovedEvent =
CustomEvent_2<ImageCacheImageRemovedEventDetail>;

/**
 * IMAGE_CACHE_IMAGE_REMOVED Event's data
 */
declare type ImageCacheImageRemovedEventDetail = {
    /** the removed image id */
    imageId: string;
};

/**
 * IMAGE_LOADED Event type
 */
declare type ImageLoadedEvent = CustomEvent_2<ImageLoadedEventDetail>;

/**
 * IMAGE_LOADED Event's data
 */
declare type ImageLoadedEventDetail = {
    /** the loaded image */
    image: IImage;
};

/**
 * IMAGE_LOADED_FAILED Event type
 */
declare type ImageLoadedFailedEvent = CustomEvent_2<ImageLoadedFailedEventDetail>;

/**
 * IMAGE_LOADED_FAILED Event's data
 */
declare type ImageLoadedFailedEventDetail = {
    /** the imageId for the image */
    imageId: string;
    error: unknown;
};

/**
 * Any imageLoader function should implement a loading given the imageId
 * and returns a mandatory promise which will resolve to the loaded image object.
 * Additional `cancelFn` and `decache` can be implemented.
 */
declare type ImageLoaderFn = (
imageId: string,
options?: Record<string, any>
) => {
    /** Promise that resolves to the image object */
    promise: Promise<Record<string, any>>;
    cancelFn?: () => void | undefined;
    decache?: () => void | undefined;
};

/**
 * IMAGE_LOAD_PROGRESS
 */
declare type ImageLoadProgressEvent = CustomEvent_2<ImageLoadProgressEventDetail>;

/**
 * IMAGE_LOAD_PROGRESS Event's data. Note this is only for one image load and NOT volume load.
 */
declare type ImageLoadProgressEventDetail = {
    /** url we are loading from */
    url: string;
    /** loading image image id */
    imageId: string;
    /** the bytes browser receive */
    loaded: number;
    /** the total bytes settled by the header */
    total: number;
    /** loaded divided by total * 100 - shows the percentage of the image loaded */
    percent: number;
};

declare class ImageMouseCursor extends MouseCursor {
    private url;
    private x;
    private y;
    constructor(url: string, x?: number, y?: number, name?: string | undefined, fallback?: MouseCursor | undefined);
    getStyleProperty(): string;
    static getUniqueInstanceName(prefix: string): string;
}

declare interface ImagePixelModule {
    bitsAllocated: number;
    bitsStored: number;
    samplesPerPixel: number;
    highBit: number;
    photometricInterpretation: string;
    pixelRepresentation: string;
    windowWidth: number | number[];
    windowCenter: number | number[];
    voiLUTFunction: VOILUTFunctionType;
    modality: string;
}

declare interface ImagePlaneModule {
    columnCosines?: Point3;
    columnPixelSpacing?: number;
    imageOrientationPatient?: Float32Array;
    imagePositionPatient?: Point3;
    pixelSpacing?: Point2;
    rowCosines?: Point3;
    rowPixelSpacing?: number;
    sliceLocation?: number;
    sliceThickness?: number;
    frameOfReferenceUID: string;
    columns: number;
    rows: number;
}

/**
 * IMAGE_RENDERED Event type
 */
declare type ImageRenderedEvent = CustomEvent_2<ElementEnabledEventDetail>;

/**
 * IMAGE_RENDERED Event's data
 */
declare type ImageRenderedEventDetail = {
    /** Viewport HTML element in the DOM */
    element: HTMLDivElement;
    /** Viewport Unique ID in the renderingEngine */
    viewportId: string;
    /** Unique ID for the renderingEngine */
    renderingEngineId: string;
    /** Whether to suppress the event */
    suppressEvents?: boolean;
    /** Include information on whether this is a real rendering or just background */
    viewportStatus: ViewportStatus;
};

declare type ImageSliceData = {
    numberOfSlices: number;
    imageIndex: number;
};

/**
 * IMAGE_SPACING_CALIBRATED
 */
declare type ImageSpacingCalibratedEvent =
CustomEvent_2<ImageSpacingCalibratedEventDetail>;

/**
 * IMAGE_SPACING_CALIBRATED Event's data
 */
declare type ImageSpacingCalibratedEventDetail = {
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
    imageId: string;
    /** calibration contains the scaling information as well as other calibration info */
    calibration: IImageCalibration;
    imageData: vtkImageData;
    worldToIndex: mat4;
};

/** The base class for volume data. It includes the volume metadata
 * and the volume data along with the loading status.
 */
declare class ImageVolume implements IImageVolume {
    private _imageIds: Array<string>;
    private _imageIdsIndexMap = new Map();
    private _imageURIsIndexMap = new Map();
    /** volume scalar data 3D or 4D */
    protected scalarData: VolumeScalarData | Array<VolumeScalarData>;

    /** Read-only unique identifier for the volume */
    readonly volumeId: string;

    isPreScaled = false;

    /** Dimensions of the volume */
    dimensions: Point3;
    /** volume direction in world space */
    direction: Mat3;
    /** volume metadata */
    metadata: Metadata;
    /** volume origin, Note this is an opinionated origin for the volume */
    origin: Point3;
    /** Whether preScaling has been performed on the volume */
    /** volume scaling parameters if it contains scaled data */
    scaling?: {
        PT?: {
            // @TODO: Do these values exist?
            SUVlbmFactor?: number;
            SUVbsaFactor?: number;
            // accessed in ProbeTool
            suvbwToSuvlbm?: number;
            suvbwToSuvbsa?: number;
        };
    };
    /** volume size in bytes */
    sizeInBytes?: number; // Seems weird to pass this in? Why not grab it from scalarData.byteLength
    /** volume spacing in 3d world space */
    spacing: Point3;
    /** volume number of voxels */
    numVoxels: number;
    /** volume image data */
    imageData?: vtkImageData;
    /** open gl texture for the volume */
    vtkOpenGLTexture: any; // No good way of referencing vtk classes as they aren't classes.
    /** load status object for the volume */
    loadStatus?: Record<string, any>;
    /** optional reference volume id if the volume is derived from another volume */
    referencedVolumeId?: string;
    /** whether the metadata for the pixel spacing is not undefined  */
    hasPixelSpacing: boolean;

    constructor(props: IVolume) {
        this.volumeId = props.volumeId;
        this.metadata = props.metadata;
        this.dimensions = props.dimensions;
        this.spacing = props.spacing;
        this.origin = props.origin;
        this.direction = props.direction;
        this.imageData = props.imageData;
        this.scalarData = props.scalarData;
        this.sizeInBytes = props.sizeInBytes;
        this.vtkOpenGLTexture = vtkStreamingOpenGLTexture.newInstance();
        this.numVoxels =
        this.dimensions[0] * this.dimensions[1] * this.dimensions[2];

        if (props.scaling) {
            this.scaling = props.scaling;
        }

        if (props.referencedVolumeId) {
            this.referencedVolumeId = props.referencedVolumeId;
        }
    }

    /** return the image ids for the volume if it is made of separated images */
    public get imageIds(): Array<string> {
        return this._imageIds;
    }

    /** updates the image ids */
    public set imageIds(newImageIds: Array<string>) {
        this._imageIds = newImageIds;
        this._reprocessImageIds();
    }

    private _reprocessImageIds() {
        this._imageIdsIndexMap.clear();
        this._imageURIsIndexMap.clear();

        this._imageIds.forEach((imageId, i) => {
            const imageURI = imageIdToURI(imageId);

            this._imageIdsIndexMap.set(imageId, i);
            this._imageURIsIndexMap.set(imageURI, i);
        });
    }

    cancelLoading: () => void;

    /** return true if it is a 4D volume or false if it is 3D volume */
    public isDynamicVolume(): boolean {
        return false;
    }

    /**
     * Return the scalar data for 3D volumes or the active scalar data
     * (current time point) for 4D volumes
     */
    public getScalarData(): VolumeScalarData {
        if (isTypedArray(this.scalarData)) {
            return <VolumeScalarData>this.scalarData;
        }

        throw new Error('Unknown scalar data type');
    }

    /**
     * return the index of a given imageId
     * @param imageId - imageId
     * @returns imageId index
     */
    public getImageIdIndex(imageId: string): number {
        return this._imageIdsIndexMap.get(imageId);
    }

    /**
     * return the index of a given imageURI
     * @param imageId - imageURI
     * @returns imageURI index
     */
    public getImageURIIndex(imageURI: string): number {
        return this._imageURIsIndexMap.get(imageURI);
    }

    /**
     * destroy the volume and make it unusable
     */
    destroy(): void {
        // TODO: GPU memory associated with volume is not cleared.
        this.imageData.delete();
        this.imageData = null;
        this.scalarData = null;

        this.vtkOpenGLTexture.releaseGraphicsResources();
        this.vtkOpenGLTexture.delete();
    }
}

/**
 * IMAGE_VOLUME_LOADING_COMPLETED Event type
 * This event is fired when a volume is fully loaded, means all the frames
 * are loaded and cached.
 */
declare type ImageVolumeLoadingCompletedEvent =
CustomEvent_2<ImageVolumeLoadingCompletedEventDetail>;

/**
 * IMAGE_VOLUME_LOADING_COMPLETED Event's data
 */
declare type ImageVolumeLoadingCompletedEventDetail = {
    /** the loaded volume */
    volumeId: string;
    /** FrameOfReferenceUID where the volume belongs to */
    FrameOfReferenceUID: string;
};

/**
 * IMAGE_VOLUME_MODIFIED Event type
 */
declare type ImageVolumeModifiedEvent = CustomEvent_2<ImageVolumeModifiedEventDetail>;

/**
 * IMAGE_VOLUME_MODIFIED Event's data
 */
declare type ImageVolumeModifiedEventDetail = {
    /** the modified volume */
    imageVolume: IImageVolume;
    /** FrameOfReferenceUID where the volume belongs to */
    FrameOfReferenceUID: string;
};

export declare function init(defaultConfiguration?: {}): void;

declare function initElementCursor(element: HTMLDivElement, cursor: MouseCursor | null): void;

declare type InteractionEndEventDetail = InteractionEventDetail;

declare type InteractionEndType = Types_2.CustomEventType<InteractionEndEventDetail>;

declare type InteractionEventDetail = NormalizedInteractionEventDetail & (MouseCustomEventDetail | TouchCustomEventDetail) & (MousePointsDetail | TouchPointsDetail);

declare type InteractionEventType = Types_2.CustomEventType<InteractionEventDetail>;

declare type InteractionStartEventDetail = InteractionEventDetail;

declare type InteractionStartType = Types_2.CustomEventType<InteractionStartEventDetail>;

declare type InteractionTypes = 'Mouse' | 'Touch';

declare type InternalVideoCamera = {
    panWorld?: Point2;
    parallelScale?: number;
};

declare function interpolateAnnotation(enabledElement: Types_2.IEnabledElement, annotation: PlanarFreehandROIAnnotation, knotsRatioPercentage: number): boolean;

/**
 * Interpolation types for image rendering
 */
declare enum InterpolationType {
    /** nearest neighbor interpolation */
    NEAREST,
    /** linear interpolation - Default */
    LINEAR,
    /** */
    FAST_LINEAR,
}

declare function intersectLine(line1Start: Types_2.Point2, line1End: Types_2.Point2, line2Start: Types_2.Point2, line2End: Types_2.Point2): number[];

declare function invertOrientationStringLPS(orientationString: string): string;

declare type IPoints = {
    page: Types_2.Point2;
    client: Types_2.Point2;
    canvas: Types_2.Point2;
    world: Types_2.Point3;
};

/**
 * Register image loader interface
 */
declare interface IRegisterImageLoader {
    registerImageLoader: (scheme: string, imageLoader: ImageLoaderFn) => void;
}

declare interface IRenderingEngine {
    id: string;
    hasBeenDestroyed: boolean;
    offscreenMultiRenderWindow: any;
    offScreenCanvasContainer: any;
    setViewports(viewports: Array<PublicViewportInput>): void;
    resize(immediate?: boolean, keepCamera?: boolean): void;
    getViewport(id: string): IViewport;
    getViewports(): Array<IViewport>;
    render(): void;
    renderViewports(viewportIds: Array<string>): void;
    renderViewport(viewportId: string): void;
    renderFrameOfReference(FrameOfReferenceUID: string): void;
    fillCanvasWithBackgroundColor(
    canvas: HTMLCanvasElement,
    backgroundColor: [number, number, number]
    ): void;
    enableElement(viewportInputEntry: PublicViewportInput): void;
    disableElement(viewportId: string): void;
    getStackViewports(): Array<IStackViewport>;
    getVolumeViewports(): Array<IVolumeViewport>;
    getVideoViewports(): Array<IVideoViewport>;
    destroy(): void;
    _debugRender(): void;
}

declare function isAnnotationLocked(annotation: Annotation): boolean;

declare function isAnnotationSelected(annotationUID: string): boolean;

declare function isAnnotationVisible(annotationUID: string): boolean | undefined;

declare function isObject(value: any): boolean;

declare function isSegmentIndexLocked(segmentationId: string, segmentIndex: number): boolean;

/**
 * Interface for Stack Viewport
 */
declare interface IStackViewport extends IViewport {
    modality: string;
    /** Scaling parameters */
    scaling: Scaling;
    /**
     * Resizes the viewport - only used in CPU fallback for StackViewport. The
     * GPU resizing happens inside the RenderingEngine.
     */
    resize: () => void;
    /**
     * Returns the frame of reference UID, if the image doesn't have imagePlaneModule
     * metadata, it returns undefined, otherwise, frameOfReferenceUID is returned.
     */
    getFrameOfReferenceUID: () => string;

    /**
     * Update the default properties of the viewport and add properties by imageId if specified
     * setting the VOI, inverting the colors and setting the interpolation type, rotation
     */
    setDefaultProperties(
    ViewportProperties: StackViewportProperties,
    imageId?: string
    ): void;

    /**
     * Remove the global default properties of the viewport or remove default properties for an imageId if specified
     */
    clearDefaultProperties(imageId?: string): void;
    /**
     * Sets the properties for the viewport on the default actor. Properties include
     * setting the VOI, inverting the colors and setting the interpolation type, rotation
     */
    setProperties(
        {
        voiRange,
        invert,
        interpolationType,
        rotation,
        colormap,
    }: StackViewportProperties,
    suppressEvents?: boolean
    ): void;
    /**
     * Retrieve the viewport default properties
     */
    getDefaultProperties: (imageId?: string) => StackViewportProperties;
    /**
     * Retrieve the viewport properties
     */
    getProperties: () => StackViewportProperties;
    /**
     * canvasToWorld Returns the world coordinates of the given `canvasPos`
     * projected onto the plane defined by the `Viewport`'s camera.
     */
    canvasToWorld: (canvasPos: Point2) => Point3;
    /**
     * Returns the canvas coordinates of the given `worldPos`
     * projected onto the `Viewport`'s `canvas`.
     */
    worldToCanvas: (worldPos: Point3) => Point2;
    /**
     * Returns the index of the imageId being renderer
     */
    getCurrentImageIdIndex: () => number;
    /**
     * Returns the list of image Ids for the current viewport
     */
    getImageIds: () => string[];
    /**
     * Returns true if the viewport contains the imageId
     */
    hasImageId: (imageId: string) => boolean;
    /**
     * Returns true if the viewport contains the imageURI
     */
    hasImageURI: (imageURI: string) => boolean;
    /**
     * Returns the currently rendered imageId
     */
    getCurrentImageId: () => string;

    /**
     * Custom rendering pipeline for the rendering for the CPU fallback
     */
    customRenderViewportToCanvas: () => {
        canvas: HTMLCanvasElement;
        element: HTMLDivElement;
        viewportId: string;
        renderingEngineId: string;
    };
    /**
     * Returns the image and its properties that is being shown inside the
     * stack viewport. It returns, the image dimensions, image direction,
     * image scalar data, vtkImageData object, metadata, and scaling (e.g., PET suvbw)
     */
    getImageData(): IImageData | CPUIImageData;
    /**
     * Returns the raw/loaded image being shown inside the stack viewport.
     */
    getCornerstoneImage: () => IImage;
    /**
     * Reset the viewport properties to the his default values if possible
     */
    resetToDefaultProperties(): void;
    /**
     * Reset the viewport properties to the default metadata values
     */
    resetProperties(): void;
    /**
     * If the user has selected CPU rendering, return the CPU camera, otherwise
     * return the default camera
     */
    getCamera(): ICamera;
    /**
     * Set the camera based on the provided camera object.
     */
    setCamera(cameraInterface: ICamera): void;
    /**
     * Sets the imageIds to be visualized inside the stack viewport. It accepts
     * list of imageIds, the index of the first imageId to be viewed. It is a
     * asynchronous function that returns a promise resolving to imageId being
     * displayed in the stack viewport.
     */
    setStack(
    imageIds: Array<string>,
    currentImageIdIndex?: number
    ): Promise<string>;
    /**
     * Centers Pan and resets the zoom for stack viewport.
     */
    resetCamera(resetPan?: boolean, resetZoom?: boolean): boolean;
    /**
     * Loads the image based on the provided imageIdIndex. It is an Async function which
     * returns a promise that resolves to the imageId.
     */
    setImageIdIndex(imageIdIndex: number): Promise<string>;
    /**
     * Calibrates the image with new metadata that has been added for imageId. To calibrate
     * a viewport, you should add your calibration data manually to
     * calibratedPixelSpacingMetadataProvider and call viewport.calibrateSpacing
     * for it get applied.
     */
    calibrateSpacing(imageId: string): void;
    /**
     * If the renderer is CPU based, throw an error. Otherwise, returns the `vtkRenderer` responsible for rendering the `Viewport`.
     */
    getRenderer(): any;
    /**
     * It sets the colormap to the default colormap.
     */
    unsetColormap(): void;
}

/**
 * Cornerstone StreamingImageVolume which extends ImageVolume
 */
declare interface IStreamingImageVolume extends ImageVolume {
    /** method to load all the loading requests */
    clearLoadCallbacks(): void;
    /** method to convert the volume data in the volume cache, to separate images in the image cache */
    convertToCornerstoneImage(imageId: string, imageIdIndex: number): any;
    /** method to decache the volume from cache */
    decache(completelyRemove: boolean): void;
}

declare interface IStreamingVolumeProperties {
    /** imageIds of the volume  */
    imageIds: Array<string>;

    /** loading status object for the volume containing loaded/loading statuses */
    loadStatus: {
        loaded: boolean;
        loading: boolean;
        cancelled: boolean;
        cachedFrames: Array<boolean>;
        callbacks: Array<() => void>;
    };
}

declare function isValidRepresentationConfig(representationType: string, config: RepresentationConfig): boolean;

declare function isViewportPreScaled(viewport: Types_2.IStackViewport | Types_2.IVolumeViewport, targetId: string): boolean;

declare interface ISynchronizerEventHandler {
    (synchronizer: Synchronizer, sourceViewport: Types_2.IViewportId, targetViewport: Types_2.IViewportId, sourceEvent: any, options?: any): void;
}

declare type IToolBinding = {
    mouseButton?: ToolBindingMouseType;
    modifierKey?: ToolBindingKeyboardType;
    numTouchPoints?: number;
};

declare type IToolClassReference = new <T extends BaseTool>(config: any) => T;

declare interface IToolGroup {
    _toolInstances: Record<string, any>;
    id: string;
    viewportsInfo: Array<Types_2.IViewportId>;
    toolOptions: Record<string, any>;
    getViewportIds: () => string[];
    getViewportsInfo: () => Array<Types_2.IViewportId>;
    getToolInstance: {
        (toolName: string): any;
    };
    addTool: {
        (toolName: string, toolConfiguration?: ToolConfiguration): void;
    };
    addToolInstance: {
        (ttoolName: string, parentClassName: string, configuration?: any): void;
    };
    addViewport: {
        (viewportId: string, renderingEngineId?: string): void;
    };
    removeViewports: {
        (renderingEngineId: string, viewportId?: string): void;
    };
    setToolActive: {
        (toolName: string, toolBindingsOption?: SetToolBindingsType): void;
    };
    setToolPassive: {
        (toolName: string): void;
    };
    setToolEnabled: {
        (toolName: string): void;
    };
    setToolDisabled: {
        (toolName: string): void;
    };
    getToolOptions: {
        (toolName: string): ToolOptionsType;
    };
    getActivePrimaryMouseButtonTool: {
        (): undefined | string;
    };
    setViewportsCursorByToolName: {
        (toolName: string, strategyName?: string): void;
    };
    setToolConfiguration: {
        (toolName: string, configuration: ToolConfiguration, overwrite?: boolean): void;
    };
    getToolConfiguration: {
        (toolName: string, configurationPath: string): any;
    };
    getDefaultMousePrimary: {
        (): MouseBindings;
    };
    clone: {
        (newToolGroupId: string, fnToolFilter: (toolName: string) => boolean): IToolGroup;
    };
}

declare type ITouchPoints = IPoints & {
    touch: {
        identifier: string;
        radiusX: number;
        radiusY: number;
        force: number;
        rotationAngle: number;
    };
};

/**
 * Interface for Stack Viewport
 */
declare interface IVideoViewport extends IViewport {
    /**
     * Resizes the viewport - only used in CPU fallback for StackViewport. The
     * GPU resizing happens inside the RenderingEngine.
     */
    resize: () => void;
    /**
     * Sets the properties for the viewport on the default actor.
     */
    setProperties(props: VideoViewportProperties, suppressEvents?: boolean): void;
    /**
     * Retrieve the viewport properties
     */
    getProperties: () => VideoViewportProperties;

    setVideoURL: (url: string) => void;

    play: () => void;

    pause: () => void;
    /**
     * Reset the viewport properties to the default values
     */
    resetProperties(): void;
    /**
     * Centers Pan and resets the zoom for stack viewport.
     */
    resetCamera(resetPan?: boolean, resetZoom?: boolean): boolean;
}

/**
 * Viewport interface for cornerstone viewports
 */
declare interface IViewport {
    /** unique identifier of the viewport */
    id: string;
    /** renderingEngineId the viewport belongs to */
    renderingEngineId: string;
    /** viewport type, can be ORTHOGRAPHIC or STACK for now */
    type: ViewportType;
    /** canvas associated to the viewport */
    canvas: HTMLCanvasElement;
    /** public DOM element associated to the viewport */
    element: HTMLDivElement;
    /** sx of the viewport on the offscreen canvas (if rendering using GPU) */
    sx: number;
    /** sy of the viewport on the offscreen canvas (if rendering using GPU) */
    sy: number;
    /** width of the viewport on the offscreen canvas (if rendering using GPU) */
    sWidth: number;
    /** height of the viewport on the offscreen canvas (if rendering using GPU) */
    sHeight: number;
    /** actors rendered in the viewport*/
    _actors: Map<string, any>;
    /** viewport default options including the axis, and background color  */
    defaultOptions: any;
    /** viewport options */
    options: ViewportInputOptions;
    /** Suppress events */
    suppressEvents: boolean;
    /** if the viewport has been disabled */
    isDisabled: boolean;
    /** The rendering state of this viewport */
    viewportStatus: ViewportStatus;
    /** the rotation applied to the view */
    getRotation: () => number;
    /** frameOfReferenceUID the viewport's default actor is rendering */
    getFrameOfReferenceUID: () => string;
    /** method to convert canvas to world coordinates */
    canvasToWorld: (canvasPos: Point2) => Point3;
    /** method to convert world to canvas coordinates */
    worldToCanvas: (worldPos: Point3) => Point2;
    /** get the first actor */
    getDefaultActor(): ActorEntry;
    /** returns all the actor entires for a viewport which is an object containing actor and its uid */
    getActors(): Array<ActorEntry>;
    /** returns specific actor by its uid */
    getActor(actorUID: string): ActorEntry;
    /** returns specific actor uid by array index */
    getActorUIDByIndex(index: number): string;
    /** returns specific actor by array index */
    getActorByIndex(index: number): ActorEntry;
    /** set and overwrite actors in a viewport */
    setActors(actors: Array<ActorEntry>): void;
    /** add actors to the list of actors */
    addActors(actors: Array<ActorEntry>): void;
    /** add one actor */
    addActor(actorEntry: ActorEntry): void;
    /** remove all actors from the viewport */
    removeAllActors(): void;
    /** remove array of uids */
    removeActors(actorUIDs: Array<string>): void;
    /** returns the renderingEngine instance the viewport belongs to */
    getRenderingEngine(): any;
    /** returns the vtkRenderer (for GPU rendering) of the viewport */
    getRenderer(): void;
    /** triggers render for all actors in the viewport */
    render(): void;
    /** set options for the viewport */
    setOptions(options: ViewportInputOptions, immediate: boolean): void;
    /** set displayArea for the viewport */
    setDisplayArea(
    displayArea: DisplayArea,
    callResetCamera?: boolean,
    suppressEvents?: boolean
    );
    /** returns the displayArea */
    getDisplayArea(): DisplayArea | undefined;
    /** reset camera and options*/
    reset(immediate: boolean): void;
    /** returns the canvas */
    getCanvas(): HTMLCanvasElement;
    /** returns camera object */
    getCamera(): ICamera;
    /** Sets the rendered state to rendered if the render actually showed image data */
    setRendered(): void;
    /** returns the parallel zoom relative to the default (eg returns 1 after reset) */
    getZoom(): number;
    /** Sets the relative zoom - set to 1 to reset it */
    setZoom(zoom: number, storeAsInitialCamera?: boolean);
    /** Gets the canvas pan value */
    getPan(): Point2;
    /** Sets the canvas pan value */
    setPan(pan: Point2, storeAsInitialCamera?: boolean);
    /** sets the camera */
    setCamera(cameraInterface: ICamera, storeAsInitialCamera?: boolean): void;
    /** whether the viewport has custom rendering */
    customRenderViewportToCanvas: () => unknown;
    _getCorners(bounds: Array<number>): Array<number>[];
    updateRenderingPipeline: () => void;
}

/**
 * Interface to uniquely define a viewport in cornerstone. Note: viewportIds
 * can be shared between different rendering engines, but having a renderingEngineId
 * and a viewportId is required to uniquely define a viewport.
 */
declare interface IViewportId {
    renderingEngineId: string;
    viewportId: string;
}

/**
 * Cornerstone ImageVolume interface.
 */
declare interface IVolume {
    /** unique identifier for the volume in the cache */
    volumeId: string;
    /** volume metadata */
    metadata: Metadata;
    /** volume dimensions */
    dimensions: Point3;
    /** volume spacing */
    spacing: Point3;
    /** volume origin */
    origin: Point3;
    /** volume direction */
    direction: Mat3;
    /** volume scalarData */
    scalarData: VolumeScalarData | Array<VolumeScalarData>;
    /** volume size in bytes */
    sizeInBytes?: number;
    /** volume image data as vtkImageData */
    imageData?: vtkImageData;
    /** referencedVolumeId if volume is derived from another volume */
    referencedVolumeId?: string;
    /** volume scaling metadata */
    scaling?: {
        PT?: {
            // @TODO: Do these values exist?
            SUVlbmFactor?: number;
            SUVbsaFactor?: number;
            // accessed in ProbeTool
            suvbwToSuvlbm?: number;
            suvbwToSuvbsa?: number;
        };
    };
}

/**
 * VolumeInput that can be used to add a volume to a viewport. It includes
 * mandatory `volumeId` but other options such as `visibility`, `blendMode`,
 * `slabThickness` and `callback` can also be provided
 */
declare interface IVolumeInput {
    /** Volume ID of the volume in the cache */
    volumeId: string;
    // actorUID for segmentations, since two segmentations with the same volumeId
    // can have different representations
    actorUID?: string;
    /** Visibility of the volume - by default it is true */
    visibility?: boolean;
    /** Callback to be called when the volume is added to the viewport */
    callback?: VolumeInputCallback;
    /** Blend mode of the volume - by default it is `additive` */
    blendMode?: BlendModes;
    /** Slab thickness of the volume - by default it is 0.05*/
    slabThickness?: number;
}

/**
 * VolumeLoadObject interface which any volumeLoader should return
 */
declare interface IVolumeLoadObject {
    /** promise that resolves to an ImageVolume */
    promise: Promise<ImageVolume>;
    /** optional cancel function for loading*/
    cancelFn?: () => void;
    /** optional decache function */
    decache?: () => void;
}

/**
 * Interface for the Volume Viewport
 */
declare interface IVolumeViewport extends IViewport {
    useCPURendering: boolean;
    getFrameOfReferenceUID: () => string;

    /**
     * Retrieve the viewport default properties
     * If volumeId is given, we retrieve the default properties of a volumeId if it exists
     * If not given,we return the global properties of the viewport
     * default viewport properties including voi, invert, interpolation type, colormap
     */
    getDefaultProperties: (volumeId?: string) => VolumeViewportProperties;
    /**
     * Retrieve the viewport properties
     */
    getProperties: (volumeId?: string) => VolumeViewportProperties;
    /**
     * canvasToWorld Returns the world coordinates of the given `canvasPos`
     * projected onto the plane defined by the `Viewport`'s `vtkCamera`'s focal point
     * and the direction of projection.
     */
    canvasToWorld: (canvasPos: Point2) => Point3;
    /**
     * Returns the canvas coordinates of the given `worldPos`
     * projected onto the `Viewport`'s `canvas`.
     */
    worldToCanvas: (worldPos: Point3) => Point2;
    /**
     * Returns the list of image Ids for the current viewport
     */
    getImageIds: (volumeId?: string) => string[];
    /**
     * Uses viewport camera and volume actor to decide if the viewport
     * is looking at the volume in the direction of acquisition (imageIds).
     * If so, it uses the origin and focalPoint to calculate the slice index.
     */
    getCurrentImageIdIndex: () => number;

    /**
     * Checks if the viewport has a volume actor with the given volumeId
     */
    hasVolumeId: (volumeId: string) => boolean;

    /**
     * if the volume viewport has imageURI (no loader schema)
     * in one of its volume actors
     */
    hasImageURI: (imageURI: string) => boolean;

    /**
     * Uses viewport camera and volume actor to decide if the viewport
     * is looking at the volume in the direction of acquisition (imageIds).
     * If so, it uses the origin and focalPoint to find which imageId is
     * currently being viewed.
     */
    getCurrentImageId: () => string;
    /**
     * Sets the default properties for the viewport. If no volumeId is provided
     * it applies the properties to the default volume actor (first volume)
     */
    setDefaultProperties(
    ViewportProperties: VolumeViewportProperties,
    volumeId?: string
    ): void;
    /**
     * Remove the global default properties of the viewport or remove default properties for a volumeId if specified
     * If volumeId is given, we remove the default properties only for this volumeId, if not
     * the global default properties will be removed
     */
    clearDefaultProperties(volumeId?: string): void;
    /**
     * Sets the properties for the viewport. If no volumeId is provided
     * it applies the properties to the default volume actor (first volume)
     */
    setProperties(
        { voiRange }: VolumeViewportProperties,
    volumeId?: string,
    suppressEvents?: boolean
    ): void;
    /**
     * Reset the viewport properties to the default values
     */
    resetProperties(volumeId: string): void;
    /**
     * Creates volume actors for all volumes defined in the `volumeInputArray`.
     * For each entry, if a `callback` is supplied, it will be called with the new volume actor as input.
     * For each entry, if a `blendMode` and/or `slabThickness` is defined, this will be set on the actor's
     * `VolumeMapper`.
     */
    setVolumes(
    volumeInputArray: Array<IVolumeInput>,
    immediate?: boolean,
    suppressEvents?: boolean
    ): Promise<void>;
    /**
     * Creates and adds volume actors for all volumes defined in the `volumeInputArray`.
     * For each entry, if a `callback` is supplied, it will be called with the new volume actor as input.
     */
    addVolumes(
    volumeInputArray: Array<IVolumeInput>,
    immediate?: boolean,
    suppressEvents?: boolean
    ): Promise<void>;
    /**
     * It removes the volume actor from the Viewport. If the volume actor is not in
     * the viewport, it does nothing.
     */
    removeVolumeActors(actorUIDs: Array<string>, immediate?: boolean): void;

    /**
     * Given a point in world coordinates, return the intensity at that point
     */
    getIntensityFromWorld(point: Point3): number;
    /**
     * getBounds gets the visible bounds of the viewport
     */
    getBounds(): any;
    /**
     * Flip the viewport along the desired axis
     */
    flip(flipDirection: FlipDirection): void;
    /**
     * Reset the camera for the volume viewport
     */
    resetCamera(
    resetPan?: boolean,
    resetZoom?: boolean,
    resetToCenter?: boolean
    ): boolean;
    /**
     * Sets the blendMode for actors of the viewport.
     */
    setBlendMode(
    blendMode: BlendModes,
    filterActorUIDs?: Array<string>,
    immediate?: boolean
    ): void;
    /**
     * Sets the slab thickness for actors of the viewport.
     */
    setSlabThickness(
    slabThickness: number,
    filterActorUIDs?: Array<string>
    ): void;
    /**
     * Gets the slab thickness option in the `Viewport`'s `options`.
     */
    getSlabThickness(): number;
    /**
     * Returns the image and its properties that is being shown inside the
     * stack viewport. It returns, the image dimensions, image direction,
     * image scalar data, vtkImageData object, metadata, and scaling (e.g., PET suvbw)
     * Note: since the volume viewport supports fusion, to get the
     * image data for a specific volume, use the optional volumeId
     * argument.
     */
    getImageData(volumeId?: string): IImageData | undefined;

    setOrientation(orientation: OrientationAxis): void;
}

declare function jumpToSlice(element: HTMLDivElement, options?: JumpToSliceOptions): Promise<void>;

declare type JumpToSliceOptions = {
    imageIndex: number;
    debounceLoading?: boolean;
    volumeId?: string;
};

declare function jumpToWorld(viewport: Types_2.IVolumeViewport, jumpWorld: Types_2.Point3): true | undefined;

declare enum KeyboardBindings {
    Shift = 16,
    Ctrl = 17,
    Alt = 18,
    Meta = 91,
    ShiftCtrl = 1617,
    ShiftAlt = 1618,
    ShiftMeta = 1691,
    CtrlAlt = 1718,
    CtrlMeta = 1791,
    AltMeta = 1891
}

declare type KeyDownEventDetail = {
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
    key: string;
    keyCode: number;
};

declare type KeyDownEventType = Types_2.CustomEventType<KeyDownEventDetail>;

declare type KeyUpEventDetail = KeyDownEventDetail;

declare type KeyUpEventType = Types_2.CustomEventType<KeyUpEventDetail>;

declare type LabelmapConfig = {
    renderOutline?: boolean;
    outlineWidthActive?: number;
    outlineWidthInactive?: number;
    renderFill?: boolean;
    renderFillInactive?: boolean;
    fillAlpha?: number;
    fillAlphaInactive?: number;
    outlineOpacity?: number;
    outlineOpacityInactive?: number;
};

declare type LabelmapRenderingConfig = {
    cfun?: vtkColorTransferFunction;
    ofun?: vtkPiecewiseFunction;
};

declare type LabelmapSegmentationData = {
    volumeId: string;
    referencedVolumeId?: string;
};

declare namespace LabelmapTypes {
    export {
        LabelmapConfig,
        LabelmapRenderingConfig,
        LabelmapSegmentationData
    }
}

declare interface LengthAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats: {
            [targetId: string]: {
                length: number;
                unit: string;
            };
        };
    };
}

export declare class LengthTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => LengthAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: LengthAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: LengthAnnotation) => void;
    handleSelectedCallback(evt: EventTypes_2.InteractionEventType, annotation: LengthAnnotation, handle: ToolHandle): void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: HTMLDivElement) => void;
    _deactivateModify: (element: HTMLDivElement) => void;
    _activateDraw: (element: HTMLDivElement) => void;
    _deactivateDraw: (element: HTMLDivElement) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateLength(pos1: any, pos2: any): number;
    _calculateCachedStats(annotation: any, renderingEngine: any, enabledElement: any): any;
    _isInsideVolume(index1: any, index2: any, dimensions: any): boolean;
}

declare namespace lineSegment {
    export {
        distanceToPoint,
        distanceToPointSquared,
        intersectLine
    }
}

declare namespace locking {
    export {
        setAnnotationLocked,
        getAnnotationsLocked,
        getAnnotationsLockedCount,
        unlockAllAnnotations,
        isAnnotationLocked,
        checkAndDefineIsLockedProperty
    }
}

export declare class MagnifyTool extends BaseTool {
    static toolName: any;
    _bounds: any;
    editData: {
        referencedImageId: string;
        viewportIdsToRender: string[];
        enabledElement: Types_2.IEnabledElement;
        renderingEngine: Types_2.IRenderingEngine;
        currentPoints: IPoints;
    } | null;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    _getReferencedImageId(viewport: Types_2.IStackViewport | Types_2.IVolumeViewport): string;
    preMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    preTouchStartCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _createMagnificationViewport: () => void;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragEndCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _activateDraw: (element: HTMLDivElement) => void;
    _deactivateDraw: (element: HTMLDivElement) => void;
}

declare type MagnifyViewportInfo = {
    magnifyViewportId?: string;
    sourceEnabledElement: Types_2.IEnabledElement;
    position: Types_2.Point2;
    radius: number;
    zoomFactor: number;
    autoPan: {
        enabled: boolean;
        padding: number;
        callback: AutoPanCallback;
    };
};

/**
 * This represents a 3x3 matrix of numbers
 */
declare type Mat3 =
| [number, number, number, number, number, number, number, number, number]
| Float32Array;

declare namespace math {
    export {
        vec2,
        ellipse,
        lineSegment,
        rectangle,
        polyline,
        point,
        BasicStatsCalculator
    }
}

/**
 * Metadata for images, More information can be found in the
 * {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.3.html#table_C.7-11c}
 */
declare type Metadata = {
    /** Number of bits allocated for each pixel sample. Each sample shall have the same number of bits allocated */
    BitsAllocated: number;
    /** Number of bits stored for each pixel sample */
    BitsStored: number;
    SamplesPerPixel: number;
    /** Most significant bit for pixel sample data */
    HighBit: number;
    /** Specifies the intended interpretation of the pixel data */
    PhotometricInterpretation: string;
    /** Data representation of the pixel samples. */
    PixelRepresentation: number;
    /** Image Modality */
    Modality: string;
    /** SeriesInstanceUID of the volume */
    SeriesInstanceUID?: string;
    /** The direction cosines of the first row and the first column with respect to the patient */
    ImageOrientationPatient: Array<number>;
    /** Physical distance in the patient between the center of each pixel */
    PixelSpacing: Array<number>;
    /** Uniquely identifies the Frame of Reference for a Series */
    FrameOfReferenceUID: string;
    /** Number of columns in the image. */
    Columns: number;
    /** Number of rows in the image. */
    Rows: number;
    /** Window Level/Center for the image */
    voiLut: Array<VOI>;
    /** VOILUTFunction for the image which is LINEAR or SAMPLED_SIGMOID */
    VOILUTFunction: string;
};

export declare class MIPJumpToClickTool extends BaseTool {
    static toolName: any;
    _bounds: any;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    mouseClickCallback(evt: any): void;
}

declare type Modes = '' | 'Active' | 'Passive' | 'Enabled';

declare enum MouseBindings {
    Primary = 1,
    Secondary = 2,
    Primary_And_Secondary = 3,
    Auxiliary = 4,
    Primary_And_Auxiliary = 5,
    Secondary_And_Auxiliary = 6,
    Primary_And_Secondary_And_Auxiliary = 7,
    Fourth_Button = 8,
    Fifth_Button = 16
}

declare type MouseClickEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};

declare type MouseClickEventType = Types_2.CustomEventType<MouseClickEventDetail>;

declare class MouseCursor {
    private name;
    private fallback;
    constructor(name: string, fallback?: MouseCursor | undefined);
    getName(): string;
    addFallbackStyleProperty(style: string): string;
    getStyleProperty(): string;
    static getDefinedCursor(name: string): MouseCursor | undefined;
    static setDefinedCursor(name: string, cursor: MouseCursor): boolean;
}

declare type MouseCustomEventDetail = NormalizedInteractionEventDetail & {
    event: Record<string, unknown> | MouseEvent;
};

declare type MouseDoubleClickEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail;

declare type MouseDoubleClickEventType = Types_2.CustomEventType<MouseDoubleClickEventDetail>;

declare type MouseDownActivateEventDetail = NormalizedInteractionEventDetail & MousePointsDetail & MouseCustomEventDetail & {
    mouseButton: number;
};

declare type MouseDownActivateEventType = Types_2.CustomEventType<MouseDownActivateEventDetail>;

declare type MouseDownEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};

declare type MouseDownEventType = Types_2.CustomEventType<MouseDownEventDetail>;

declare type MouseDragEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};

declare type MouseDragEventType = Types_2.CustomEventType<MouseDragEventDetail>;

declare type MouseMoveEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & {
    currentPoints: IPoints;
};

declare type MouseMoveEventType = Types_2.CustomEventType<MouseMoveEventDetail>;

declare type MousePointsDetail = {
    startPoints: IPoints;
    lastPoints: IPoints;
    currentPoints: IPoints;
    deltaPoints: IPoints;
};

declare type MouseUpEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};

declare type MouseUpEventType = Types_2.CustomEventType<MouseUpEventDetail>;

declare type MouseWheelEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & {
    detail: Record<string, any>;
    wheel: {
        spinX: number;
        spinY: number;
        pixelX: number;
        pixelY: number;
        direction: number;
    };
    points: IPoints;
};

declare type MouseWheelEventType = Types_2.CustomEventType<MouseWheelEventDetail>;

declare type NormalizedInteractionEventDetail = {
    eventName: string;
    renderingEngineId: string;
    viewportId: string;
    camera: Record<string, unknown>;
    element: HTMLDivElement;
};

declare type NormalizedMouseEventType = Types_2.CustomEventType<MouseCustomEventDetail>;

declare type NormalizedTouchEventType = Types_2.CustomEventType<TouchCustomEventDetail>;

declare type OpacityMapping = {
    /** value to map to opacity */
    value: number;
    /** opacity value */
    opacity: number;
};

declare type Options = {
    numSlicesToProject?: number;
};

declare namespace orientation_2 {
    export {
        getOrientationStringLPS,
        invertOrientationStringLPS
    }
}

declare enum OrientationAxis {
    AXIAL = 'axial',
    CORONAL = 'coronal',
    SAGITTAL = 'sagittal',
    ACQUISITION = 'acquisition',
}

export declare class OrientationMarkerTool extends BaseTool {
    static toolName: any;
    static CUBE: number;
    static AXIS: number;
    static VTPFILE: number;
    orientationMarkers: any;
    polyDataURL: any;
    static OVERLAY_MARKER_TYPES: {
        ANNOTATED_CUBE: number;
        AXES: number;
        CUSTOM: number;
    };
    configuration_invalidated: boolean;
    constructor(toolProps?: {}, defaultToolProps?: {
        configuration: {
            orientationWidget: {
                enabled: boolean;
                viewportCorner: Corners;
                viewportSize: number;
                minPixelSize: number;
                maxPixelSize: number;
            };
            overlayMarkerType: number;
            overlayConfiguration: {
                [x: number]: {
                    faceProperties: {
                        xPlus: {
                            text: string;
                            faceColor: string;
                            faceRotation: number;
                        };
                        xMinus: {
                            text: string;
                            faceColor: string;
                            faceRotation: number;
                        };
                        yPlus: {
                            text: string;
                            faceColor: string;
                            fontColor: string;
                            faceRotation: number;
                        };
                        yMinus: {
                            text: string;
                            faceColor: string;
                            fontColor: string;
                        };
                        zPlus: {
                            text: string;
                        };
                        zMinus: {
                            text: string;
                        };
                    };
                    defaultStyle: {
                        fontStyle: string;
                        fontFamily: string;
                        fontColor: string;
                        fontSizeScale: (res: any) => number;
                        faceColor: string;
                        edgeThickness: number;
                        edgeColor: string;
                        resolution: number;
                    };
                    polyDataURL?: undefined;
                } | {
                    faceProperties?: undefined;
                    defaultStyle?: undefined;
                    polyDataURL?: undefined;
                } | {
                    polyDataURL: string;
                    faceProperties?: undefined;
                    defaultStyle?: undefined;
                };
            };
        };
    });
    onSetToolEnabled: () => void;
    onSetToolActive: () => void;
    onSetToolDisabled: () => void;
    private cleanUpData;
    private initViewports;
    addAxisActorInViewport(viewport: any): Promise<void>;
    private createCustomActor;
    private createAnnotationCube;
    createAnnotatedCubeActor(): Promise<vtkAnnotatedCubeActor>;
}

/**
 * - `viewUp` - An array of three floating point numbers describing a vector
 *  that represents the up direction for the view.
 * - `viewPlaneNormal` - The direction of the projection
 *
 * see [Axial vs Sagittal vs Coronal](https://faculty.washington.edu/chudler/slice.html)
 * see {@link https://kitware.github.io/vtk-js/api/Rendering_Core_Camera.html | VTK.js: Rendering_Core_Camera}
 *
 * @example
 *
 * ```javascript
 * renderingEngine.setViewports([
 *  {
 *    viewportId: 'a-viewport-uid',
 *    type: ViewportType.ORTHOGRAPHIC,
 *    element: document.querySelector('div'),
 *    defaultOptions: {
 *      orientation: {
 *       viewUp: [0, 0, 1],
 *      viewPlaneNormal: [1, 0, 0],
 *     },
 *      background: [1, 0, 0],
 *    },
 *  }]);
 * ```
 */
declare type OrientationVectors = {
    /** Slice Normal for the viewport - the normal that points in the opposite direction of the slice normal out of screen and is negative of direction of projection */
    viewPlaneNormal: Point3;
    /** viewUp direction for the viewport - the vector that points from bottom to top of the viewport */
    viewUp: Point3;
};

export declare class OverlayGridTool extends AnnotationDisplayTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    onSetToolEnabled: () => void;
    onSetToolActive: () => void;
    _init: () => void;
    calculateImageIdPointSets: (imageId: string) => {
        pointSet1: Types_2.Point3[];
        pointSet2: Types_2.Point3[];
    };
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    private initializeViewportData;
    private isPerpendicular;
    private isParallel;
    private getImageIdNormal;
}

export declare class PaintFillTool extends BaseTool {
    static toolName: any;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    preMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    private getFramesModified;
    private generateHelpers;
    private getFixedDimension;
    private generateFloodFillGetter;
    private generateGetScalarDataPositionFromPlane;
}

export declare class PanTool extends BaseTool {
    static toolName: any;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    touchDragCallback(evt: EventTypes_2.InteractionEventType): void;
    mouseDragCallback(evt: EventTypes_2.InteractionEventType): void;
    _dragCallback(evt: EventTypes_2.InteractionEventType): void;
}

declare type PixelDataTypedArray =
| Float32Array
| Int16Array
| Uint16Array
| Uint8Array
| Int8Array
| Uint8ClampedArray;

declare namespace planar {
    export {
        _default as default,
        filterAnnotationsWithinSlice,
        getWorldWidthAndHeightFromCorners,
        filterAnnotationsForDisplay,
        getPointInLineOfSightWithCriteria
    }
}

declare type PlanarBoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};

declare interface PlanarFreehandROIAnnotation extends Annotation {
    metadata: {
        cameraPosition?: Types_2.Point3;
        cameraFocalPoint?: Types_2.Point3;
        viewPlaneNormal?: Types_2.Point3;
        viewUp?: Types_2.Point3;
        annotationUID?: string;
        FrameOfReferenceUID: string;
        referencedImageId?: string;
        toolName: string;
    };
    data: {
        polyline: Types_2.Point3[];
        label?: string;
        isOpenContour?: boolean;
        isOpenUShapeContour?: boolean;
        openUShapeContourVectorToPeak?: Types_2.Point3[];
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        cachedStats?: ROICachedStats;
    };
}

declare type PlanarFreehandROICommonData = {
    annotation: PlanarFreehandROIAnnotation;
    viewportIdsToRender: string[];
    spacing: Types_2.Point2;
    xDir: Types_2.Point3;
    yDir: Types_2.Point3;
    movingTextBox?: boolean;
};

export declare class PlanarFreehandROITool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    private commonData?;
    isDrawing: boolean;
    isEditingClosed: boolean;
    isEditingOpen: boolean;
    private activateDraw;
    private activateClosedContourEdit;
    private activateOpenContourEdit;
    private activateOpenContourEndEdit;
    private cancelDrawing;
    private cancelClosedContourEdit;
    private cancelOpenContourEdit;
    private renderContour;
    private renderContourBeingDrawn;
    private renderClosedContourBeingEdited;
    private renderOpenContourBeingEdited;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => PlanarFreehandROIAnnotation;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: PlanarFreehandROIAnnotation, handle: ToolHandle) => void;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: PlanarFreehandROIAnnotation) => void;
    isPointNearTool: (element: HTMLDivElement, annotation: PlanarFreehandROIAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    cancel: (element: HTMLDivElement) => void;
    triggerAnnotationModified: (annotation: PlanarFreehandROIAnnotation, enabledElement: Types_2.IEnabledElement) => void;
    triggerAnnotationCompleted: (annotation: PlanarFreehandROIAnnotation) => void;
    filterInteractableAnnotationsForElement(element: HTMLDivElement, annotations: Annotations): Annotations | undefined;
    private filterAnnotationsWithinSlice;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats: (annotation: any, viewport: any, renderingEngine: any, enabledElement: any) => any;
    _renderStats: (annotation: any, viewport: any, enabledElement: any, svgDrawingHelper: any) => void;
}

declare namespace planarFreehandROITool {
    export {
        _default_2 as default,
        interpolateAnnotation
    }
}

export declare class PlanarRotateTool extends BaseTool {
    static toolName: any;
    touchDragCallback: (evt: EventTypes_2.MouseDragEventType) => void;
    mouseDragCallback: (evt: EventTypes_2.MouseDragEventType) => void;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    _dragCallback(evt: EventTypes_2.MouseDragEventType): void;
}

/**
 * Plane equation Ax+By+Cz=D, plane is defined by [A, B, C, D]
 */
declare type Plane = [number, number, number, number];

declare function playClip(element: HTMLDivElement, playClipOptions: CINETypes.PlayClipOptions): void;

declare type PlayClipOptions = {
    framesPerSecond?: number;
    frameTimeVector?: number[];
    reverse?: boolean;
    loop?: boolean;
    dynamicCineEnabled?: boolean;
    frameTimeVectorSpeedMultiplier?: number;
    waitForRendered?: number;
};

declare type Point = Types_2.Point2 | Types_2.Point3;

declare namespace point {
    export {
        distanceToPoint_3 as distanceToPoint
    }
}

/**
 * This duplicates the typing established in gl-matrix for a vec2
 */
declare type Point2 = [number, number];

/**
 * This duplicates the typing established in gl-matrix for a vec3
 */
declare type Point3 = [number, number, number];

/**
 * This represents a 4-vector or RGBA value.
 */
declare type Point4 = [number, number, number, number];

declare const pointCanProjectOnLine: (p: Types_2.Point2, p1: Types_2.Point2, p2: Types_2.Point2, proximity: number) => boolean;

declare function pointInEllipse(ellipse: Ellipse, pointLPS: Types_2.Point3): boolean;

declare type PointInShape = {
    value: number;
    index: number;
    pointIJK: Types_2.Point3;
    pointLPS: Types_2.Point3;
};

declare type PointInShapeCallback = ({ value, index, pointIJK, pointLPS, }: {
    value: number;
    index: number;
    pointIJK: Types_2.Point3;
    pointLPS: Types_2.Point3;
}) => void;

declare function pointInShapeCallback(imageData: vtkImageData | Types_2.CPUImageData, pointInShapeFn: ShapeFnCriteria, callback?: PointInShapeCallback, boundsIJK?: BoundsIJK): Array<PointInShape>;

declare function pointInSurroundingSphereCallback(imageData: vtkImageData, circlePoints: [Types_2.Point3, Types_2.Point3], callback: PointInShapeCallback, viewport?: Types_2.IVolumeViewport): void;

declare const pointsAreWithinCloseContourProximity: (p1: Types_2.Point2, p2: Types_2.Point2, closeContourProximity: number) => boolean;

declare function pointToString(point: any, decimals?: number): string;

declare namespace polyDataUtils {
    export {
        getPoint,
        getPolyDataPointIndexes,
        getPolyDataPoints
    }
}

declare namespace polyline {
    export {
        getFirstIntersectionWithPolyline,
        getClosestIntersectionWithPolyline,
        getSubPixelSpacingAndXYDirections,
        pointsAreWithinCloseContourProximity,
        addCanvasPointsToArray,
        pointCanProjectOnLine,
        calculateAreaOfPoints
    }
}

/**
 * START_NEW_IMAGE
 */
declare type PreStackNewImageEvent = CustomEvent_2<PreStackNewImageEventDetail>;

/**
 * PRE_STACK_NEW_IMAGE Event's data
 */
declare type PreStackNewImageEventDetail = {
    /** the image imageId */
    imageId: string;
    /** the index of imageId in the stack */
    imageIdIndex: number;
    /** unique id for the viewport */
    viewportId: string;
    /** unique id for the renderingEngine */
    renderingEngineId: string;
};

declare interface ProbeAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
        };
        cachedStats: {
            [targetId: string]: {
                Modality: string;
                index: Types_2.Point3;
                value: number;
            };
        };
        label: string;
    };
}

export declare class ProbeTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        newAnnotation?: boolean;
    } | null;
    eventDispatchDetail: {
        viewportId: string;
        renderingEngineId: string;
    };
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    isPointNearTool(): boolean;
    toolSelectedCallback(): void;
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => ProbeAnnotation;
    getHandleNearImagePoint(element: HTMLDivElement, annotation: ProbeAnnotation, canvasCoords: Types_2.Point2, proximity: number): ToolHandle | undefined;
    handleSelectedCallback(evt: EventTypes_2.InteractionEventType, annotation: ProbeAnnotation): void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragCallback: (evt: any) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats(annotation: any, renderingEngine: any, enabledElement: any): any;
}

declare type Properties = 'color' | 'lineWidth' | 'lineDash' | 'textBoxFontFamily' | 'textBoxFontSize' | 'textBoxColor' | 'textBoxBackground' | 'textBoxLinkLineWidth' | 'textBoxLinkLineDash';

declare type PTScaling = {
    /** suv body weight to suv lean body mass */
    suvbwToSuvlbm?: number;
    /** suv body weight to suv body surface area */
    suvbwToSuvbsa?: number;
    /** SUV body weight */
    suvbw?: number;
    /** SUV lean body mass */
    suvlbm?: number;
    /** SUV body surface area */
    suvbsa?: number;
};

declare type PublicContourSetData = ContourSetData;

declare type PublicSurfaceData = {
    id: string;
    data: SurfaceData;
    frameOfReferenceUID: string;
    color?: Point3;
};

declare type PublicToolProps = SharedToolProp & {
    name?: string;
};

/**
 * Public Interface for viewport input to get enabled/disabled or set
 */
declare type PublicViewportInput = {
    /** HTML element in the DOM */
    element: HTMLDivElement;
    /** unique id for the viewport in the renderingEngine */
    viewportId: string;
    /** type of the viewport */
    type: ViewportType;
    /** options for the viewport */
    defaultOptions?: ViewportInputOptions;
};

declare namespace rectangle {
    export {
        distanceToPoint_2 as distanceToPoint
    }
}

declare interface RectangleROIAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
            textBox: {
                hasMoved: boolean;
                worldPosition: Types_2.Point3;
                worldBoundingBox: {
                    topLeft: Types_2.Point3;
                    topRight: Types_2.Point3;
                    bottomLeft: Types_2.Point3;
                    bottomRight: Types_2.Point3;
                };
            };
        };
        label: string;
        cachedStats?: ROICachedStats | {
            projectionPoints?: Types_2.Point3[];
            projectionPointsImageIds?: string[];
        };
    };
}

declare interface RectangleROIStartEndThresholdAnnotation extends Annotation {
    metadata: {
        cameraPosition?: Types_2.Point3;
        cameraFocalPoint?: Types_2.Point3;
        viewPlaneNormal?: Types_2.Point3;
        viewUp?: Types_2.Point3;
        annotationUID?: string;
        FrameOfReferenceUID: string;
        referencedImageId?: string;
        toolName: string;
        enabledElement: any;
        volumeId: string;
        spacingInNormal: number;
    };
    data: {
        label: string;
        startSlice: number;
        endSlice: number;
        cachedStats: {
            projectionPoints: Types_2.Point3[][];
            projectionPointsImageIds: string[];
        };
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
        };
    };
}

export declare class RectangleROIStartEndThresholdTool extends RectangleROITool {
    static toolName: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => {
        highlighted: boolean;
        invalidated: boolean;
        metadata: {
            viewPlaneNormal: Types_2.Point3;
            enabledElement: Types_2.IEnabledElement;
            viewUp: Types_2.Point3;
            FrameOfReferenceUID: string;
            referencedImageId: any;
            toolName: string;
            volumeId: any;
            spacingInNormal: number;
        };
        data: {
            label: string;
            startSlice: number;
            endSlice: number;
            cachedStats: {
                projectionPoints: any[];
                projectionPointsImageIds: any[];
            };
            handles: {
                textBox: {
                    hasMoved: boolean;
                    worldPosition: any;
                    worldBoundingBox: any;
                };
                points: Types_2.Point3[];
                activeHandleIndex: any;
            };
            labelmapUID: any;
        };
    };
    _computeProjectionPoints(annotation: RectangleROIStartEndThresholdAnnotation, imageVolume: Types_2.IImageVolume): void;
    _calculateCachedStatsTool(annotation: any, enabledElement: any): any;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _getEndSliceIndex(imageVolume: Types_2.IImageVolume, worldPos: Types_2.Point3, spacingInNormal: number, viewPlaneNormal: Types_2.Point3): number | undefined;
}

declare interface RectangleROIThresholdAnnotation extends Annotation {
    metadata: {
        cameraPosition?: Types_2.Point3;
        cameraFocalPoint?: Types_2.Point3;
        viewPlaneNormal?: Types_2.Point3;
        viewUp?: Types_2.Point3;
        annotationUID?: string;
        FrameOfReferenceUID: string;
        referencedImageId?: string;
        toolName: string;
        enabledElement: Types_2.IEnabledElement;
        volumeId: string;
    };
    data: {
        label: string;
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
        };
    };
}

export declare class RectangleROIThresholdTool extends RectangleROITool {
    static toolName: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => {
        highlighted: boolean;
        invalidated: boolean;
        metadata: {
            viewPlaneNormal: Types_2.Point3;
            enabledElement: Types_2.IEnabledElement;
            viewUp: Types_2.Point3;
            FrameOfReferenceUID: string;
            referencedImageId: any;
            toolName: string;
            volumeId: any;
        };
        data: {
            label: string;
            handles: {
                textBox: {
                    hasMoved: boolean;
                    worldPosition: any;
                    worldBoundingBox: any;
                };
                points: Types_2.Point3[];
                activeHandleIndex: any;
            };
            segmentationId: any;
        };
    };
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}

declare function rectangleROIThresholdVolumeByRange(annotationUIDs: string[], segmentationVolume: Types_2.IImageVolume, thresholdVolumeInformation: ThresholdInformation[], options: ThresholdOptions): Types_2.IImageVolume;

export declare class RectangleROITool extends AnnotationTool {
    static toolName: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => RectangleROIAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: RectangleROIAnnotation, canvasCoords: Types_2.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: RectangleROIAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes_2.InteractionEventType, annotation: RectangleROIAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _getRectangleImageCoordinates: (points: Array<Types_2.Point2>) => {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    _calculateCachedStats: (annotation: any, viewPlaneNormal: any, viewUp: any, renderingEngine: any, enabledElement: any) => any;
    _isInsideVolume: (index1: any, index2: any, dimensions: any) => boolean;
}

declare namespace rectangleROITool {
    export {
        getBoundsIJKFromRectangleAnnotations
    }
}

export declare class RectangleScissorsTool extends BaseTool {
    static toolName: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        segmentationId: string;
        segmentation: any;
        segmentIndex: number;
        segmentsLocked: number[];
        segmentColor: [number, number, number, number];
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    preMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}

declare interface ReferenceCursor extends Annotation {
    data: {
        handles: {
            points: [Types_2.Point3];
        };
    };
}

export declare class ReferenceCursors extends AnnotationDisplayTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    _elementWithCursor: null | HTMLDivElement;
    _currentCursorWorldPosition: null | Types_2.Point3;
    _currentCanvasPosition: null | Types_2.Point2;
    _disableCursorEnabled: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    mouseMoveCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    onSetToolActive(): void;
    onSetToolDisabled(): void;
    createInitialAnnotation: (worldPos: Types_2.Point3, element: HTMLDivElement) => void;
    getActiveAnnotation(element: HTMLDivElement): null | Annotation;
    updateAnnotationPosition(element: HTMLDivElement, annotation: Annotation): void;
    onCameraModified: (evt: any) => void;
    filterInteractableAnnotationsForElement(element: HTMLDivElement, annotations: Annotations): Annotations;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    updateViewportImage(viewport: Types_2.IStackViewport | Types_2.IVolumeViewport): void;
}

declare interface ReferenceLineAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
        };
    };
}

declare class ReferenceLines extends AnnotationDisplayTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        renderingEngine: any;
        sourceViewport: any;
        annotation: ReferenceLineAnnotation;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    _init: () => void;
    onSetToolEnabled: () => void;
    onCameraModified: (evt: Types_2.EventTypes.CameraModifiedEvent) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    isPerpendicular: (vec1: Types_2.Point3, vec2: Types_2.Point3) => boolean;
    private handleFullDimension;
    intersectInfiniteLines(line1Start: Types_2.Point2, line1End: Types_2.Point2, line2Start: Types_2.Point2, line2End: Types_2.Point2): number[];
    isParallel(vec1: Types_2.Point3, vec2: Types_2.Point3): boolean;
    isInBound(point: number[], dimensions: Types_2.Point3): boolean;
}
export { ReferenceLines }
export { ReferenceLines as ReferenceLinesTool }

declare function registerCursor(toolName: string, iconContent: string, viewBox: {
    x: number;
    y: number;
}): void;

declare function removeAllAnnotations(): void;

declare function removeAnnotation(annotationUID: string): void;

declare function removeColorLUT(colorLUTIndex: number): void;

declare function removeSegmentation(segmentationId: string): void;

declare function removeSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string): void;

declare function removeSegmentationsFromToolGroup(toolGroupId: string, segmentationRepresentationUIDs?: string[] | undefined, immediate?: boolean): void;

export declare function removeTool(ToolClass: any): void;

declare type RepresentationConfig = {
    LABELMAP?: LabelmapConfig;
    CONTOUR?: ContourConfig;
    SURFACE?: any;
};

declare type RepresentationPublicInput = {
    segmentationId: string;
    type: Enums.SegmentationRepresentations;
};

declare function resetAnnotationManager(): void;

declare function resetElementCursor(element: HTMLDivElement): void;

/**
 * RGB color type.
 */
declare type RGB = [number, number, number];

declare interface ROICachedStats {
    [targetId: string]: {
        Modality: string;
        area: number;
        areaUnit: string;
        max: number;
        mean: number;
        stdDev: number;
    };
}

declare function roundNumber(value: string | number, precision?: number): string;

declare interface ScaleOverlayAnnotation extends Annotation {
    data: {
        handles: {
            points: Types_2.Point3[];
        };
        viewportId: string;
    };
}

export declare class ScaleOverlayTool extends AnnotationDisplayTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        renderingEngine: any;
        viewport: any;
        annotation: ScaleOverlayAnnotation;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    _init: () => void;
    onSetToolEnabled: () => void;
    onCameraModified: (evt: Types_2.EventTypes.CameraModifiedEvent) => void;
    renderAnnotation(enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper): boolean;
    _getTextLines(scaleSize: number): string[] | undefined;
    computeScaleSize: (worldWidthViewport: number, worldHeightViewport: number, location: any) => any;
    computeEndScaleTicks: (canvasCoordinates: any, location: any) => {
        endTick1: any[][];
        endTick2: any[][];
    };
    computeInnerScaleTicks: (scaleSize: number, location: string, annotationUID: string, leftTick: any[][], rightTick: any[][]) => {
        tickIds: any[];
        tickUIDs: any[];
        tickCoordinates: any[];
    };
    computeWorldScaleCoordinates: (scaleSize: any, location: any, pointSet: any) => any;
    computeCanvasScaleCoordinates: (canvasSize: any, canvasCoordinates: any, vscaleBounds: any, hscaleBounds: any, location: any) => any;
    computeScaleBounds: (canvasSize: any, horizontalReduction: any, verticalReduction: any, location: any) => {
        height: any;
        width: any;
    };
}

declare type Scaling = {
    PT?: PTScaling;
};

declare type ScalingParameters = {
    /** m in m*p+b which specifies the linear transformation from stored pixels to memory value  */
    rescaleSlope: number;
    /** b in m*p+b which specifies the offset of the transformation */
    rescaleIntercept: number;
    /** modality */
    modality: string;
    /** SUV body weight */
    suvbw?: number;
    /** SUV lean body mass */
    suvlbm?: number;
    /** SUV body surface area */
    suvbsa?: number;
};

declare function scroll_2(viewport: Types_2.IViewport, options: ScrollOptions_2): void;

declare type ScrollOptions_2 = {
    delta: number;
    volumeId?: string;
    debounceLoading?: boolean;
    loop?: boolean;
};

declare type Segmentation = {
    segmentationId: string;
    type: Enums.SegmentationRepresentations;
    label: string;
    activeSegmentIndex: number;
    segmentsLocked: Set<number>;
    cachedStats: {
        [key: string]: number;
    };
    segmentLabels: {
        [key: string]: string;
    };
    representationData: SegmentationRepresentationData;
};

declare namespace segmentation {
    export {
        state_3 as state,
        addSegmentations,
        activeSegmentation,
        addSegmentationRepresentations,
        removeSegmentationsFromToolGroup,
        segmentLocking,
        config_2 as config,
        segmentIndex,
        triggerSegmentationEvents
    }
}
export { segmentation }

declare namespace segmentation_2 {
    export {
        thresholdVolumeByRange,
        createMergedLabelmapForIndex,
        isValidRepresentationConfig,
        getDefaultRepresentationConfig,
        createLabelmapVolumeForViewport,
        rectangleROIThresholdVolumeByRange,
        triggerSegmentationRender,
        floodFill,
        getBrushSizeForToolGroup,
        setBrushSizeForToolGroup,
        getBrushThresholdForToolGroup,
        setBrushThresholdForToolGroup,
        thresholdSegmentationByRange
    }
}

declare type SegmentationDataModifiedEventDetail = {
    segmentationId: string;
    modifiedSlicesToUse?: number[];
};

declare type SegmentationDataModifiedEventType = Types_2.CustomEventType<SegmentationDataModifiedEventDetail>;

export declare class SegmentationDisplayTool extends BaseTool {
    static toolName: any;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    onSetToolEnabled(): void;
    onSetToolDisabled(): void;
    renderSegmentation: (toolGroupId: string) => void;
    _getMergedRepresentationsConfig(toolGroupId: string): SegmentationRepresentationConfig;
}

export declare class SegmentationIntersectionTool extends AnnotationDisplayTool {
    static toolName: any;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    _init: () => void;
    onSetToolEnabled: () => void;
    onCameraModified: (evt: Types_2.EventTypes.CameraModifiedEvent) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}

declare type SegmentationModifiedEventDetail = {
    segmentationId: string;
};

declare type SegmentationModifiedEventType = Types_2.CustomEventType<SegmentationModifiedEventDetail>;

declare type SegmentationPublicInput = {
    segmentationId: string;
    representation: {
        type: Enums.SegmentationRepresentations;
        data: LabelmapSegmentationData | ContourSegmentationData | SurfaceSegmentationData;
    };
};

declare type SegmentationRemovedEventDetail = {
    segmentationId: string;
};

declare type SegmentationRemovedEventType = Types_2.CustomEventType<SegmentationRemovedEventDetail>;

declare type SegmentationRenderedEventDetail = {
    viewportId: string;
    toolGroupId: string;
};

declare type SegmentationRenderedEventType = Types_2.CustomEventType<SegmentationRenderedEventDetail>;

declare type SegmentationRepresentationConfig = {
    renderInactiveSegmentations: boolean;
    representations: RepresentationConfig;
};

declare type SegmentationRepresentationData = {
    LABELMAP?: LabelmapSegmentationData;
    CONTOUR?: ContourSegmentationData;
    SURFACE?: SurfaceSegmentationData;
};

declare type SegmentationRepresentationModifiedEventDetail = {
    toolGroupId: string;
    segmentationRepresentationUID: string;
};

declare type SegmentationRepresentationModifiedEventType = Types_2.CustomEventType<SegmentationRepresentationModifiedEventDetail>;

declare type SegmentationRepresentationRemovedEventDetail = {
    toolGroupId: string;
    segmentationRepresentationUID: string;
};

declare type SegmentationRepresentationRemovedEventType = Types_2.CustomEventType<SegmentationRepresentationRemovedEventDetail>;

declare enum SegmentationRepresentations {
    Labelmap = "LABELMAP",
    Contour = "CONTOUR",
    Surface = "SURFACE"
}

declare type SegmentationState = {
    colorLUT: ColorLUT[];
    segmentations: Segmentation[];
    globalConfig: SegmentationRepresentationConfig;
    toolGroups: {
        [key: string]: {
            segmentationRepresentations: ToolGroupSpecificRepresentations;
            config: SegmentationRepresentationConfig;
        };
    };
};

declare class SegmentationStateManager {
    private state;
    readonly uid: string;
    constructor(uid?: string);
    getState(): SegmentationState;
    getToolGroups(): string[];
    getColorLUT(lutIndex: number): ColorLUT | undefined;
    resetState(): void;
    getSegmentation(segmentationId: string): Segmentation | undefined;
    addSegmentation(segmentation: Segmentation): void;
    getSegmentationRepresentations(toolGroupId: string): ToolGroupSpecificRepresentations | undefined;
    getAllSegmentationRepresentations(): Record<string, ToolGroupSpecificRepresentation[]>;
    addSegmentationRepresentation(toolGroupId: string, segmentationRepresentation: ToolGroupSpecificRepresentation): void;
    getGlobalConfig(): SegmentationRepresentationConfig;
    setGlobalConfig(config: SegmentationRepresentationConfig): void;
    getSegmentationRepresentationByUID(toolGroupId: string, segmentationRepresentationUID: string): ToolGroupSpecificRepresentation | undefined;
    removeSegmentation(segmentationId: string): void;
    removeSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string): void;
    setActiveSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string): void;
    getToolGroupSpecificConfig(toolGroupId: string): SegmentationRepresentationConfig | undefined;
    getSegmentationRepresentationSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string): RepresentationConfig;
    setSegmentationRepresentationSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string, config: RepresentationConfig): void;
    getSegmentSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number): RepresentationConfig;
    setSegmentSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string, config: SegmentSpecificRepresentationConfig): void;
    setSegmentationRepresentationConfig(toolGroupId: string, config: SegmentationRepresentationConfig): void;
    addColorLUT(colorLUT: ColorLUT, lutIndex: number): void;
    removeColorLUT(colorLUTIndex: number): void;
    _handleActiveSegmentation(toolGroupId: string, recentlyAddedOrRemovedSegmentationRepresentation: ToolGroupSpecificRepresentation): void;
    _initDefaultColorLUTIfNecessary(): void;
}

declare namespace segmentIndex {
    export {
        getActiveSegmentIndex,
        setActiveSegmentIndex
    }
}

declare namespace segmentLocking {
    export {
        isSegmentIndexLocked,
        setSegmentIndexLocked,
        getLockedSegments
    }
}

declare type SegmentSpecificRepresentationConfig = {
    [key: number | string]: RepresentationConfig;
};

declare namespace selection {
    export {
        setAnnotationSelected,
        getAnnotationsSelected,
        getAnnotationsSelectedByToolName,
        getAnnotationsSelectedCount,
        deselectAnnotation,
        isAnnotationSelected
    }
}

declare function setActiveSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string): void;

declare function setActiveSegmentIndex(segmentationId: string, segmentIndex: number): void;

declare function setAnnotationLocked(annotation: Annotation, locked?: boolean): void;

declare function setAnnotationManager(annotationManager: any): void;

declare function setAnnotationSelected(annotationUID: string, selected?: boolean, preserveSelected?: boolean): void;

declare function setAnnotationVisibility(annotationUID: string, visible?: boolean): void;

declare function setAttributesIfNecessary(attributes: any, svgNode: any): void;

declare function setBrushSizeForToolGroup(toolGroupId: string, brushSize: number, toolName?: string): void;

declare function setBrushThresholdForToolGroup(toolGroupId: string, threshold: Types_2.Point2): void;

declare function setColorForSegmentIndex(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number, color: Color): void;

declare function setColorLUT(toolGroupId: string, segmentationRepresentationUID: string, colorLUTIndex: number): void;

declare function setConfiguration(config: any): void;

declare function setConfiguration_2(config: any): void;

declare function setCursorForElement(element: HTMLDivElement, cursorName: string): void;

declare function _setElementCursor(element: HTMLDivElement, cursor: MouseCursor | null): void;

declare function setGlobalConfig(config: SegmentationRepresentationConfig, suppressEvents?: boolean): void;

declare function setGlobalConfig_2(segmentationConfig: SegmentationRepresentationConfig): void;

declare function setGlobalRepresentationConfig(representationType: SegmentationRepresentations, config: RepresentationConfig['LABELMAP']): void;

declare function setNewAttributesIfValid(attributes: any, svgNode: any): void;

declare function setSegmentationRepresentationSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string, config: RepresentationConfig, suppressEvents?: boolean): void;

declare function setSegmentationRepresentationSpecificConfig_2(toolGroupId: string, segmentationRepresentationUID: string, config: RepresentationConfig): void;

declare function setSegmentationVisibility(toolGroupId: string, segmentationRepresentationUID: string, visibility: boolean): void;

declare function setSegmentIndexLocked(segmentationId: string, segmentIndex: number, locked?: boolean): void;

declare function setSegmentSpecificConfig(toolGroupId: string, segmentationRepresentationUID: string, config: SegmentSpecificRepresentationConfig): void;

declare function setSegmentSpecificRepresentationConfig(toolGroupId: string, segmentationRepresentationUID: string, config: SegmentSpecificRepresentationConfig, suppressEvents?: boolean): void;

declare function setSegmentsVisibility(toolGroupId: string, segmentationRepresentationUID: string, segmentIndices: number[], visibility: boolean): void;

declare function setSegmentVisibility(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number, visibility: boolean): void;

declare type SetToolBindingsType = {
    bindings: IToolBinding[];
};

declare function setToolGroupSpecificConfig(toolGroupId: string, config: SegmentationRepresentationConfig, suppressEvents?: boolean): void;

declare function setToolGroupSpecificConfig_2(toolGroupId: string, segmentationRepresentationConfig: SegmentationRepresentationConfig): void;

declare type ShapeFnCriteria = (pointIJK: Types_2.Point3, pointLPS: Types_2.Point3) => boolean;

declare type SharedToolProp = {
    supportedInteractionTypes?: Array<string>;
    configuration?: ToolConfiguration;
};

declare function showAllAnnotations(): void;

export declare class SphereScissorsTool extends BaseTool {
    static toolName: any;
    editData: {
        annotation: any;
        segmentation: any;
        segmentIndex: number;
        segmentsLocked: number[];
        segmentationId: string;
        toolGroupId: string;
        segmentColor: [number, number, number, number];
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
        centerCanvas?: Array<number>;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    preMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => true;
    _dragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _endCallback: (evt: EventTypes_2.InteractionEventType) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}

declare const stackContextPrefetch: {
    enable: (element: any) => void;
    disable: typeof disable_2;
    getConfiguration: typeof getConfiguration_2;
    setConfiguration: typeof setConfiguration_2;
};

/**
 * START_NEW_IMAGE
 */
declare type StackNewImageEvent = CustomEvent_2<StackNewImageEventDetail>;

/**
 * STACK_NEW_IMAGE Event's data
 */
declare type StackNewImageEventDetail = {
    /** the new image set on the stack viewport */
    image: IImage;
    /** the image imageId */
    imageId: string;
    /** the index of imageId in the stack */
    imageIdIndex: number;
    /** unique id for the viewport */
    viewportId: string;
    /** unique id for the renderingEngine */
    renderingEngineId: string;
};

declare const stackPrefetch: {
    enable: typeof enable;
    disable: typeof disable;
    getConfiguration: typeof getConfiguration;
    setConfiguration: typeof setConfiguration;
};

export declare class StackScrollMouseWheelTool extends BaseTool {
    static toolName: any;
    _configuration: any;
    constructor(toolProps?: {}, defaultToolProps?: {
        supportedInteractionTypes: string[];
        configuration: {
            invert: boolean;
            debounceIfNotLoaded: boolean;
            loop: boolean;
        };
    });
    mouseWheelCallback(evt: MouseWheelEventType): void;
}

export declare class StackScrollTool extends BaseTool {
    static toolName: any;
    deltaY: number;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    mouseDragCallback(evt: EventTypes_2.InteractionEventType): void;
    touchDragCallback(evt: EventTypes_2.InteractionEventType): void;
    _dragCallback(evt: EventTypes_2.InteractionEventType): void;
    _getPixelPerImage(viewport: any): number;
    _getNumberOfSlices(viewport: any): number;
}

/**
 * STACK_VIEWPORT_NEW_STACK
 */
declare type StackViewportNewStackEvent =
CustomEvent_2<StackViewportNewStackEventDetail>;

/**
 * The STACK_VIEWPORT_NEW_STACK event's data, when a new stack is set on a StackViewport
 */
declare type StackViewportNewStackEventDetail = {
    imageIds: string[];
    viewportId: string;
    element: HTMLDivElement;
    currentImageIdIndex: number;
};

/**
 * Stack Viewport Properties
 */
declare type StackViewportProperties = ViewportProperties & {
    /** interpolation type - linear or nearest neighbor */
    interpolationType?: InterpolationType;
    /** image rotation */
    rotation?: number;
    /** suppress events (optional) */
    suppressEvents?: boolean;
    /** Indicates if the voi is a computed VOI (not user set) */
    isComputedVOI?: boolean;
};

declare type StackViewportScrollEvent = CustomEvent_2<StackViewportScrollEventDetail>;

/**
 * Stack Scroll event detail
 */
declare type StackViewportScrollEventDetail = {
    /** the new imageId index in the stack that we just scroll to */
    newImageIdIndex: number;
    /** the new imageId in the stack that we just scroll to */
    imageId: string;
    /** direction of the scroll */
    direction: number;
};

export declare let state: ICornerstoneTools3dState;

declare namespace state_2 {
    export {
        getAnnotations,
        getNumberOfAnnotations,
        addAnnotation,
        getAnnotation,
        removeAnnotation,
        removeAllAnnotations,
        setAnnotationManager,
        getAnnotationManager,
        resetAnnotationManager
    }
}

declare namespace state_3 {
    export {
        getDefaultSegmentationStateManager,
        getSegmentation,
        getSegmentations,
        addSegmentation,
        removeSegmentation,
        getSegmentationRepresentations,
        addSegmentationRepresentation,
        removeSegmentationRepresentation,
        getToolGroupSpecificConfig,
        setToolGroupSpecificConfig,
        getGlobalConfig,
        setGlobalConfig,
        getSegmentationRepresentationSpecificConfig,
        setSegmentationRepresentationSpecificConfig,
        getSegmentSpecificRepresentationConfig,
        setSegmentSpecificRepresentationConfig,
        getToolGroupIdsWithSegmentation,
        getAllSegmentationRepresentations,
        getSegmentationRepresentationByUID,
        addColorLUT,
        getColorLUT,
        removeColorLUT
    }
}

declare type States = '' | 'Highlighted' | 'Selected' | 'Locked';

declare type Statistics = {
    name: string;
    value: number;
    unit: null | string;
};

declare function stopClip(element: HTMLDivElement): void;

declare type StyleConfig = {
    annotations?: {
        [annotationUID: string]: AnnotationStyle_2;
    };
    viewports?: {
        [viewportId: string]: ToolStyleConfig;
    };
    toolGroups?: {
        [toolGroupId: string]: ToolStyleConfig;
    };
    default: ToolStyleConfig;
};

declare type StyleSpecifier = {
    viewportId?: string;
    toolGroupId?: string;
    toolName?: string;
    annotationUID?: string;
};

/**
 * Surface class for storing surface data
 */
declare class Surface {
    readonly id: string;
    readonly sizeInBytes: number;
    readonly frameOfReferenceUID: string;
    private color: Point3 = [200, 0, 0]; // default color
    private points: number[];
    private polys: number[];

    constructor(props: SurfaceProps) {
        this.id = props.id;
        this.points = props.data.points;
        this.polys = props.data.polys;
        this.color = props.color ?? this.color;
        this.frameOfReferenceUID = props.frameOfReferenceUID;
        this.sizeInBytes = this._getSizeInBytes();
    }

    _getSizeInBytes(): number {
        return this.points.length * 4 + this.polys.length * 4;
    }

    public getColor(): Point3 {
        return this.color;
    }

    public getPoints(): number[] {
        return this.points;
    }

    public getPolys(): number[] {
        return this.polys;
    }

    public getSizeInBytes(): number {
        return this.sizeInBytes;
    }
}

declare type SurfaceData = {
    points: number[];
    polys: number[];
};

declare type SurfaceProps = {
    id: string;
    data: SurfaceData;
    frameOfReferenceUID: string;
    color?: Point3;
};

declare type SurfaceSegmentationData = {
    geometryId: string;
};

declare type SVGCursorDescriptor = {
    iconContent: string;
    iconSize: number;
    viewBox: SVGPoint_2;
    mousePoint: SVGPoint_2;
    mousePointerGroupString: string;
};

declare type SVGDrawingHelper = {
    svgLayerElement: HTMLDivElement;
    svgNodeCacheForCanvas: Record<string, unknown>;
    getSvgNode: (cacheKey: string) => SVGGElement | undefined;
    appendNode: (svgNode: SVGElement, cacheKey: string) => void;
    setNodeTouched: (cacheKey: string) => void;
    clearUntouched: () => void;
};

declare class SVGMouseCursor extends ImageMouseCursor {
    constructor(url: string, x?: number, y?: number, name?: string | undefined, fallback?: MouseCursor | undefined);
    static getDefinedCursor(name: string, pointer?: boolean, color?: string): MouseCursor;
}

declare type SVGPoint_2 = {
    x: number;
    y: number;
};

declare enum Swipe {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT"
}

export declare class Synchronizer {
    private _enabled;
    private _eventName;
    private _eventHandler;
    private _ignoreFiredEvents;
    private _sourceViewports;
    private _targetViewports;
    private _viewportOptions;
    private _options;
    id: string;
    constructor(synchronizerId: string, eventName: string, eventHandler: ISynchronizerEventHandler, options?: any);
    isDisabled(): boolean;
    setOptions(viewportId: string, options?: Record<string, unknown>): void;
    getOptions(viewportId: string): Record<string, unknown> | undefined;
    add(viewportInfo: Types_2.IViewportId): void;
    addSource(viewportInfo: Types_2.IViewportId): void;
    addTarget(viewportInfo: Types_2.IViewportId): void;
    getSourceViewports(): Array<Types_2.IViewportId>;
    getTargetViewports(): Array<Types_2.IViewportId>;
    destroy(): void;
    remove(viewportInfo: Types_2.IViewportId): void;
    removeSource(viewportInfo: Types_2.IViewportId): void;
    removeTarget(viewportInfo: Types_2.IViewportId): void;
    hasSourceViewport(renderingEngineId: string, viewportId: string): boolean;
    hasTargetViewport(renderingEngineId: string, viewportId: string): boolean;
    private fireEvent;
    private _onEvent;
    private _hasSourceElements;
    private _updateDisableHandlers;
}

declare namespace SynchronizerManager {
    export {
        createSynchronizer,
        destroy_2 as destroy,
        getSynchronizer,
        getSynchronizersForViewport,
        getAllSynchronizers,
        destroySynchronizer
    }
}
export { SynchronizerManager }

declare namespace synchronizers {
    export {
        createCameraPositionSynchronizer,
        createVOISynchronizer,
        createZoomPanSynchronizer,
        createStackImageSynchronizer
    }
}
export { synchronizers }

declare type TextBoxHandle = {
    hasMoved: boolean;
    worldBoundingBox: {
        bottomLeft: Types_2.Point3;
        bottomRight: Types_2.Point3;
        topLeft: Types_2.Point3;
        topRight: Types_2.Point3;
    };
    worldPosition: Types_2.Point3;
};

declare type ThresholdInformation = {
    volume: Types_2.IImageVolume;
    lower: number;
    upper: number;
};

declare type ThresholdOptions = {
    numSlicesToProject?: number;
    overwrite: boolean;
    overlapType?: number;
};

declare type ThresholdRangeOptions = {
    overwrite: boolean;
    boundsIJK: BoundsIJK;
    overlapType?: number;
};

declare function thresholdSegmentationByRange(segmentationVolume: Types_2.IImageVolume, segmentationIndex: number, thresholdVolumeInformation: ThresholdInformation[], overlapType: number): Types_2.IImageVolume;

declare function thresholdVolumeByRange(segmentationVolume: Types_2.IImageVolume, thresholdVolumeInformation: ThresholdInformation[], options: ThresholdRangeOptions): Types_2.IImageVolume;

declare function throttle(func: Function, wait?: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): Function;

declare type ToolAction = {
    method: string | ((evt: InteractionEventType, annotation: Annotation) => void);
    bindings: SetToolBindingsType[];
};

declare type ToolActivatedEventDetail = {
    toolGroupId: string;
    toolName: string;
    toolBindingsOptions: SetToolBindingsType;
};

declare type ToolActivatedEventType = Types_2.CustomEventType<ToolActivatedEventDetail>;

declare type ToolBindingKeyboardType = (typeof KeyboardBindings)[keyof typeof KeyboardBindings];

declare type ToolBindingMouseType = (typeof MouseBindings)[keyof typeof MouseBindings];

declare type ToolConfiguration = Record<string, any> & {
    statsCalculator?: Calculator;
};

declare interface ToolData {
    intervalId: number | undefined;
    framesPerSecond: number;
    lastFrameTimeStamp: number | undefined;
    frameTimeVector: number[] | undefined;
    ignoreFrameTimeVector: boolean;
    usingFrameTimeVector: boolean;
    speed: number;
    reverse: boolean;
    loop: boolean;
    dynamicCineEnabled?: boolean;
}

declare namespace ToolGroupManager {
    export {
        createToolGroup,
        destroy_3 as destroy,
        destroyToolGroup,
        getToolGroup,
        getToolGroupForViewport,
        getAllToolGroups,
        getToolGroupsWithToolName
    }
}
export { ToolGroupManager }

declare type ToolGroupSpecificContourRepresentation = ToolGroupSpecificRepresentationState & {
    config: ContourRenderingConfig;
    segmentationRepresentationSpecificConfig?: RepresentationConfig;
    segmentSpecificConfig?: SegmentSpecificRepresentationConfig;
};

declare type ToolGroupSpecificLabelmapRepresentation = ToolGroupSpecificRepresentationState & {
    config: LabelmapRenderingConfig;
    segmentationRepresentationSpecificConfig?: RepresentationConfig;
    segmentSpecificConfig?: SegmentSpecificRepresentationConfig;
};

declare type ToolGroupSpecificRepresentation = ToolGroupSpecificLabelmapRepresentation | ToolGroupSpecificContourRepresentation;

declare type ToolGroupSpecificRepresentations = Array<ToolGroupSpecificRepresentation>;

declare type ToolGroupSpecificRepresentationState = {
    segmentationRepresentationUID: string;
    segmentationId: string;
    type: Enums.SegmentationRepresentations;
    active: boolean;
    segmentsHidden: Set<number>;
    colorLUTIndex: number;
};

declare type ToolHandle = AnnotationHandle | TextBoxHandle;

declare type ToolModeChangedEventDetail = {
    toolGroupId: string;
    toolName: string;
    mode: ToolModes;
    toolBindingsOptions?: SetToolBindingsType;
};

declare type ToolModeChangedEventType = Types_2.CustomEventType<ToolModeChangedEventDetail>;

declare enum ToolModes {
    Active = "Active",
    Passive = "Passive",
    Enabled = "Enabled",
    Disabled = "Disabled"
}

declare type ToolOptionsType = {
    bindings: IToolBinding[];
    mode: ToolModes;
};

declare type ToolProps = SharedToolProp;

declare namespace ToolSpecificAnnotationTypes {
    export {
        RectangleROIAnnotation,
        ProbeAnnotation,
        LengthAnnotation,
        AdvancedMagnifyAnnotation,
        CircleROIAnnotation,
        EllipticalROIAnnotation,
        BidirectionalAnnotation,
        RectangleROIThresholdAnnotation,
        RectangleROIStartEndThresholdAnnotation,
        PlanarFreehandROIAnnotation,
        ArrowAnnotation,
        AngleAnnotation,
        CobbAngleAnnotation,
        ReferenceCursor,
        ReferenceLineAnnotation,
        ScaleOverlayAnnotation,
        VideoRedactionAnnotation
    }
}

declare class ToolStyle {
    config: StyleConfig;
    constructor();
    getAnnotationToolStyles(annotationUID: string): AnnotationStyle_2;
    getViewportToolStyles(viewportId: string): ToolStyleConfig;
    getToolGroupToolStyles(toolGroupId: string): ToolStyleConfig;
    getDefaultToolStyles(): ToolStyleConfig;
    setAnnotationStyles(annotationUID: string, styles: AnnotationStyle_2): void;
    setViewportToolStyles(viewportId: string, styles: ToolStyleConfig): void;
    setToolGroupToolStyles(toolGroupId: string, styles: ToolStyleConfig): void;
    setDefaultToolStyles(styles: ToolStyleConfig): void;
    getStyleProperty(toolStyle: string, specifications: StyleSpecifier): any;
    private _getToolStyle;
    private _initializeConfig;
}

declare const toolStyle: ToolStyle;

declare type ToolStyleConfig = {
    [toolName: string]: AnnotationStyle_2;
} & {
    global?: AnnotationStyle_2;
};

declare namespace touch {
    export {
        getMeanPoints,
        getMeanTouchPoints,
        copyPoints,
        copyPointsList,
        getDeltaDistanceBetweenIPoints,
        getDeltaPoints,
        getDeltaDistance,
        getDeltaRotation
    }
}

declare type TouchCustomEventDetail = NormalizedInteractionEventDetail & {
    event: Record<string, unknown> | TouchEvent;
};

declare type TouchDragEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & TouchPointsDetail;

declare type TouchDragEventType = Types_2.CustomEventType<TouchDragEventDetail>;

declare type TouchEndEventDetail = NormalizedInteractionEventDetail & TouchPointsDetail & TouchCustomEventDetail;

declare type TouchEndEventType = Types_2.CustomEventType<TouchEndEventDetail>;

declare type TouchPointsDetail = {
    startPoints: ITouchPoints;
    lastPoints: ITouchPoints;
    currentPoints: ITouchPoints;
    startPointsList: ITouchPoints[];
    lastPointsList: ITouchPoints[];
    currentPointsList: ITouchPoints[];
    deltaPoints: IPoints;
    deltaDistance: IDistance;
};

declare type TouchPressEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & {
    startPointsList: ITouchPoints[];
    lastPointsList: ITouchPoints[];
    startPoints: ITouchPoints;
    lastPoints: ITouchPoints;
};

declare type TouchPressEventType = Types_2.CustomEventType<TouchPressEventDetail>;

declare type TouchStartActivateEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & TouchPointsDetail;

declare type TouchStartActivateEventType = Types_2.CustomEventType<TouchStartActivateEventDetail>;

declare type TouchStartEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & TouchPointsDetail;

declare type TouchStartEventType = Types_2.CustomEventType<TouchStartEventDetail>;

declare type TouchSwipeEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & {
    swipe: Swipe;
};

declare type TouchSwipeEventType = Types_2.CustomEventType<TouchSwipeEventDetail>;

declare type TouchTapEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & {
    currentPointsList: ITouchPoints[];
    currentPoints: ITouchPoints;
    taps: number;
};

declare type TouchTapEventType = Types_2.CustomEventType<TouchTapEventDetail>;

export declare class TrackballRotateTool extends BaseTool {
    static toolName: any;
    touchDragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    mouseDragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    rotateCamera: (viewport: any, centerWorld: any, axis: any, angle: any) => void;
    _dragCallback(evt: EventTypes_2.InteractionEventType): void;
}

/** used for CPU rendering */
declare type TransformMatrix2D = [number, number, number, number, number, number];

declare function triggerAnnotationRender(element: HTMLDivElement): void;

declare function triggerAnnotationRenderForViewportIds(renderingEngine: Types_2.IRenderingEngine, viewportIdsToRender: string[]): void;

/**
 * Small utility to trigger a custom event for a given EventTarget.
 *
 * @example
 *
 * ```javascript
 * triggerEvent(element, Events.IMAGE_RENDERED, { element })
 * ```
 * or it can trigger event on the eventTarget itself
 *
 * ```javascript
 * triggerEvent(eventTarget, CSTOOLS_EVENTS.ANNOTATION_MODIFIED, { viewportId, annotationUID })
 * ```
 *
 * @param el - The element or EventTarget to trigger the event upon
 * @param type - The event type name
 * @param detail - The event detail to be sent
 * @returns false if event is cancelable and at least one of the event handlers
 * which received event called Event.preventDefault(). Otherwise it returns true.
 */
declare function triggerEvent(
el: EventTarget = eventTarget,
type: string,
detail: unknown = null
): boolean {
    if (!type) {
        throw new Error('Event type was not defined');
    }

    const event = new CustomEvent(type, {
        detail,
        cancelable: true,
    });

    return el.dispatchEvent(event);
}

declare function triggerSegmentationDataModified(segmentationId: string, modifiedSlicesToUse?: number[]): void;

declare namespace triggerSegmentationEvents {
    export {
        triggerSegmentationRepresentationModified,
        triggerSegmentationRepresentationRemoved,
        triggerSegmentationDataModified,
        triggerSegmentationModified,
        triggerSegmentationRemoved
    }
}

declare function triggerSegmentationModified(segmentationId?: string): void;

declare function triggerSegmentationRemoved(segmentationId: string): void;

declare function triggerSegmentationRender(toolGroupId: string): void;

declare function triggerSegmentationRepresentationModified(toolGroupId: string, segmentationRepresentationUID?: string): void;

declare function triggerSegmentationRepresentationRemoved(toolGroupId: string, segmentationRepresentationUID: string): void;

declare namespace Types {
    export {
        Annotation,
        Annotations,
        IAnnotationManager,
        GroupSpecificAnnotations,
        AnnotationState,
        AnnotationStyle,
        ToolSpecificAnnotationTypes,
        JumpToSliceOptions,
        AnnotationGroupSelector,
        PlanarBoundingBox,
        ToolProps,
        PublicToolProps,
        ToolConfiguration,
        EventTypes_2 as EventTypes,
        IPoints,
        ITouchPoints,
        IDistance,
        IToolBinding,
        SetToolBindingsType,
        ToolOptionsType,
        InteractionTypes,
        ToolAction,
        IToolGroup,
        IToolClassReference,
        ISynchronizerEventHandler,
        ToolHandle,
        AnnotationHandle,
        TextBoxHandle,
        Segmentation,
        SegmentationState,
        SegmentationRepresentationData,
        SegmentationRepresentationConfig,
        RepresentationConfig,
        ToolGroupSpecificRepresentationState,
        ToolGroupSpecificContourRepresentation,
        ToolGroupSpecificLabelmapRepresentation,
        ToolGroupSpecificRepresentation,
        RepresentationPublicInput,
        Color,
        ColorLUT,
        LabelmapTypes,
        SVGCursorDescriptor,
        SVGPoint_2 as SVGPoint,
        ScrollOptions_2 as ScrollOptions,
        CINETypes,
        BoundsIJK,
        SVGDrawingHelper,
        FloodFillResult,
        FloodFillGetter,
        FloodFillOptions,
        ContourSegmentationData,
        Statistics
    }
}
export { Types }

declare namespace Types_2 {
    export {
        Cornerstone3DConfig,
        ICamera,
        IStackViewport,
        IVideoViewport,
        IVolumeViewport,
        IEnabledElement,
        ICache,
        IVolume,
        VolumeScalarData,
        IViewportId,
        IImageVolume,
        IDynamicImageVolume,
        IRenderingEngine,
        ScalingParameters,
        PTScaling,
        Scaling,
        IStreamingImageVolume,
        IImage,
        IImageData,
        IImageCalibration,
        CPUIImageData,
        CPUImageData,
        EventTypes,
        ImageLoaderFn,
        VolumeLoaderFn,
        IRegisterImageLoader,
        IStreamingVolumeProperties,
        IViewport,
        StackViewportProperties,
        VolumeViewportProperties,
        ViewportProperties,
        PublicViewportInput,
        VolumeActor,
        Actor,
        ActorEntry,
        ImageActor,
        IImageLoadObject,
        IVolumeLoadObject,
        IVolumeInput,
        VolumeInputCallback,
        ViewportPreset,
        Metadata,
        OrientationVectors,
        Point2,
        Point3,
        Point4,
        Mat3,
        Plane,
        ViewportInputOptions,
        VideoViewportProperties,
        VOIRange,
        VOI,
        DisplayArea,
        FlipDirection,
        ICachedImage,
        ICachedVolume,
        CPUFallbackEnabledElement,
        CPUFallbackViewport,
        CPUFallbackTransform,
        CPUFallbackColormapData,
        CPUFallbackViewportDisplayedArea,
        CPUFallbackColormapsData,
        CPUFallbackColormap,
        TransformMatrix2D,
        CPUFallbackLookupTable,
        CPUFallbackLUT,
        CPUFallbackRenderingTools,
        CustomEvent_2 as CustomEventType,
        ActorSliceRange,
        ImageSliceData,
        IGeometry,
        IGeometryLoadObject,
        ICachedGeometry,
        PublicContourSetData,
        ContourSetData,
        ContourData,
        IContourSet,
        IContour,
        PublicSurfaceData,
        SurfaceData,
        RGB,
        ColormapPublic,
        ColormapRegistration,
        PixelDataTypedArray,
        ImagePixelModule,
        ImagePlaneModule,
        AffineMatrix,
        InternalVideoCamera,
        VideoViewportInput
    }
}

declare namespace Types_3 {
    export {
        ColorbarCommonProps,
        ColorbarProps,
        ColorbarImageRange,
        ColorbarVOIRange,
        ColorbarSize,
        ColorbarTicksProps,
        ColorbarTicksStyle,
        ViewportColorbarProps
    }
}

declare function unlockAllAnnotations(): void;

declare namespace utilities {
    export {
        math,
        planar,
        viewportFilters,
        drawing_2 as drawing,
        debounce,
        dynamicVolume,
        throttle,
        orientation_2 as orientation,
        isObject,
        touch,
        triggerEvent,
        calibrateImageSpacing,
        segmentation_2 as segmentation,
        triggerAnnotationRenderForViewportIds,
        triggerAnnotationRender,
        pointInShapeCallback,
        pointInSurroundingSphereCallback,
        getAnnotationNearPoint,
        getAnnotationNearPointOnEnabledElement,
        jumpToSlice,
        viewport,
        cine,
        clip_2 as clip,
        boundingBox,
        rectangleROITool,
        planarFreehandROITool,
        stackPrefetch,
        stackContextPrefetch,
        scroll_2 as scroll,
        roundNumber,
        pointToString,
        polyDataUtils,
        voi
    }
}
export { utilities }

declare namespace vec2 {
    export {
        findClosestPoint,
        clip as liangBarksyClip
    }
}

declare interface VideoRedactionAnnotation extends Annotation {
    metadata: {
        viewPlaneNormal: Types_2.Point3;
        viewUp: Types_2.Point3;
        FrameOfReferenceUID: string;
        referencedImageId: string;
        toolName: string;
    };
    data: {
        invalidated: boolean;
        handles: {
            points: Types_2.Point3[];
            activeHandleIndex: number | null;
        };
        cachedStats: {
            [key: string]: any;
        };
        active: boolean;
    };
}

export declare class VideoRedactionTool extends AnnotationTool {
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportUIDsToRender: string[];
        handleIndex?: number;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    _configuration: any;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolConfiguration?: {});
    addNewAnnotation: (evt: EventTypes_2.InteractionEventType) => VideoRedactionAnnotation;
    getHandleNearImagePoint: (element: any, annotation: any, canvasCoords: any, proximity: any) => any;
    isPointNearTool: (element: any, annotation: any, canvasCoords: any, proximity: any) => boolean;
    toolSelectedCallback: (evt: any, annotation: any, interactionType?: string) => void;
    handleSelectedCallback: (evt: any, annotation: any, handle: any, interactionType?: string) => void;
    _mouseUpCallback: (evt: any) => void;
    _mouseDragCallback: (evt: any) => void;
    cancel(element: any): any;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    renderAnnotation: (enabledElement: Types_2.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _getRectangleImageCoordinates: (points: Array<Types_2.Point2>) => {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    _getImageVolumeFromTargetUID(targetUID: any, renderingEngine: any): {
        imageVolume: any;
        viewport: any;
    };
    _calculateCachedStats: (annotation: any, viewPlaneNormal: any, viewUp: any, renderingEngine: any, enabledElement: any) => any;
    _isInsideVolume: (index1: any, index2: any, dimensions: any) => boolean;
    _getTargetStackUID(viewport: any): string;
    _getTargetVolumeUID: (scene: any) => any;
}

declare type VideoViewportInput = {
    id: string;
    renderingEngineId: string;
    type: ViewportType;
    element: HTMLDivElement;
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
    defaultOptions: any;
    canvas: HTMLCanvasElement;
};

/**
 * Stack Viewport Properties
 */
declare type VideoViewportProperties = ViewportProperties & {
    loop?: boolean;
    muted?: boolean;
    pan?: Point2;
    playbackRate?: number;
    // The zoom factor, naming consistent with vtk cameras for now,
    // but this isn't necessarily necessary.
    parallelScale?: number;
};

declare namespace viewport {
    export {
        isViewportPreScaled,
        jumpToSlice,
        jumpToWorld
    }
}

declare class ViewportColorbar extends Colorbar {
    private _element;
    private _volumeId;
    private _hideTicksTime;
    private _hideTicksTimeoutId;
    constructor(props: ViewportColorbarProps);
    get element(): HTMLDivElement;
    get enabledElement(): Types_2.IEnabledElement;
    protected getVOIMultipliers(): [number, number];
    protected onVoiChange(voiRange: ColorbarVOIRange): void;
    private static _getImageRange;
    private static _getVOIRange;
    private autoHideTicks;
    private showAndAutoHideTicks;
    private _stackNewImageCallback;
    private _imageVolumeModifiedCallback;
    private _viewportVOIModifiedCallback;
    private _addCornerstoneEventListener;
}

declare type ViewportColorbarProps = ColorbarProps & {
    element: HTMLDivElement;
    volumeId?: string;
};

declare namespace viewportFilters {
    export {
        filterViewportsWithToolEnabled,
        filterViewportsWithFrameOfReferenceUID,
        getViewportIdsWithToolToRender,
        filterViewportsWithParallelNormals
    }
}

/**
 * This type defines the shape of viewport input options, so we can throw when it is incorrect.
 */
declare type ViewportInputOptions = {
    /** background color */
    background?: RGB;
    /** orientation of the viewport which can be either an Enum for axis Enums.OrientationAxis.[AXIAL|SAGITTAL|CORONAL|DEFAULT] or an object with viewPlaneNormal and viewUp */
    orientation?: OrientationAxis | OrientationVectors;
    /** displayArea of interest */
    displayArea?: DisplayArea;
    /** whether the events should be suppressed and not fired*/
    suppressEvents?: boolean;
    /**
     * parallel projection settings, Note that this will only be used for VOLUME_3D viewport. You can't modify the
     * parallel projection of a stack viewport or volume viewport using viewport input options.
     */
    parallelProjection?: boolean;
};

declare interface ViewportPreset {
    name: string;
    gradientOpacity: string;
    specularPower: string;
    scalarOpacity: string;
    specular: string;
    shade: string;
    ambient: string;
    colorTransfer: string;
    diffuse: string;
    interpolation: string;
}

/**
 * Shared Viewport Properties between Stack and Volume Viewports
 */
declare type ViewportProperties = {
    /** voi range (upper, lower) for the viewport */
    voiRange?: VOIRange;
    /** VOILUTFunction type which is LINEAR or SAMPLED_SIGMOID */
    VOILUTFunction?: VOILUTFunctionType;
    /** invert flag - whether the image is inverted */
    invert?: boolean;
    /** Colormap applied to the viewport*/
    colormap?: ColormapPublic;
    /** interpolation type */
    interpolationType?: InterpolationType;
};

declare enum ViewportStatus {
    /** Initial state before any volumes or stacks are available*/
    NO_DATA = 'noData',
    /** Stack/volumes are available but are in progress */
    LOADING = 'loading',
    /** Ready to be rendered */
    PRE_RENDER = 'preRender',
    /** In the midst of a resize */
    RESIZE = 'resize',
    /** Rendered image data */
    RENDERED = 'rendered',
}

/**
 * ViewportType enum for cornerstone-render which defines the type of viewport.
 * It can be either STACK, PERSPECTIVE, ORTHOGRAPHIC.
 */
declare enum ViewportType {
    /**
     * - Suitable for rendering a stack of images, that might or might not belong to the same image.
     * - Stack can include 2D images of different shapes, size and direction
     */
    STACK = 'stack',
    /**
     * - Suitable for rendering a volumetric data which is considered as one 3D image.
     * - Having a VolumeViewport enables Multi-planar reformation or reconstruction (MPR) by design, in which you can visualize the volume from various different orientations without addition of performance costs.
     */
    ORTHOGRAPHIC = 'orthographic',
    /** Perspective Viewport: Not Implemented yet */
    PERSPECTIVE = 'perspective',
    VOLUME_3D = 'volume3d',
    VIDEO = 'video',
}

declare namespace visibility {
    export {
        setAnnotationVisibility,
        showAllAnnotations,
        isAnnotationVisible,
        checkAndDefineIsVisibleProperty
    }
}

declare namespace visibility_2 {
    export {
        setSegmentationVisibility,
        getSegmentationVisibility,
        setSegmentVisibility,
        setSegmentsVisibility
    }
}

declare type VOI = {
    /** Window Width for display */
    windowWidth: number;
    /** Window Center for display */
    windowCenter: number;
};

declare namespace voi {
    export {
        colorbar
    }
}

/**
 * Interpolation types for image rendering
 */
declare enum VOILUTFunctionType {
    LINEAR = 'LINEAR',
    SAMPLED_SIGMOID = 'SIGMOID', // SIGMOID is sampled in 1024 even steps so we call it SAMPLED_SIGMOID
    // EXACT_LINEAR = 'EXACT_LINEAR', TODO: Add EXACT_LINEAR option from DICOM NEMA
}

/**
 * VOI_MODIFIED Event type
 */
declare type VoiModifiedEvent = CustomEvent_2<VoiModifiedEventDetail>;

/**
 * VOI_MODIFIED Event's data
 */
declare type VoiModifiedEventDetail = {
    /** Viewport Unique ID in the renderingEngine */
    viewportId: string;
    /** new VOI range */
    range: VOIRange;
    /** Unique ID for the volume in the cache */
    volumeId?: string;
    /** VOILUTFunction */
    VOILUTFunction?: VOILUTFunctionType;
    /** inverted */
    invert?: boolean;
    /** Indicates if the 'invert' state has changed from the previous state */
    invertStateChanged?: boolean;
};

declare type VOIRange = {
    /** upper value for display */
    upper: number;
    /** lower value for display */
    lower: number;
};

declare type VOISynchronizerOptions = {
    syncInvertState: boolean;
};

declare type VolumeActor = vtkVolume;

/**
 * VOLUME_CACHE_VOLUME_ADDED Event type
 */
declare type VolumeCacheVolumeAddedEvent =
CustomEvent_2<VolumeCacheVolumeAddedEventDetail>;

/**
 * VOLUME_CACHE_VOLUME_ADDED Event's data
 */
declare type VolumeCacheVolumeAddedEventDetail = {
    /** the added volume */
    volume: ICachedVolume;
};

/**
 * VOLUME_CACHE_VOLUME_REMOVED Event type
 */
declare type VolumeCacheVolumeRemovedEvent =
CustomEvent_2<VolumeCacheVolumeRemovedEventDetail>;

/**
 * VOLUME_CACHE_VOLUME_REMOVED Event's data
 */
declare type VolumeCacheVolumeRemovedEventDetail = {
    /** the removed volume id */
    volumeId: string;
};

/**
 * Volume input callback type, used to perform operations on the volume data
 * after it has been loaded.
 */
declare type VolumeInputCallback = (params: {
    /** vtk volume actor */
    volumeActor: VolumeActor;
    /** unique volume Id in the cache */
    volumeId: string;
}) => unknown;

/**
 * VOLUME_LOADED Event type
 */
declare type VolumeLoadedEvent = CustomEvent_2<VolumeLoadedEventDetail>;

/**
 * VOLUME_LOADED Event's data
 */
declare type VolumeLoadedEventDetail = {
    /** the loaded volume */
    volume: IImageVolume;
};

/**
 * VOLUME_LOADED_FAILED Event type
 */
declare type VolumeLoadedFailedEvent = CustomEvent_2<VolumeLoadedFailedEventDetail>;

/**
 * VOLUME_LOADED_FAILED Event's data
 */
declare type VolumeLoadedFailedEventDetail = {
    /** the volumeId for the volume */
    volumeId: string;
    error: unknown;
};

/**
 * Any volumeLoader function should implement a loading given the volumeId
 * and returns a mandatory promise which will resolve to the loaded volume object.
 * Additional `cancelFn` and `decache` can be implemented.
 */
declare type VolumeLoaderFn = (
volumeId: string,
options?: Record<string, any>
) => {
    /** promise that resolves to the volume object */
    promise: Promise<Record<string, any>>;
    /** cancel function */
    cancelFn?: () => void | undefined;
    /** decache function */
    decache?: () => void | undefined;
};

/**
 * VOLUME_NEW_IMAGE
 */
declare type VolumeNewImageEvent = CustomEvent_2<VolumeNewImageEventDetail>;

/**
 * VOLUME_NEW_IMAGE Event's data
 */
declare type VolumeNewImageEventDetail = {
    /** image index */
    imageIndex: number;
    /** number of slices */
    numberOfSlices: number;
    /** unique id for the viewport */
    viewportId: string;
    /** unique id for the renderingEngine */
    renderingEngineId: string;
};

export declare class VolumeRotateMouseWheelTool extends BaseTool {
    static toolName: any;
    _configuration: any;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    mouseWheelCallback(evt: MouseWheelEventType): void;
}

declare type VolumeScalarData = Float32Array | Uint8Array | Uint16Array | Int16Array;

declare type VolumeScrollOutOfBoundsEventDetail = {
    volumeId: string;
    viewport: Types_2.IVolumeViewport;
    desiredStepIndex: number;
    currentStepIndex: number;
    delta: number;
    numScrollSteps: number;
    currentImageId: string;
};

declare type VolumeScrollOutOfBoundsEventType = Types_2.CustomEventType<VolumeScrollOutOfBoundsEventDetail>;

/**
 * Stack Viewport Properties
 */
declare type VolumeViewportProperties = ViewportProperties & {
    /** 3d preset */
    preset?: string;

    slabThickness?: number;
};

declare abstract class Widget {
    private _id;
    private _rootElement;
    private _containerSize;
    private _containerResizeObserver;
    constructor({ id, container }: WidgetProps);
    get id(): string;
    get rootElement(): HTMLElement;
    appendTo(container: HTMLElement): void;
    destroy(): void;
    protected get containerSize(): WidgetSize;
    protected createRootElement(id: string): HTMLElement;
    protected onContainerResize(): void;
    private _containerResizeCallback;
}

declare type WidgetProps = {
    id: string;
    container?: HTMLElement;
};

declare type WidgetSize = {
    width: number;
    height: number;
};

export declare class WindowLevelTool extends BaseTool {
    static toolName: any;
    constructor(toolProps?: {}, defaultToolProps?: {
        supportedInteractionTypes: string[];
    });
    touchDragCallback(evt: EventTypes_2.InteractionEventType): void;
    mouseDragCallback(evt: EventTypes_2.InteractionEventType): void;
    getPTScaledNewRange({ deltaPointsCanvas, lower, upper, clientHeight, viewport, volumeId, isPreScaled, }: {
        deltaPointsCanvas: any;
        lower: any;
        upper: any;
        clientHeight: any;
        viewport: any;
        volumeId: any;
        isPreScaled: any;
    }): {
        lower: any;
        upper: any;
    };
    getNewRange({ viewport, deltaPointsCanvas, volumeId, lower, upper }: {
        viewport: any;
        deltaPointsCanvas: any;
        volumeId: any;
        lower: any;
        upper: any;
    }): {
        lower: number;
        upper: number;
    };
    _getMultiplierFromDynamicRange(viewport: any, volumeId: any): number;
    _getImageDynamicRangeFromViewport(viewport: any): number;
    _getImageDynamicRangeFromMiddleSlice: (scalarData: any, dimensions: any) => number;
    private _getMinMax;
}

export declare class ZoomTool extends BaseTool {
    static toolName: any;
    touchDragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    mouseDragCallback: (evt: EventTypes_2.InteractionEventType) => void;
    initialMousePosWorld: Types_2.Point3;
    dirVec: Types_2.Point3;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    preMouseDownCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    preTouchStartCallback: (evt: EventTypes_2.InteractionEventType) => boolean;
    _pinchCallback(evt: EventTypes_2.InteractionEventType): void;
    _dragCallback(evt: EventTypes_2.InteractionEventType): void;
    _dragParallelProjection: (evt: EventTypes_2.InteractionEventType, viewport: Types_2.IStackViewport | Types_2.IVolumeViewport, camera: Types_2.ICamera, pinch?: boolean) => void;
    _dragPerspectiveProjection: (evt: EventTypes_2.InteractionEventType, viewport: Types_2.IStackViewport | Types_2.IVolumeViewport, camera: Types_2.ICamera, pinch?: boolean) => void;
    _panCallback(evt: EventTypes_2.InteractionEventType): void;
}

export { }
