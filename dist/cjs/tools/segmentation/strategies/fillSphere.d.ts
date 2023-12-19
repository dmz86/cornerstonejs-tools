import type { Types } from '@cornerstonejs/core';
declare type OperationData = {
    points: [Types.Point3, Types.Point3, Types.Point3, Types.Point3];
    volume: Types.IImageVolume;
    imageVolume: Types.IImageVolume;
    segmentIndex: number;
    segmentationId: string;
    segmentsLocked: number[];
    viewPlaneNormal: Types.Point3;
    viewUp: Types.Point3;
    strategySpecificConfiguration: any;
    constraintFn: () => boolean;
};
export declare function fillInsideSphere(enabledElement: Types.IEnabledElement, operationData: OperationData): void;
export declare function thresholdInsideSphere(enabledElement: Types.IEnabledElement, operationData: OperationData): void;
export declare function fillOutsideSphere(enabledElement: Types.IEnabledElement, operationData: OperationData): void;
export {};
