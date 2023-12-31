declare type ModalityUnitOptions = {
    isPreScaled: boolean;
    isSuvScaled: boolean;
};
declare function getModalityUnit(modality: string, imageId: string, options: ModalityUnitOptions): string;
export { getModalityUnit, ModalityUnitOptions };
