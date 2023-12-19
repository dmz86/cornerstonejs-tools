import type { ColorbarProps, ColorbarVOIRange } from './types';
import { ColorbarTicks } from './ColorbarTicks';
import Widget from '../../../widgets/Widget';
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
export { Colorbar as default, Colorbar };
