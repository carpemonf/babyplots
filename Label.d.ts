import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
declare class dpInfo {
    private _background;
    private _textBlock;
    private _text;
    private _bgColor;
    private _txtColor;
    private _target;
    private _uiLayer;
    constructor(text: string, target: TransformNode, uiLayer: AdvancedDynamicTexture, backgroundColor: string, color: string);
    draw(): void;
    dispose(): void;
}
declare class Label {
    private _label;
    private _background;
    private _text;
    size: number;
    color: string;
    fixed: boolean;
    constructor(text: string, position: Vector3, scene: Scene, color?: string);
    setText(text: string): void;
    update(camera: ArcRotateCamera, scene: Scene): void;
    fix(): void;
    unfix(): void;
    dispose(): void;
    export(): [number, number, number, string];
}
export declare class AnnotationManager {
    private _canvas;
    private _scene;
    private _ymax;
    private _camera;
    private _labelControlBox;
    private _editLabelContainer;
    private _editLabelForms;
    private _addLabelTextInput;
    private _showLabels;
    private _arrows;
    private _showArrows;
    private _bgColor;
    private _fgColor;
    private _fullScreenUI;
    dpInfo: dpInfo;
    labels: Label[];
    fixedLabels: boolean;
    fixedArrows: boolean;
    constructor(canvas: HTMLCanvasElement, scene: Scene, ymax: number, camera: ArcRotateCamera, backgroundColor: string, fullScreenUI: AdvancedDynamicTexture);
    private _createLabelForms;
    update(): void;
    toggleLabelControl(): void;
    private _addLabelBtnClick;
    addArrow(from: number[], to: number[]): void;
    redrawInfo(): void;
    displayInfo(text: string, target: TransformNode): void;
    clearInfo(): void;
    addLabel(text: string, position?: number[]): number;
    addLabels(labelList: [[number, number, number, string]]): void;
    private _editLabelText;
    private _removeLabel;
    exportLabels(): any[];
    fixLabels(): void;
    unfixLabels(): void;
}
export {};
