import * as THREE from "three";
import AText from "$lib/AText.js";
import {graph} from "../../../stores/store.js";

function createLayerBox(layer, parentGroup, options = {}) {
    if(layer._object3D) {
        return layer._object3D;
    }
    const {
        width = 100, height = 50, depth = 20,
        fontSize = 20, color = "#5555ff",
        position = { x: 0, y: 0, z: 0 }
    } = options;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color});
/*    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        depthTest: true,
        alphaTest: 0,
        reflectivity: 0.2,
        thickness: 6,
        metalness: 0,
        side: THREE.DoubleSide
    });

 */
    const box = new THREE.Mesh(geometry, material);

    // Set position of the box
    box.position.set(position.x, position.y, position.z);
    box.userData.layer = layer; // Store layer data for later reference

    layer._object3D = box;
    // Add a label (optional)
    parentGroup.add(box);
    AText.view3D({text: layer.name, color: "#ffffff", parent: box, width: width, verticalAlign: 'top', size: fontSize});
    return box;
}

function createLayersRecursively(layers, parentGroup, level = 0, position = { x: 0, y: 0 }) {
    const baseWidth = 500;
    const baseHeight = 500;
    const spacing = 20;

    let xOffset = position.x - ((layers.length - 1) / 2) * (baseWidth + spacing);

    layers.forEach((layer) => {
        const color = layer.color || _getRandomColor();
        createLayerBox(layer, parentGroup, {
            width: baseWidth,
            height: baseHeight,
            depth: 50,
            color: color,
            position: { x: xOffset, y: position.y, z: 0 }
        });
        // Create children recursively
        if(level > 1) {
            if (layer._children && Object.keys(layer._children).length > 0) {
                _getLayerObjects(layer, {
                    spacing: spacing,
                    width: baseWidth,
                    height: baseHeight,
                    color: _lightenColor(color, 0.20),
                    opacity: 1,
                    fontSize: 20 * 0.75
                },
                    level,
                    currentLevel+1
                );
            }
        }

        xOffset += baseWidth + spacing;
    });
    graph.subscribe((value) => value.fitCameraToScene(0.5));
}
function _getLayerObjects(layer, config, level, currenLevel) {
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
        createLayerBox(sublayer, layer._object3D, {
            width: mywidth,
            height: myheight,
            depth: 200 ,
            color: sublayer.color || config.color,
            position: { x: x + config.spacing / 1.1, y: y, z: 10 }
        });

        if (sublayer.layers && currentLevel < level) {
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
            _getLayerObjects(sublayer, subConfig, level, currenLevel+1);
        }
    }
}

import { layerNodes } from "../../../stores/layerStore";
export function create3DDefault(graphObj, level) {
    const rootGroup = new THREE.Group();
    graphObj.add(rootGroup);
    layerNodes.subscribe((layers) => {
        let topLayer = {
            name: "GEAR",
            id: "GEAR",
            _object3D: rootGroup,
            layers: Object.values(layers),
        }
        _getLayerObjects(topLayer, {
            spacing: 10,
            width: 3000,
            height: 1000,
            color: "#cccccc",
            opacity: 1,
            fontSize: 20,
        },
            level,
            0,
            );
        graphObj.fitCameraToScene(0.5);
        // createLayersRecursively(Object.values(layers), rootGroup, 2);
    });
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