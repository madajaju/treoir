import AText from '../js/ailtire/AText.js';

export default class GLogicalLayerView {
    static default = {
        fontSize: 15,
        height: 100,
        width: 500,
        color: "#008800",
        depth: 10,
    }
    static view3D(config) {
        let node = {
            name: "Digital Architecture",
            description: "Digital Architecture consists of software stacks."
        }
        let shape = new THREE.BoxGeometry(GLogicalLayerView.default.width, GLogicalLayerView.default.height, GLogicalLayerView.default.depth);
        let opacity = 1;
        const material = new THREE.MeshPhysicalMaterial({
            color: GLogicalLayerView.default.color,
            transparent: true,
            opacity: opacity,
            depthTest: true,
            alphaTest: 0,
            reflectivity: 0.2,
            thinkness: 6,
            metalness: 0,
            side: THREE.DoubleSide
        });
        let group = new THREE.Mesh(shape, material);
        let labelText = node.name;
        let label = AText.view3D({
            text: labelText,
            color: "#ffffff",
            width: node.width,
            size: GLogicalLayerView.default.fontSize,
        });
        label.position.set(0,0, GLogicalLayerView.default.depth/2 +1);
        label.applyMatrix4(new THREE.Matrix4().makeScale(1,1,1));
        group.add(label);
        group.width = GLogicalLayerView.default.width;
        group.height = GLogicalLayerView.default.height;
        return group;
    }
    static expand(node) {

    }
}