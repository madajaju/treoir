import AText from '../js/ailtire/AText.js';

export default class GElementView {
    static default = {
        fontSize: 6,
        height: 10,
        width: 50,
        depth: 5,
        opacity: 0.5
    }

    static view3D(obj) {
        let width = obj.width || GElementView.default.width;
        let height = obj.height || GElementView.default.height;
        let depth = obj.depth || GElementView.default.depth;
        let color = obj.color || GElementView.default.color;
        let opacity = obj.opacity || GElementView.default.opacity;

        let shape = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            depthTest: true,
            alphaTest: 0,
            reflectivity: 0.2,
            thickness: 6,
            side: THREE.DoubleSide
        });
        let group = new THREE.Mesh(shape, material);
        let labelText = obj.name;
        let fontSize = obj.fontSize || GElementView.default.fontSize;

        let nameArray = labelText.split(/\s/).map(item => {
            return item.length;
        });
        let maxLetters = nameArray.reduce(function (a, b) {
            return Math.max(a, b);
        }, -Infinity);
        let textWidth = maxLetters * (fontSize / 1);
        if (textWidth > obj.width) {
            fontSize = fontSize * obj.width / textWidth;
        }

        let label = AText.view3D({
            text: labelText,
            color: "#ffffff",
            width: obj.width,
            size: fontSize
        });
        let labelh = (height / 2) - (fontSize);
        label.position.set(0, labelh, depth / 2 + 1);
        label.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1));
        group.add(label);
        group.width = GElementView.default.width;
        group.height = GElementView.default.height;
        if (obj.rotate) {
            if (obj.rotate.x) {
                group.applyMatrix4(new THREE.Matrix4().makeRotationX(obj.rotate.x));
            }
            if (obj.rotate.y) {
                group.applyMatrix4(new THREE.Matrix4().makeRotationY(obj.rotate.y));
            }
            if (obj.rotate.z) {
                group.applyMatrix4(new THREE.Matrix4().makeRotationZ(obj.rotate.z));
            }
        }
        return group;

    }

    static viewMap3D(obj) {
        let width = obj.width || 5;
        let height = obj.height || 5;
        let depth = obj.depth || 5;
        let color = obj.color || GElementView.default.color;
        let opacity = obj.opacity || GElementView.default.opacity;

        let shape = new THREE.SphereGeometry(width);
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            depthTest: true,
            alphaTest: 0,
            reflectivity: 0.2,
            thickness: 6,
            side: THREE.DoubleSide
        });
        let group = new THREE.Mesh(shape, material);
        let labelText = obj.name;
        let fontSize = obj.fontSize || GElementView.default.fontSize;

        let nameArray = labelText.split(/\s/).map(item => {
            return item.length;
        });
        let maxLetters = nameArray.reduce(function (a, b) {
            return Math.max(a, b);
        }, -Infinity);
        let textWidth = maxLetters * (fontSize / 1);
        if (textWidth > obj.width) {
            fontSize = fontSize * obj.width / textWidth;
        }

        let label = AText.view3D({
            text: labelText,
            color: "#ffffff",
            width: obj.width,
            size: fontSize
        });
        let labelh = (width / 2) - (fontSize);
        label.position.set(0, labelh, width + 1);
        label.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1));
        group.add(label);
        group.width = GElementView.default.width;
        group.height = GElementView.default.height;
        if (obj.rotate) {
            if (obj.rotate.x) {
                group.applyMatrix4(new THREE.Matrix4().makeRotationX(obj.rotate.x));
            }
            if (obj.rotate.y) {
                group.applyMatrix4(new THREE.Matrix4().makeRotationY(obj.rotate.y));
            }
            if (obj.rotate.z) {
                group.applyMatrix4(new THREE.Matrix4().makeRotationZ(obj.rotate.z));
            }
        }
        return group;
    }

    static expand(node) {

    }
}