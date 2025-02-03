import { Text } from '../js/troika-three-text.esm.js';

export default class AFittedText {
    static view(text, object, options = {}, callback) {
        let {
            maxFontSize = 30,
            minFontSize = 0,
            lineHeight = 1,
            maxLines = 5,
            position = 'center', // Where to place the text on the object
            offset = { x: 0, y: 0, z: 0 }, // Optional offsets to position text
            font = 'Arial' // Default fallback font for precise measurement
        } = options;

        if (!minFontSize) {
            minFontSize = maxFontSize / 2;
        }

        // Create the Troika Text Object
        const textObj = new Text();
        textObj.text = text;
        textObj.fontSize = maxFontSize; // Start with the maximum font size
        textObj.color = options.color || 0xffffff;
        textObj.anchorX = options.anchorX || 'center';
        textObj.anchorY = options.anchorY || 'middle';
        textObj.align = options.align || 'center';
        textObj.whiteSpace = 'normal';
        textObj.overflowWrap = 'break-word'; // Allow words to wrap if necessary
        object.add(textObj);

        // Compute the bounding box of the parent (object)
        const objectBoundingBox = new THREE.Box3().setFromObject(object);
        const objectWidth = objectBoundingBox.max.x - objectBoundingBox.min.x;
        const objectHeight = objectBoundingBox.max.y - objectBoundingBox.min.y;
        const objectDepth = objectBoundingBox.max.z - objectBoundingBox.min.z;
        const labelZLocation = objectBoundingBox.max.z;

        // Canvas-based text measurement function
        function measureTextWithCanvas(text, fontSize) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = `${fontSize}px ${font}`; // Dynamically set font size and family
            const textWidth = context.measureText(text).width;
            const textHeight = fontSize; // Approximate height as the font size
            return { width: textWidth, height: textHeight };
        }

        // Function to adjust text size, splitting into lines if necessary
        function adjustText() {
            // Measure text dimensions
            let dimensions = measureTextWithCanvas(text, textObj.fontSize);

            // If the text doesn't fit the geometry, adjust it
            while (
                (dimensions.width > objectWidth || dimensions.height > objectHeight) &&
                textObj.fontSize > minFontSize
                ) {
                textObj.fontSize -= textObj.fontSize*.10; // Decrease by 10%
                dimensions = measureTextWithCanvas(text, textObj.fontSize); // Re-measure
            }

            if (textObj.fontSize <= minFontSize) {
                // If reducing the font size isn't enough, split into lines
                const words = text.split(' ');
                let adjustedText = '';
                let line = '';

                for (let word of words) {
                    const testLine = line + (line ? ' ' : '') + word;
                    const testDimensions = measureTextWithCanvas(testLine, textObj.fontSize);

                    if (testDimensions.width <= objectWidth) {
                        line = testLine; // Word fits on the current line
                    } else {
                        adjustedText += (adjustedText ? '\n' : '') + line; // Move to a new line
                        line = word; // Start a new line
                    }
                }

                // Add the last line
                adjustedText += (adjustedText ? '\n' : '') + line;

                // Update the text
                textObj.text = adjustedText;

                // Check if the number of lines exceeds the maximum
                const lineCount = adjustedText.split('\n').length;
                if (lineCount > maxLines) {
                    console.warn(`Text exceeds the maximum number of lines (${maxLines}).`);
                }
            }

            let finalDimensions = measureTextWithCanvas(textObj.text, textObj.fontSize);
            textObj.height = finalDimensions.height;
            textObj.width = finalDimensions.width;

            // Apply the adjusted text to the object
            applyTextToObject();
            if (callback) callback(object);
            return object;
        }

        // Position the text on the object and add it
        function applyTextToObject() {
            // Text positioning based on the object's bounding box
            const objectCenter = objectBoundingBox.getCenter(new THREE.Vector3());
            let positionVector = objectCenter.clone();


            if (position === 'top') {
                positionVector.y += ((objectHeight / 2)- 1.5*textObj.height);
            } else if (position === 'bottom') {
                positionVector.y -= ((objectHeight / 2) - 1.5*textObj.height);
            }
            positionVector.z = (objectCenter.z.min);




            // Apply any custom offset
            positionVector.add(new THREE.Vector3(offset.x, offset.y, offset.z));

            positionVector.z = (labelZLocation*1.1);
            // Apply position and add text to the object
            textObj.position.copy(positionVector);
        }

        // Start adjusting the text
        adjustText();

        // Return the parent object with the attached text
        return object;
    }
}