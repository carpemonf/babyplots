import { Scene } from "@babylonjs/core/scene";
import { Plot, PlotLegendData } from "./babyplots";
export declare class PointCloud extends Plot {
    private _pointPicking;
    private _selectionCallback;
    private _folded;
    private _foldedEmbedding;
    private _foldVectors;
    private _foldCounter;
    private _foldAnimFrames;
    private _foldVectorFract;
    private _foldDelay;
    constructor(scene: Scene, coordinates: number[][], colorVar: string[], size: number, legendData: PlotLegendData, folded?: boolean, foldedEmbedding?: number[][], foldAnimDelay?: number, foldAnimDuration?: number, xScale?: number, yScale?: number, zScale?: number);
    private _createPointCloud;
    resetAnimation(): void;
    update(): boolean;
}
