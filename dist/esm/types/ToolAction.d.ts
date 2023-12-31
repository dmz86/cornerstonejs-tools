import type { Annotation } from './AnnotationTypes';
import type { InteractionEventType } from './EventTypes';
import type { SetToolBindingsType } from './ISetToolModeOptions';
declare type ToolAction = {
    method: string | ((evt: InteractionEventType, annotation: Annotation) => void);
    bindings: SetToolBindingsType[];
};
export default ToolAction;
