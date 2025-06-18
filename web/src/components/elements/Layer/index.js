import { create3D, view3D } from "./view3D.js";
import { create2D, selectLayer } from "./view2D.js";
import { create2DDefault } from "./view2DDefault.js";
import { create3DDefault } from "./view3DDefault.js";
import ElementForm from "./Form.svelte";
import { createTreeNode } from "./viewTreeNode";
import ElementDetail from "./Detail.svelte";
import Picker from "./Picker.svelte";

export const Layer = {
    get3DView: view3D,
    get3DObject: create3D,
    get2DView: create2D,
    selectLayer: selectLayer,
    Form: ElementForm,
    Picker: Picker,
    getTreeNode: createTreeNode,
    Detail: ElementDetail,
    default2DView: create2DDefault,
    default3DView: create3DDefault,
};
