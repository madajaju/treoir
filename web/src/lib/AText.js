import { Mesh, MeshBasicMaterial} from 'three';
import * as THREE from "three";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

let loadedFont = null;

export default class AText {
    static view3D(node, type) {
    try {
        const font = getFontSync();

        // Configurable parameters
        const text = node.text || "Default Text";
        const color = node.color || 0xffffff;
        const size = node.size || 1; // Initial font size
        const depth = node.depth || 1;
        const lineHeight = node.lineHeight || 1.2;
        const horizontalAlign = node.horizontalAlign || "center";
        const verticalAlign = node.verticalAlign || "middle";

        let fontSize = size;

        // Create a group to hold the text meshes
        const textGroup = new THREE.Group();

        // Geometry parent bounds
        const parentGeometry = node.parent || null;
        let parentBB = null;
        if (parentGeometry) {
            parentBB = new THREE.Box3().setFromObject(parentGeometry);
        }

        // Parent's bounding box dimensions
        const parentWidth = parentBB ? parentBB.max.x - parentBB.min.x : Infinity;
        const parentHeight = parentBB ? parentBB.max.y - parentBB.min.y : Infinity;
        const parentDepth = parentBB ? parentBB.max.z - parentBB.min.z : Infinity;

        // Max fit dimensions
        const maxWidth = parentWidth || Number.POSITIVE_INFINITY;
        const maxHeight = parentHeight || Number.POSITIVE_INFINITY;

        // Split text by explicit newlines
        const manualLines = text.split("\n");
        let lines = [];

        // Iterate over each line and adjust it to fit
        manualLines.forEach((line) => {
            const geometry = new TextGeometry(line, {
                font: font,
                size: fontSize,
                depth: depth,
                curveSegments: 12,
            });

            geometry.computeBoundingBox();

            const lineWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;

            // Check if the line exceeds maxWidth; reduce font size if necessary
            if (lineWidth > maxWidth) {
                let sizeFactor = maxWidth / lineWidth; // Determine scaling factor
                fontSize *= Math.min(sizeFactor, 0.90); // Reduce font size

                // Recalculate the geometry with the adjusted font size
                const scaledGeometry = new TextGeometry(line, {
                    font: font,
                    size: fontSize,
                    depth: depth,
                    curveSegments: 12,
                });

                scaledGeometry.computeBoundingBox();
                const newLineWidth = scaledGeometry.boundingBox.max.x - scaledGeometry.boundingBox.min.x;

                if (newLineWidth <= maxWidth) {
                    lines.push({ text: line, geometry: scaledGeometry });
                } else {
                    lines.push({ text: line, geometry: scaledGeometry });
                    console.warn(`Line '${line}' still exceeds maxWidth after scaling.`);
                }
            } else {
                lines.push({ text: line, geometry });
            }
        });

        // Add text meshes for each line
        lines.forEach((lineData, index) => {
            const { geometry } = lineData;

            // Horizontal alignment
            let offsetX = 0;
            if (horizontalAlign === "center") {
                offsetX = -(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
            } else if (horizontalAlign === "right") {
                offsetX = -(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            }

            // Vertical offset (line height)
            const offsetY = -index * fontSize * lineHeight;

            // Apply translations
            geometry.translate(offsetX, offsetY, 0);

            // Mesh creation
            const material = new MeshBasicMaterial({ color });
            const lineMesh = new Mesh(geometry, material);

            textGroup.add(lineMesh); // Add to the text group
        });

        // Center or align the text group relative to parent
        if (parentBB) {
            const bbox = new THREE.Box3().setFromObject(textGroup);

            const groupWidth = bbox.max.x - bbox.min.x;
            const groupHeight = bbox.max.y - bbox.min.y;

            // Horizontal positioning
            if (horizontalAlign === "center") {
                textGroup.position.x = 0;
            } else if (horizontalAlign === "right") {
                textGroup.position.x = parentWidth - groupWidth / 2;
            } else {
                textGroup.position.x = -(parentWidth - groupWidth / 2);
            }

            // Vertical positioning
            if (verticalAlign === "middle") {
                textGroup.position.y = 0;
            } else if (verticalAlign === "top") {
                textGroup.position.y = parentHeight / 2 - groupHeight;
            } else {
                textGroup.position.y = -(parentHeight / 2 - groupHeight);
            }

            // Depth positioning
            if (depth) {
                textGroup.position.z = parentDepth/2;
            }
        }

        // Add group to parent if exists
        if (parentGeometry) parentGeometry.add(textGroup);

        return textGroup;
    } catch (error) {
        console.error(`Failed to create text: ${error.message}`);
        return null;
    }
}
}

function preloadFontSync(path = '/fonts/helvetiker_regular.typeface.json') {
    if (loadedFont) {
        return loadedFont; // If already loaded, return it
    }

    const loader = new FontLoader();

    const request = new XMLHttpRequest(); // Use XMLHttpRequest for synchronous fetching
    request.open('GET', path, false); // `false` makes the request synchronous
    request.send();

    if (request.status === 200) {
        const fontData = JSON.parse(request.responseText);
        loadedFont = loader.parse(fontData); // Parse the font data into a usable font object
        return loadedFont;
    } else {
        console.error(`Error preloading font: ${request.status}`);
        throw new Error(`Failed to preload font from ${path}`);
    }
}

export function getFontSync(path = '/fonts/helvetiker_regular.typeface.json') {
    if (!loadedFont) {
        preloadFontSync();
    }
    return loadedFont;
}
function recenterTextGroup(textGroup) {
    // Step 1: Compute the bounding box of the group
    const bbox = new THREE.Box3().setFromObject(textGroup);
    const groupHeight = bbox.max.y - bbox.min.y; // Total height of the group
    const groupWidth = bbox.max.x - bbox.min.x; // Total width of the group

    // Step 2: Find the center offset
    const centerX = bbox.min.x + groupWidth / 2;
    const centerY = bbox.min.y + groupHeight / 2;

    // Step 3: Reposition the group to center it at (0, 0, 0)
    textGroup.children.forEach((child) => {
        // Adjust each child's position relative to (0, 0)
        child.position.x -= centerX;
        child.position.y -= centerY;
    });

    // Optional: You can also directly adjust the whole group to bring it back to (0, 0) externally
    textGroup.position.x = 0;
    textGroup.position.y = 0;
}