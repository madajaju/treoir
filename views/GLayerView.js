import AText from '../js/ailtire/AText.js';
import AFittedText from './AFittedText.js';
import GPartnerView from "./GPartnerView.js";

export default class GLayerView {
    static default = {
        fontSize: 15,
        height: 500,
        width: 500,
        depth: 10,
        opacity: 0.5
    }

    static showDetailForm(node) {
        // Select or create the container where the card UI will render
        const objList = document.getElementById('objlist');
        if (!objList) {
            console.error('The #objlist container is not found.');
            return;
        }

        // Clear existing content in the container
        objList.innerHTML = '';

        // Create the card container
        const card = document.createElement('div');
        card.style.cssText = 'border: 1px solid #ddd; padding: 10px; border-radius: 8px; background-color: #fff; width: 100%; font-family: Arial, sans-serif;';

        // Add card header
        const header = document.createElement('h2');
        header.style.cssText = 'font-size: 16px; color: #333; margin-top: 5px; margin-bottom: 5px;';
        header.innerText = node.name;
        card.appendChild(header);

        // Description section
        const descriptionContainer = document.createElement('div');
        descriptionContainer.style.cssText = 'margin-bottom: 10px;';

        const descriptionText = document.createElement('p');
        descriptionText.id = 'cardDescription';
        descriptionText.style.cssText = 'margin: 5px 0 0; color: #333; font-size: 14px;';
        descriptionContainer.appendChild(descriptionText);

        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggleDescription';
        toggleButton.style.cssText = 'background: none; border: none; color: #007bff; font-size: 12px; cursor: pointer; padding: 0; margin-top: 5px;';
        toggleButton.innerText = 'Read More';
        descriptionContainer.appendChild(toggleButton);

        card.appendChild(descriptionContainer);

        // Layers section
        const layersContainer = document.createElement('div');

        const layersLabel = document.createElement('h3');
        layersLabel.style.cssText = 'font-size: 14px; color: #555; margin: 0;';
        layersLabel.innerText = 'Sublayers';
        layersContainer.appendChild(layersLabel);

        const layersList = document.createElement('ul');
        layersList.id = 'cardLayers';
        layersList.style.cssText = 'list-style: none; padding: 0; margin: 5px 0 0;';
        layersContainer.appendChild(layersList);

        card.appendChild(layersContainer);

        // Append card to the container
        objList.appendChild(card);

        // Populate data for the card
        const layers = node.layers || {};
        const fullDescription = node.description || 'No description available.';

        // Populate the description (with toggle functionality)
        const truncatedDescription = fullDescription.length > 100
            ? `${fullDescription.substring(0, 100)}...`
            : fullDescription;

        let isExpanded = false;

        descriptionText.innerText = truncatedDescription; // Default to truncated description
        toggleButton.style.display = fullDescription.length > 100 ? 'inline' : 'none'; // Hide toggle if not needed

        toggleButton.onclick = () => {
            isExpanded = !isExpanded;
            descriptionText.innerText = isExpanded ? fullDescription : truncatedDescription;
            toggleButton.innerText = isExpanded ? 'Read Less' : 'Read More';
        };

        // Populate the layers (clickable with icons)
        layersList.innerHTML = ''; // Clear any existing layers
        if (Object.keys(layers).length === 0) {
            const noLayersItem = document.createElement('li');
            noLayersItem.style.cssText = 'color: #999;';
            noLayersItem.innerText = 'No layers available.';
            layersList.appendChild(noLayersItem);
        } else {
            Object.keys(layers).forEach(layer => {
                const layerItem = document.createElement('li');
                layerItem.style.cssText = 'padding: 5px 0; cursor: pointer; color: #007bff; display: flex; align-items: center;';

                // Add layer name
                const layerName = document.createElement('span');
                layerName.innerText = layer;
                layerItem.appendChild(layerName);

                function expandParentNodes(nodeId) {
                    const node = w2ui['sidebar'].get(nodeId);
                    if(node && node.parent) {
                        w2ui['sidebar'].expand(node.parent.id);
                        expandParentNodes(node.parent);
                    }
                }
                // Layer click event
                layerItem.onclick = () => {
                    expandParentNodes(layers[layer].id);
                    w2ui['sidebar'].select(layers[layer].id);
                    window.graph.selectNodeByID(layers[layer].id);
                };

                layersList.appendChild(layerItem);
            });
        }
    }

    static showDetail(node) {
        if(node) {
            GLayerView.showDetailForm(node);
            $.ajax({
                url: './layer/partners',
                data: {
                    id: node.id
                },
                success: (results) => {
                    GPartnerView.showPartnerList('#objdetail', results);
                }
            });
        }
    }

    static viewDeep3D(objects) {
        let data = {nodes: {}, links: []};
        const width = 500;
        const height = 500;
        const spacing = 20;

        const rotate = {
            "top": {x: -Math.PI / 2},
            "bottom": {x: Math.PI / 2},
            "left": {y: -Math.PI / 2},
            "right": {y: Math.PI / 2},
            "front": {z: 0},
            "back": {y: Math.PI}
        }
        const position = {
            "top": {fx: 0, fy: height / 2, fz: 0},
            "bottom": {fx: 0, fy: -height / 2, fz: 0},
            "left": {fx: -width / 2, fy: 0, fz: 0},
            "right": {fx: width / 2, fy: 0, fz: 0},
            "front": {fx: 0, fy: 0, fz: width / 2},
            "back": {fx: 0, fy: 0, fz: -width / 2}
        }
        const orientation = {
            "top": {x: 0, y: 1, z: 0},
            "bottom": {x: 0, y: -1, z: 0},
            "left": {x: -1, y: 0, z: 0},
            "right": {x: 1, y: 0, z: 0},
            "front": {x: 0, y: 0, z: 1},
            "back": {x: 0, y: 0, z: -1}
        }
        for (let lname in objects) {
            let layer = objects[lname];
            data.nodes[lname] = {
                id: lname,
                name: lname,
                description: layer.description,
                color: layer.color,
                opacity: 0.5,
                view: GLayerView.view3D,
                showDetail: GLayerView.showDetail,
                rotate: rotate[layer.orientation],
                fx: position[layer.orientation].fx,
                fy: position[layer.orientation].fy,
                fz: position[layer.orientation].fz,
                orientation: orientation[layer.orientation],
                layers: layer.layers,
                width: width,
                height: height
            }
            let config = {
                spacing: spacing,
                width: width,
                height: height,
                id: lname,
                rotate: rotate[layer.orientation],
                orientation: orientation[layer.orientation],
                color: _lightenColor(layer.color, 0.20),
                opacity: 1,
                fontSize: GLayerView.default.fontSize * 0.75,
            }
            _getLayerObjects(layer, data, config);
        }
        window.graph.setData(data.nodes, data.links);
    }

    static view3D(obj, type) {
        let width = obj.width || GLayerView.default.width;
        let height = obj.height || GLayerView.default.height;
        let depth = obj.depth || GLayerView.default.depth;
        let color = obj.color || GLayerView.default.color;
        let opacity = obj.opacity || GLayerView.default.opacity;

        if (type === 'Selected') {
            color = "yellow";
        } else if (type === 'Targeted') {
            color = "red";
        } else if (type === 'Sourced') {
            color = "green";
        }
        let shape = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            depthTest: true,
            alphaTest: 0,
            reflectivity: 0.2,
            thickness: 6,
            metalness: 0,
            side: THREE.DoubleSide
        });
        let group = new THREE.Mesh(shape, material);
        let labelText = obj.name;
        let fontSize = obj.fontSize || GLayerView.default.fontSize;

        AFittedText.view(labelText, group, {
            color: "#ffffff",
            maxFontSize: fontSize,
            position: 'top',
            offset: { x: 0, y: 1, z: 0 }
        });
        group.width = GLayerView.default.width;
        group.height = GLayerView.default.height;
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
            url: './layer/list',
            success: (results) => {
                _getLayerList(panel, '', results);
            }
        });
    }
}

function _getLayerList(panel, parent, layers) {
    let nodes = [];
    for (let lname in layers) {
        let sublayer = layers[lname];
        let lid = lname;
        if (parent) {
            lid = `${parent}-${lname}`;
        }
        let snode = {
            id: lid,
            text: lname,
            description: sublayer.description,
            object: sublayer,
            type: 'Layer',
        }
        if (sublayer.layers) {
            snode.nodes = [];
        }
        nodes.push(snode);
    }
    if (parent) {
        w2ui[panel].add(parent, nodes);
    } else {
        w2ui[panel].add(nodes);
    }
    // Now go down the sublayers.
    // This cannot happen above because the parent nodes must exists first.
    for (let lname in layers) {
        let sublayer = layers[lname];
        let lid = lname;
        if (parent) {
            lid = `${parent}-${lname}`;
        }
        if (sublayer.layers) {
            _getLayerList(panel, lid, sublayer.layers);
        }
    }
}

function _getLayerObjects(layer, data, config) {
    // First calculate the rows and cols
    let totalRows = 1;
    let totalCols = 1;
    for (let i in layer.layers) {
        let sublayer = layer.layers[i];
        totalRows = Math.max(totalRows, sublayer.position.row + (sublayer.position.rowspan || 1) - 1);
        totalCols = Math.max(totalCols, sublayer.position.col + (sublayer.position.colspan || 1) - 1);
    }
    const totalHorizontalSpacing = (totalCols + 1) * config.spacing;
    const totalVerticalSpacing = ((totalRows + 1) * config.spacing) + 2 * config.fontSize;

    const adjustParentWidth = config.width - totalHorizontalSpacing;
    const adjustParentHeight = config.height - totalVerticalSpacing;

    const cellWidth = adjustParentWidth / totalCols;
    const cellHeight = adjustParentHeight / totalRows;
    const parentOffsetX = (config.width / 2);
    const parentOffsetY = (config.height / 2) - 3 * config.fontSize;

    for (let lname in layer.layers) {
        let lid = `${config.id}-${lname}`;
        let sublayer = layer.layers[lname];
        let colspan = sublayer.position.colspan || 1;
        let rowspan = sublayer.position.rowspan || 1;
        let mywidth = (colspan * cellWidth) + ((colspan - 1) * config.spacing);
        let myheight = (rowspan * cellHeight) + ((rowspan - 1) * config.spacing);
        let middleCol = sublayer.position.col + (colspan - 1) / 2;
        let middleRow = sublayer.position.row + (rowspan - 1) / 2;
        let x = (middleCol - 1) * (cellWidth + config.spacing) + cellWidth / 2;
        let y = -((middleRow - 1) * (cellHeight + config.spacing) + cellHeight / 2);
        // Now offset based on the myWidth
        x -= parentOffsetX;
        y += parentOffsetY;
        let pos = {
            fx: x + config.spacing / 1.1,
            fy: y,
            fz: 5,
            width: mywidth,
            height: myheight
        }
        data.nodes[lid] = {
            id: lid,
            name: lname,
            description: sublayer.description,
            color: sublayer.color || config.color,
            opacity: config.opacity,
            fontSize: config.fontSize,
            view: GLayerView.view3D,
            showDetail: GLayerView.showDetail,
            rotate: config.rotate,
            orientation: config.orientation,
            layers: sublayer.layers,
            rbox: {
                parent: config.id,
                fx: pos.fx,
                fy: pos.fy,
                fz: pos.fz
            },
            width: pos.width,
            height: pos.height,
        }

        if (sublayer.layers) {
            let subConfig = {
                spacing: config.spacing / 2,
                width: pos.width,
                height: pos.height,
                id: lid,
                rotate: config.rotate,
                orientation: config.orientation,
                color: _lightenColor(sublayer.color, 0.20),
                opacity: 1,
                fontSize: config.fontSize * 0.75,
            }
            _getLayerObjects(sublayer, data, subConfig);
        }
    }
}

function _lookAtLayer(layer) {
    windows.graph.selectNode(layer.id);
    // Create bounding box and get its size to calculate dimensions
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size); // Get the size of the object
    box.getCenter(objectCenter); // Center of the object

// Optional: Move the camera farther away so the object fits in the view
    const maxDim = Math.max(size.x, size.y, size.z); // Largest dimension of the object
    const fov = camera.fov * (Math.PI / 180); // Convert vertical FOV to radians
    const cameraDistance = maxDim / (2 * Math.tan(fov / 2)); // Distance required to fit object

// Set the camera position (e.g., along the Z-axis)
    camera.position.set(objectCenter.x, objectCenter.y, objectCenter.z + cameraDistance);

// Make the camera look at the object's center
    camera.lookAt(objectCenter);
}
function _lightenColor(hex, percent) {
    // Convert hex color to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate the amount of lightening
    const newR = Math.min(255, r + (255 - r) * percent / 100);
    const newG = Math.min(255, g + (255 - g) * percent / 100);
    const newB = Math.min(255, b + (255 - b) * percent / 100);

    // Convert back to hex format
    return (
        "#" +
        [newR, newG, newB]
            .map(value => Math.round(value).toString(16).padStart(2, '0'))
            .join("")
    );
}