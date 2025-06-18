import { create3D, view3D } from "./view3D.js";
import { create2D } from "./view2D.js";
import ObjectForm from "./Form.svelte";
import { createTreeNode } from "./viewTreeNode";
import ObjectDetail from "./Detail.svelte";

export const BaseObject = {
    get3DView: view3D,
    get3DObject: create3D,
    get2DView: create2D,
    Form: ObjectForm,
    getTreeNode: createTreeNode,
    Detail: ObjectDetail
};
