import type { Types } from '@cornerstonejs/core';
declare type OperationData = {
    points: [Types.Point3, Types.Point3, Types.Point3, Types.Point3];
    imageVolume: Types.IImageVolume;
    volume: Types.IImageVolume;
    segmentIndex: number;
    segmentationId: string;
    segmentsLocked: number[];
    viewPlaneNormal: Types.Point3;
    viewUp: Types.Point3;
    constraintFn: () => boolean;
    strategySpecificConfiguration: any;
};
export declare function eraseInsideSphere(enabledElement: Types.IEnabledElement, operationData: OperationData): void;
export {};
