import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3, Axis} from "@babylonjs/core/Maths/math";
import { PlaneBuilder } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Rectangle, TextBlock } from "@babylonjs/gui/2D/controls";

export class LabelManager {
    private _canvas: HTMLCanvasElement;
    private _scene: Scene;
    private _ymax: number;
    private _camera: ArcRotateCamera;
    private _labelControlBox: HTMLDivElement;
    private _editLabelContainer: HTMLDivElement;
    private _editLabelForms: HTMLDivElement[] = [];
    private _addLabelTextInput: HTMLInputElement;
    private _labels: Mesh[] = [];
    private _labelBackgrounds: Rectangle[] = [];
    private _labelTexts: TextBlock[] = [];
    private _showLabels: boolean = false;
    private _labelSize: number = 100;

    fixed: boolean = false;

    constructor(canvas: HTMLCanvasElement, scene: Scene, ymax: number, camera: ArcRotateCamera) {
        this._canvas = canvas;
        this._scene = scene;
        this._ymax = ymax;
        this._camera = camera;
        this._createLabelForms();
    }

    private _createLabelForms() {
        let labelBox = document.createElement("div");
        labelBox.className = "bbp label-control";
        labelBox.style.display = "none";
        labelBox.style.top = this._canvas.clientTop + 40 + "px";
        labelBox.style.left = this._canvas.clientTop + 5 + "px";
        let addLabelForm = document.createElement("div");
        addLabelForm.className = "label-form";
        let addLabelLabel = document.createElement("label");
        addLabelLabel.innerText = "Label Text:";
        addLabelLabel.htmlFor = "addLabelInput";
        let addLabelInput = document.createElement("input");
        addLabelInput.name = "addLabelInput";
        addLabelInput.type = "text";
        this._addLabelTextInput = addLabelInput;
        let addLabelBtn = document.createElement("button");
        addLabelBtn.innerText = "Add Label";
        addLabelBtn.onclick = this._addLabelBtnClick.bind(this);
        addLabelForm.appendChild(addLabelLabel);
        addLabelForm.appendChild(addLabelInput);
        addLabelForm.appendChild(addLabelBtn);
        labelBox.appendChild(addLabelForm);
        let editLabelContainer = document.createElement("div");
        editLabelContainer.className = "edit-container";
        editLabelContainer.style.maxHeight = (this._canvas.height - 100).toString() + "px";
        labelBox.appendChild(editLabelContainer);
        this._editLabelContainer = editLabelContainer;
        this._labelControlBox = labelBox;
        this._canvas.parentNode.appendChild(labelBox);
    }

    update() {
        if (this._showLabels) {
            // draw 3d labels in plot
            let axis1 = Vector3.Cross(this._camera.position, Axis.Y);
            let axis2 = Vector3.Cross(axis1, this._camera.position);
            let axis3 = Vector3.Cross(axis1, axis2);
            for (let i = 0; i < this._labels.length; i++) {
                this._labels[i].rotation = Vector3.RotationFromAxis(axis1, axis2, axis3);
            }

            if (!this.fixed) {
                // highlighting label under mouse cursor
                const meshUnderPointer = this._scene.meshUnderPointer as Mesh;
                const labelIdx = this._labels.indexOf(meshUnderPointer)
                if (labelIdx != -1) {
                    for (let i = 0; i < this._labelBackgrounds.length; i++) {
                        if (i != labelIdx) {
                            this._labelBackgrounds[i].alpha = 0;
                        }
                    }
                    this._labelBackgrounds[labelIdx].alpha = 1;
                } else {
                    for (let i = 0; i < this._labelBackgrounds.length; i++) {
                        this._labelBackgrounds[i].alpha = 0;
                    }
                }
            }
        }
    }

    toggleLabelControl() {
        if (this._labelControlBox.style.display == "none") {
            this._labelControlBox.style.display = "block";
            this.unfixLabels();
        } else {
            this._labelControlBox.style.display = "none";
            this.fixLabels();
        }
    }

    private _addLabelBtnClick(event: Event) {
        event.preventDefault();
        this.addLabel(this._addLabelTextInput.value);
    }

    /**
     * Add a 3d label to the plot
     * @param text Label title
     * @param [moveCallback] On dragging of label in 3d plot, the final position will be passed to this function
     */
    addLabel(text: string, position?: number[]): number {
        this._addLabelTextInput.value = "";
        let labelIdx = this._labels.length;
        let plane = PlaneBuilder.CreatePlane('label_' + labelIdx, {
            width: 5,
            height: 5
        }, this._scene);

        if (position) {
            let pos = Vector3.FromArray(position)
            plane.position = pos;
        } else {
            plane.position.y = this._ymax + 2;
        }

        let advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        let background = new Rectangle();
        background.color = "red";
        background.alpha = 0
        advancedTexture.addControl(background);
        this._labelBackgrounds.push(background);

        let textBlock = new TextBlock();
        textBlock.text = text;
        textBlock.color = "black";
        textBlock.fontSize = this._labelSize;
        advancedTexture.addControl(textBlock);
        this._labelTexts.push(textBlock);

        if (!this.fixed) {
            this.makeDraggable(plane);
        }

        this._labels.push(plane);

        let labelNum = this._labels.length - 1;

        let editLabelForm = document.createElement("div");
        editLabelForm.className = "label-form";
        let editLabelLabel = document.createElement("label");
        editLabelLabel.innerText = "Edit Label Text:";
        editLabelLabel.htmlFor = "editLabelInput";
        editLabelForm.appendChild(editLabelLabel);
        let editLabelInput = document.createElement("input");
        editLabelInput.name = "editLabelInput";
        editLabelInput.type = "text";
        editLabelInput.value = text;
        editLabelInput.dataset.labelnum = labelNum.toString();
        editLabelInput.onkeyup = this._editLabelText.bind(this);
        editLabelForm.appendChild(editLabelInput);
        let rmvLabelBtn = document.createElement("button");
        rmvLabelBtn.innerText = "Remove Label"
        rmvLabelBtn.onclick = this._removeLabel.bind(this);
        rmvLabelBtn.dataset.labelnum = labelNum.toString();
        editLabelForm.appendChild(rmvLabelBtn);
        editLabelForm.dataset.labelnum = labelNum.toString();
        this._editLabelForms.push(editLabelForm);
        this._editLabelContainer.appendChild(editLabelForm);

        this._showLabels = true;
        return labelIdx;
    }

    private makeDraggable(label: Mesh) {
        let labelDragBehavior = new PointerDragBehavior();
        label.addBehavior(labelDragBehavior);
    }

    /**
     * Add multiple labels from a list of labels.
     * 
     * @param labelList List of lists with the first three elements of the inner lists being the x, y and z coordinates, and the fourth the label text.
     */
    addLabels(labelList: [[number, number, number, string]]): void {
        for (let i = 0; i < labelList.length; i++) {
            const label = labelList[i];
            let text = label[3];
            let position = label.slice(0, 3) as number[];
            this.addLabel(text, position);
        }
    }

    private _editLabelText(ev: Event): void {
        let inputElem = ev.target as HTMLInputElement;
        this._labelTexts[parseInt(inputElem.dataset.labelnum)].text = inputElem.value;
    }

    private _removeLabel(ev: Event) {
        let btn = ev.target as HTMLButtonElement;
        let labelNum = parseInt(btn.dataset.labelnum);
        this._labelTexts[labelNum].dispose();
        this._labelTexts.splice(labelNum, 1);
        this._labelBackgrounds[labelNum].dispose();
        this._labelBackgrounds.splice(labelNum, 1);
        this._labels[labelNum].dispose();
        this._labels.splice(labelNum, 1);
        let thisForm: HTMLDivElement;
        this._editLabelForms.forEach(eLabelForm => {
            if (parseInt(eLabelForm.dataset.labelnum) == labelNum) {
                thisForm = eLabelForm;
            } else if (parseInt(eLabelForm.dataset.labelnum) > labelNum) {
                let oldNum = parseInt(eLabelForm.dataset.labelnum)
                let newNum = (oldNum - 1).toString()
                eLabelForm.dataset.labelnum = newNum;
                let oInput = eLabelForm.querySelector('input[data-labelnum="' + oldNum + '"]') as HTMLInputElement;
                oInput.dataset.labelnum = newNum;
                let oBtn = eLabelForm.querySelector('button[data-labelnum="' + oldNum + '"]') as HTMLButtonElement;
                oBtn.dataset.labelnum = newNum;
            }
        });
        thisForm.parentNode.removeChild(thisForm);
    }

    exportLabels() {
        let labels = [];
        for (let i = 0; i < this._labelTexts.length; i++) {
            const lText = this._labelTexts[i].text;
            const lPos = this._labels[i].position;
            labels.push([lPos.x, lPos.y, lPos.z, lText]);
        }
        return labels;
    }

    fixLabels() {
        for (let i = 0; i < this._labels.length; i++) {
            const label = this._labels[i];
            label.removeBehavior(label.getBehaviorByName("PointerDrag"));
        }
        this.fixed = true;
    }

    unfixLabels() {
        for (let i = 0; i < this._labels.length; i++) {
            const label = this._labels[i];
            this.makeDraggable(label);
        }
        this.fixed = false;
    }

}