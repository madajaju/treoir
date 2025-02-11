import AText from '../js/ailtire/AText.js';

export default class GSuggestionView {
    static default = {
        fontSize: 5,
        height: 2,
        width: 2,
        depth: 2,
        opacity: 1,
        color: "#888888"
    }

    static view3D(obj, type) {
        let width = obj.width || GSuggestionView.default.width;
        let height = obj.height || GSuggestionView.default.height;
        let depth = obj.depth || GSuggestionView.default.depth;
        let color = obj.color || GSuggestionView.default.color;
        let opacity = obj.opacity || GSuggestionView.default.opacity;
        if (type === 'Selected') {
            color = "yellow";
        } else if (type === 'Targeted') {
            color = "red";
        } else if (type === 'Sourced') {
            color = "green";
        }
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
        let fontSize = obj.fontSize || GSuggestionView.default.fontSize;

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
        group.width = GSuggestionView.default.width;
        group.height = GSuggestionView.default.height;
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

    static showList(suggestions) {
        if (!w2ui['bottomLayout']) {
            console.error('bottomLayout is not initialized.');
            return;
        }

        // Define task actions as reusable methods
        function acceptSuggestion(recid) {
            let sGrid = w2ui.suggestionList;
            let record = sGrid?.get(recid);
            if (record && record.status !== 'Complete') {
                record.status = 'Complete';
                sGrid.refresh(); // Refresh the grid to update the display
                console.log(`Task ${recid} marked as complete.`);
            } else {
                console.log(`Task ${recid} is already marked complete.`);
            }
        }

        function deleteSuggestion(recid) {
            suggestionList.remove(recid); // Remove the record from the grid
        }

        // Initialize the grid if it doesn't exist
        if (!w2ui.hasOwnProperty('suggestionList')) {
            $().w2grid({
                name: 'suggestionList',
                show: {
                    toolbar: true,
                    footer: true
                },
                columns: [
                    {field: 'type', text: 'Type', size: '15%'},
                    {field: 'name', text: 'Suggestion', size: '15%'},
                    {field: 'description', text: 'Description', size: '60%'},
                    {
                        field: 'actions',
                        text: 'Actions',
                        size: '10%',
                        render: function (record) {
                            if (record.status === 'Created' || record.status === 'WIP') {
                                return ` <button class="mark-complete" onclick="markComplete(${record.recid})">Complete</button>
                                         <button class="cancel-task" onclick="cancelTask(${record.recid})">Cancel</button>`;
                            }
                            return ` <button class="delete-task" onclick="deleteTask(${record.recid})">Delete</button>`;
                        }
                    }
                ],
                onClick: function (event) {
                    // Place the suggestion and Highlight the layer.
                    let object = event.recid;
                    let rec = w2ui['suggestionList'].get(object);
                    let layers = rec.obj.layers.split(',');
                    for (let i in layers) {
                        let layer = layers[i].replace(/^ /, '').trim();
                        window.graph.selectNodeByID(layer);
                    }
                }
            });
        }

        // Render the grid in the 'bottomLayout' panel
        w2ui['bottomLayout'].content('right', w2ui.suggestionList);

        GSuggestionView.loadSuggestions();
        w2ui['bottomLayout'].html('right', w2ui.suggestionList);
    }

    static addSuggestion(suggestion) {
        let sGrid = w2ui.suggestionList;
        let record = {
            recid: suggestion.id,
            name: suggestion._attributes.name,
            description: suggestion._attributes.description,
            type: suggestion.type.replace('Suggestion', ''),
            status: suggestion.state,
            obj: suggestion
        };
        sGrid.add(record);
        sGrid.reload();
    }

    static loadSuggestions() {
        const url = 'suggestion/list';
        let sGrid = w2ui.suggestionList;
        $.ajax({
            url: url,
            method: 'GET',
            success: (results) => {
                // Assuming `results` is an array of tasks [{recid, task, status}, ...]
                let sGrid = w2ui.suggestionList;
                sGrid.clear(); // Clear existing data
                let records = [];
                let i = 0;
                for (let name in results) {
                    let suggestion = results[name];
                    records.push({
                        recid: i++,
                        name: suggestion.name,
                        description: suggestion.description,
                        type: suggestion.type.replace('Suggestion', ''),
                        status: suggestion.state,
                        obj: suggestion
                    });
                }
                sGrid.add(records); // Add new data to the grid
            },
            error: (xhr, status, error) => {
                w2alert("Error: " + error);
                console.error('AJAX Error:', error);
            }
        });
        sGrid.refresh();

    }

    static expand(node) {

    }
}