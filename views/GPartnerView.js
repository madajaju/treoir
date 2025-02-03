import AText from '../js/ailtire/AText.js';
import GElementView from "./GElementView.js";

export default class GPartnerView {
    static default = {
        fontSize: 15,
        height: 100,
        width: 100,
        depth: 10,
        opacity: 0.5
    }
    static showDetail(node) {

    }
    static showPartnerList(panel, partners) {
        let records = [];
        let i = 0;
        for(let pname in partners) {
            let recid = i++; // needs to be in order?
            let partner = partners[pname];
            let eRecords = [];
            for(let ename in partner.elements) {
                let element = partner.elements[ename];
                eRecords.push({
                    recid: i++,
                    name: element.name,
                    description: element.description,
                })
            }
            records.push({
                recid: recid,
                name: partner.name,
                description: partner.description,
                w2ui: {
                    children: eRecords
                }
            });
        }
        if(w2ui.partnerList) {
            w2ui['partnerList'].destroy();
        }
        $().w2grid({
            name: 'partnerList',
            columns: [
                { field: 'name', text: 'Name', size: '30%', sortable: true },
                { field: 'description', text: 'Description', size: '70%' }
            ],
            records: records,
        });
        $(panel).w2render("partnerList");
        w2ui['partnerList'].reload();

    }
    static viewDeep3D(objects) {
        let data = { nodes: {}, links: []};
        const width = 500;
        const height = 500;
        const spacing = 20;

        const rotate = {
            "top": { x: -Math.PI/2 },
            "bottom": { x: Math.PI/2 },
            "left": { y: -Math.PI/2 },
            "right": { y: Math.PI/2 },
            "front": { z: 0 },
            "back": { y: Math.PI}
        }
        const position = {
            "top": { fx: 0, fy: height/2, fz: 0 },
            "bottom": { fx: 0, fy: -height/2, fz: 0 },
            "left": { fx: -width/2, fy: 0, fz: 0 },
            "right": { fx: width/2, fy: 0, fz: 0 },
            "front": { fx: 0, fy: 0, fz: width/2 },
            "back": {fx: 0, fy:0, fz: -width/2}
        }
        const orientation = {
            "top": { x: 0, y: 1, z: 0 },
            "bottom": { x: 0, y: -1, z: 0 },
            "left": { x: -1, y: 0, z: 0 },
            "right": { x: 1, y: 0, z: 0 },
            "front": { x: 0, y: 0, z: 1 },
            "back": {x: 0, y:0, z: -1}
        }
        for(let pname in objects) {
            let partner = objects[pname];
            data.nodes[pname] = {
                id: pname,
                name: pname,
                description: partner.description,
                color: partner.color || '#888888',
                opacity: 0.3,
                view: GPartnerView.view3D,
                rotate: rotate["top"],
                orientation: orientation["top"],
                fy: position["top"].fy + 30,
                x: { min: -width/2, max: width/2},
                z: { min: -width/2, max: width/2},
                width: width,
                height: height,
                showDetail: GPartnerView.showDetail,
            }
            for(let ename in partner.elements) {
                let element = partner.elements[ename];
                let eid = `${pname}-${ename}`;
                data.nodes[eid] = {
                    id: eid,
                    name: ename,
                    description: element.description,
                    color: element.color || partner.color,
                    opacity: 1,
                    view: GElementView.view3D,
                    showDetail: GElementView.showDetail,
                    orientation: orientation["top"],
                    rotate: rotate["top"],
                    fy: position["top"].fy + 20,
                    x: { min: -width/2, max: width/2},
                    y: { min: -width/2, max: width/2},
                }
                // Find the layers it belongs.
                for(let i in element.layers) {
                    let peid = `${eid}-${i}`;
                    data.nodes[peid] = {
                        id: peid,
                        name: ename,
                        description: element.description,
                        color: element.color || partner.color,
                        opacity: 1,
                        view: GElementView.viewMap3D,
                        showDetail: GElementView.showDetail,
                        rbox: {
                            parent: element.layers[i],
                            fz: 10,
                            x: {min: -10, max: 10},
                            y: {min: -10, max: 10},
                        },
                    }
                    data.links.push({
                        target: peid,
                        source: eid,
                        width: 1.0,
                        value: 10,
                        color: '#cccccc',
                    });
                }
                data.links.push({
                    target: eid,
                    source: pname,
                    width: 0,
                    value: 0,
                    color: '#cccccc',
                });
            }
        }
        window.graph.addData(data.nodes, data.links);
    }
    static calculateBox(node) {
        let fontSize = node.fontSize || GPartnerView.default.fontSize;
        let nameArray = node.name.split(/\s/).map(item => {
            return item.length;
        });
        let maxLetters = nameArray.reduce(function (a, b) {
            return Math.max(a, b);
        }, -Infinity);
        let height = (nameArray.length * fontSize) / 2 + 10;
        let width = maxLetters * (fontSize / 2) + 20;
        let depth = GPartnerView.default.depth;
        let radius = Math.sqrt(width * width + height * height + depth * depth) / 2;
        return {w: width, h: height * 2, d: depth, r: radius};
    }
    static view3D(obj) {
        let color = obj.color || GPartnerView.default.color;
        let opacity = obj.opacity || GPartnerView.default.opacity;
        let size = GPartnerView.calculateBox(obj);
        let height = size.h;
        let width = size.w;
        let shape = new THREE.SphereGeometry(1);
        shape.applyMatrix4(new THREE.Matrix4().makeScale(width, height, size.d));
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
        let fontSize = obj.fontSize || GPartnerView.default.fontSize;

        let nameArray = labelText.split(/\s/).map(item => {
            return item.length;
        });
        let maxLetters = nameArray.reduce(function (a, b) {
            return Math.max(a, b);
        }, -Infinity);
        let textWidth = maxLetters * (fontSize / 1);
        if(textWidth > obj.width) {
            fontSize = fontSize * obj.width/textWidth;
        }

        let label = AText.view3D({
            text: labelText,
            color: "#ffffff",
            width: obj.width,
            size: fontSize
        });
        let labelh = (height/2) - (fontSize);
        label.position.set(0,labelh, size.d/2 +5);
        label.applyMatrix4(new THREE.Matrix4().makeScale(1,1,1));
        group.add(label);
        group.width = GPartnerView.default.width;
        group.height = GPartnerView.default.height;
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
    static showList(panel, parent) {
        $.ajax({
            url: './partner/list',
            success: (results) => {
                _getPartnerList(panel, results);
            }
        });
    }
}
function _getPartnerList(panel,partners) {
    let nodes = [];
    for(let pname in partners) {
        let partner = partners[pname];
        let lid = pname;
        let snode = {
            id: lid,
            text: pname,
            description: partner.description,
            object: partner,
            type: 'Partner',
            nodes: []
        }
        nodes.push(snode);
    }
    w2ui[panel].add(nodes);
    for(let pname in partners) {
        let partner = partners[pname];
        let snodes = [];
        for (let ename in partner.elements) {
            let element = partner.elements[ename];
            let lid = `${pname}-${ename}`;
            let snode = {
                id: lid,
                text: ename,
                description: element.description,
                object: element,
                type: 'Element',
            }
            snodes.push(snode);
        }
        w2ui[panel].add(pname, snodes);
    }
}