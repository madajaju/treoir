import A3DGraph from '../js/ailtire/A3DGraph.js'
import {Graph3D} from '../js/Graph3D.js'
import GPartnerView from './GPartnerView.js'
import GLayerView from './GLayerView.js'
import {marked} from '../js/marked.esm.js'
import GSuggestionView from "./GSuggestionView.js";

export default class GMainView {
    static scolor = {
        started: "#00ffff",
        created: "#00ffff",
        inprogress: "#00aaff",
        blocked: "#ffbb44",
        completed: "#aaffaa",
        failed: "#ffaaaa",
        error: "#ffaaaa",
        enabled: "#aaffaa",
        disable: "#aaaaaa",
        rejected: "#ffaaaa",
        accepted: "#aaffff",
        update: "#aaffff",
        needed: "#ffbb44",
        selected: "#aaffaa",
        evaluated: "#ffffaa",
        moved: "#00ff00",
        nocontact: "#ff0000"
    };

    constructor(config) {
        this.selectedObject = {};
        this.currentView = undefined;
        this.previewWindow = undefined;
        this.config = {
            title: "GEAR",
            toolbar: {
                "background-color": "#00aaff",
                "color": "#000000"
            },
            mainDiv: "#main",
            graphDiv: "#modelGraph",
            graph3D: {
                div: "#modelGraph",
                color: "#"
            },
            graph2D: {
                div: "#model2D",
                color: "#ffffff"
            }
        };
        this.handlers = {};
        this.handlers2d = {};
        this.editors = {};
        this.init(config);
    }

    static submitDocForm() {
        let form = $("#docForm");
        let url = form.attr("action");
        $.ajax({
            type: "POST",
            url: url,
            data: form,
            dataType: "json", encode: true,
        }).done(function (data) {
            w2popup.close();
        });
    }

    static createErrorDialog(results) {
        for (let i in results) {
            results[i].recid = i;
            let result = results[i];
            switch (results[i].type) {
                case "model.associations":
                    result.dataView = result.data.name + ':' + result.data.type;
                    result.objectView = result.object.name;
                    break;
                case "package.depend":
                    result.dataView = result.data;
                    result.objectView = result.object.name;
                    break;
                default:
                    result.dataView = result.data;
                    result.objectView = results.object;
                    break;
            }
        }
        $().w2grid({
            name: "ErrorList",
            columns: [
                {field: 'type', size: "20%", resizable: true, caption: 'Type', sortable: true},
                {field: 'message', size: "20%", resizable: true, caption: 'Message', sortable: true},
                {field: 'objectView', size: "20%", resizable: true, caption: 'Object', sortable: true},
                {field: 'dataView', size: "20%", resizable: true, caption: 'Data', sortable: true},
                {field: 'lookup', size: "20%", resizable: true, caption: 'Lookup', sortable: true}
            ],
            show: {
                header: true,
                columnHeaders: true,
            },
            records: results
        });
    }

    init(pconfig) {
        for (let name in pconfig) {
            this.config[name] = pconfig[name];
        }
        this.windowLayout();
        this.setupUI();
        this.setup3DGraphics();
        this.setupEventWatcher();
        this.showObjectList();
        GSuggestionView.showList();
        this.showAIForm();
        this.showTaskForm();
        this.objectEditors = pconfig.objectEditors;
    }

    graphOpening() {
        let data = A3DGraph.openingScene();
        window.graph.setData(data.nodes, data.links);
        window.graph.graph.cameraPosition({x: 0, y: 0, z: 1000}, // new position
            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
            3000  // ms transition duration.
        );
    }

    windowLayout() {
        let me = this;
        let config = {
            layout: {
                name: 'layout',
                padding: 0,
                panels: [
                    {
                        type: 'top',
                        size: 30,
                        resizable: true,
                        overflow: 'hidden',
                        style: 'border: 1px solid #0088ff; background-color:#4a96d3; color:white;',
                        toolbar: {
                            style: `background-color: ${me.config.toolbar["background-color"]}; color: ${me.config.color};`,
                            items: [
                                {
                                    type: 'html',
                                    id: 'app',
                                    html: `<h3 style="color:white;">${me.config.title}</h3>`
                                },
                                {type: 'button', id: 'customer', text: 'Customer', style: 'color: white;'},
                                {type: 'button', id: 'partner', text: 'Partner', style: 'color: white;'},
                                {type: 'button', id: '', text: 'Partner', style: 'color: white;'},
                                {type: 'spacer'},
                                {type: 'button', id: 'home', group: '1', text: 'Home Screen', style: 'color: white;'},
                                {type: 'button', id: 'expand', group: '1', text: 'Graph Only', style: 'color: white;'},
                                {type: 'button', id: 'normal', group: '1', text: 'All', style: 'color: white;'},
                            ],
                            onClick: function (event) {
                                if (event.target === 'expand' && !event.object.checked) {
                                    w2ui['layout'].toggle('right');
                                    w2ui['layout'].toggle('left');
                                    w2ui['layout'].toggle('bottom');
                                    w2ui['layout'].toggle('main')
                                    w2ui['layout'].sizeTo('preview', "100%");
                                } else if (event.target === 'normal') {
                                    w2ui['layout'].toggle('right');
                                    w2ui['layout'].toggle('left');
                                    w2ui['layout'].toggle('bottom');
                                    w2ui['layout'].toggle('main');
                                    w2ui['layout'].sizeTo('preview', "80%");
                                } else if (event.target === 'home') {
                                    me.graphOpening();
                                }
                            }
                        }
                    },
                    {type: 'left', size: 200, resizable: true, content: 'left', style: 'border: 1px solid #aaaaff'},
                    {
                        type: 'main',
                        size: 200,
                        content: 'Details',
                        overflow: 'hidden',
                        resizable: true,
                        style: 'border: 1px solid #aaaaff',
                        toolbar: {
                            style: "background-color: #00aaaa; color: black;",
                            items: [
                                {type: 'button', id: 'editItem', text: 'Documentation'},
                                {type: 'button', id: 'errorItem', text: 'View Model Errors'},
                                {type: 'button', id: 'userActivity', text: 'User Activities'},
                                {type: 'button', id: 'generate', text: 'GenAI', img: 'ailtire-ai-icon'},
                            ],
                            onClick: function (event) {
                                me.processTopMenu(event);
                            }
                        },
                    },
                    {
                        type: 'preview',
                        size: "80%",
                        content: 'Graph',
                        overflow: 'hidden',
                        resizable: true,
                        style: 'border: 1px solid #aaaaff',
                        toolbar: {
                            items: [
                                {
                                    type: 'menu-radio', id: "dim", dim: "View: Select", img: 'icon-search',
                                    text: function (item) {
                                        let el = this.get('View:' + item.selected);
                                        if (el) {
                                            return 'View: ' + el.text;
                                        } else {
                                            return 'View: 3d';
                                        }
                                    },
                                    selected: '3D',
                                    items: [
                                        {text: '2D', icon: 'icon-page', id: '2d'},
                                        {text: '3D', icon: 'icon-page', id: '3d'},
                                    ]
                                },
                                {type: 'break'},
                                {type: 'button', id: 'logical', caption: 'Logical', img: 'icon-search',},
                                {type: 'button', id: 'physical', caption: 'Physical', img: 'icon-search',},
                                {type: 'button', id: 'organizational', caption: 'Organizational', img: 'icon-search',},
                                {type: 'button', id: 'process', caption: 'Process', img: 'icon-search',},
                                {type: 'button', id: 'partner', caption: 'Partners', img: 'icon-search',},
                                {type: 'button', id: 'customer', caption: 'Customer', img: 'icon-search',},
                            ],
                            onClick: function (event) {
                                switch (event.target) {
                                    case 'logical':
                                        window.graph.graph.cameraPosition({x: 0, y: 0, z: 1000}, // new position
                                            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                            1000  // ms transition duration.
                                        );
                                        break;
                                    case 'physical':
                                        window.graph.graph.cameraPosition({x: 1000, y: 0, z: 0}, // new position
                                            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                            1000  // ms transition duration.
                                        );
                                        break;
                                    case 'organizational':
                                        window.graph.graph.cameraPosition({x: -1000, y: 0, z: 0}, // new position
                                            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                            1000  // ms transition duration.
                                        );
                                        break;
                                    case 'process':
                                        window.graph.graph.cameraPosition({x: 0, y: 0, z: -1000}, // new position
                                            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                            1000  // ms transition duration.
                                        );
                                        break;
                                    case 'partner':
                                        window.graph.graph.cameraPosition({x: 0, y: 1000, z: 0}, // new position
                                            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                            1000  // ms transition duration.
                                        );
                                        break;
                                    case 'customer':
                                        window.graph.graph.cameraPosition({x: 0, y: -1000, z: 0}, // new position
                                            {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                            1000  // ms transition duration.
                                        );
                                        break;
                                    case 'dim:3d':
                                        document.getElementById('preview2d').style.display = "none";
                                        document.getElementById('preview3d').style.display = "block";
                                        break;
                                    case 'dim:2d':
                                        document.getElementById('preview3d').style.display = "none";
                                        document.getElementById('preview2d').style.display = "block";
                                        break;
                                    case 'expand':
                                        w2ui['layout'].toggle('right');
                                        w2ui['layout'].toggle('left');
                                        w2ui['layout'].toggle('bottom');
                                        w2ui['layout'].toggle('main')
                                        w2ui['layout'].sizeTo('preview', "100%");
                                        break;
                                    case 'normal':
                                        w2ui['layout'].toggle('right');
                                        w2ui['layout'].toggle('left');
                                        w2ui['layout'].toggle('bottom');
                                        w2ui['layout'].toggle('main');
                                        w2ui['layout'].sizeTo('preview', "80%");
                                        break;
                                }
                            }
                        }
                    },
                    {type: 'right', size: 200, resizable: true, content: 'right', style: 'border: 1px solid #aaaaff'},
                    {type: 'bottom', size: 100, resizable: true, content: 'bottom', style: 'border: 1px solid #aaaaff'}
                ]
            },
            rightbar: {
                name: 'rightbar',
                nodes: [],
                onClick: function (event) {
                    if (event.object.id) {
                        window.graph.selectNodeByID(event.object.id);
                        me.selectNode(event.object);
                    }
                }
            },
            sidebar: {
                name: 'sidebar',
                img: null,
                nodes: [],
                onExpand: (event) => {
                    let nodeID = '';
                    if (typeof event.target === 'string') {
                        nodeID = event.target;
                    } else if (typeof event.target === 'object') {
                        nodeID = event.target.id;
                    }
                    switch (nodeID) {
                        case 'logical':
                            window.graph.graph.cameraPosition({x: 0, y: 0, z: 1000}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                        case 'physical':
                            window.graph.graph.cameraPosition({x: 1000, y: 0, z: 0}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                        case 'organizational':
                            window.graph.graph.cameraPosition({x: -1000, y: 0, z: 0}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                        case 'process':
                            window.graph.graph.cameraPosition({x: 0, y: 0, z: -1000}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                    }
                },
                onCollapse: (event) => {
                    switch (event.object.id) {
                        case 'logical':
                            window.graph.graph.cameraPosition({x: 0, y: 0, z: 1000}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                        case 'physical':
                            window.graph.graph.cameraPosition({x: 1000, y: 0, z: 0}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                        case 'organizational':
                            window.graph.graph.cameraPosition({x: -1000, y: 0, z: 0}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                        case 'process':
                            window.graph.graph.cameraPosition({x: 0, y: 0, z: -1000}, // new position
                                {x: 0, y: 0, z: 0}, // lookAt ({ x, y, z })
                                1000  // ms transition duration.
                            );
                            break;
                    }
                },
                onClick: function (event) {
                    if (event.object.id) {
                        window.graph.selectNodeByID(event.object.id);
                    }
                }
            },
            mainDiv: me.config.mainDiv,
            graphDiv: me.config.graphDiv,
            graph3D: me.config.graph3D,
        };
        this.panels = config;
    }

    setupUI() {
        // Bottom Layout is three Panels. WorkflowInstances, Workflows, and Events
        $("#bottomLayout").w2layout({
            name: 'bottomLayout',
            panels: [
                {
                    type: 'left',
                    size: '25%',
                    resizeable: true,
                    minSize: 100,
                    content: `<div id="workflowInstanceList">WorkFlow Instance List </div>`
                },
                {
                    type: 'main',
                    size: '50%',
                    resizeable: true,
                    minSize: 100,
                    content: `<div id="aiPrompt"></div>`
                },
                {
                    type: 'right',
                    size: '25%',
                    resizeable: true,
                    minSize: 100,
                    content: `<div id="eventlist"> Event List</div>`
                },
            ]
        });
        $(this.config.mainDiv).w2layout(this.panels.layout);

        w2ui.layout.content('left', $().w2sidebar(this.panels.sidebar));
        w2ui.layout.content('right', $().w2sidebar(this.panels.rightbar));
        w2ui.layout.content('main', `<div style="position: relative; height: 200px;"> <div id="objlist" style="position: absolute; left: 0px; width: 49.9%; height: 200px;">Object List Select item to see</div> <div id="objdetail" style="position: absolute; right: 0px; width: 49.9%; height: 200px;">Select Object to view details</div> </div>`);
        w2ui.layout.content('preview', '<div id="preview3d" style="display:block;"> <div className="modelGraph"' +
            ' id="DrawingArea" style="position: absolute; left: 0px;"></div></div> <div id="preview2d"' +
            ' style="display:none;">2D Preview</div>');
        w2ui.layout.html('bottom', w2ui['bottomLayout']);
        w2ui.layout.on("resize", (event) => {
            if (!this.previewWindow) {
                for (let i in w2ui.layout.panels) {
                    let panel = w2ui.layout.panels[i];
                    if (panel.type === 'preview') {
                        this.previewWindow = panel;
                    }
                }
            }
            if (event.panel === 'preview' || event.panel === 'left') {
                this.previewWindow.width -= event.diff_x;
                this.previewWindow.height -= event.diff_y;
            } else {
                this.previewWindow.width += event.diff_x;
                this.previewWindow.height += event.diff_y;
            }

            window.graph.resize({width: this.previewWindow.width, height: this.previewWindow.height});
        });
        GPartnerView.showList('rightbar', 'partners');
        GLayerView.showList('sidebar', 'layers');
    }

    setupEventWatcher() {
        let socket = io(window.location.origin,
            {path: window.location.pathname + '/socket.io'}
        );
        socket.onAny((event, msg) => {
            let [eventClass, eventName] = event.split('.');
            if(eventName === 'suggested') {
                GSuggestionView.addSuggestion(event.msg);
            }
        });
    }

    setup3DGraphics() {
        let graphPanel = new A3DGraph({toolbar: w2ui['layout_preview_toolbar']});
        let width = $(this.config.graph3D.div).width();
        let height = $(this.config.graph3D.div).height();
        let graph = new Graph3D("DrawingArea", {nodes: {}, links: {}}, {
            background: this.config.graph3D.color,
            width: width,
            height: height,
            selectCallback: (node) => { // What to do when the object is selected in the graph
                if (node.hasOwnProperty('showDetail')) {
                    node.showDetail(node);
                }
            },
            expandObject: (link) => {
                AObject.expandObject(link);
            },
            expandDesign: (node) => {
                if (node.expandLink != 'nolink') {
                    $.ajax({
                        url: node.expandLink,
                        success: (results) => {
                            node.expandView(results, "new");
                        },
                        failed: (error) => {
                            console.error("Error:", error);
                        }
                    });
                } else {
                    node.expandView(node.data);
                }
            }
        });
        window.graph = graph;
        graph.toolbar = graphPanel;
    }

    showObjectList() {
    }

    showEventList() {
        w2ui['bottomLayout'].html('right', w2ui.eventlist);
    }

    showEvent(event, msg) {
        if (w2ui['eventlist']) {
            let [object, ename] = event.split(/\./);
            let rec = w2ui['eventlist'].get(object);
            if (!rec) {
                rec = {recid: object, object: object, count: 0, events: {}, message: msg};
                w2ui['eventlist'].add(rec);
            }
            if (ename) {
                if (!rec.events.hasOwnProperty(ename)) {
                    rec.events[ename] = 0;
                }
                rec.events[ename]++;
            }
            rec.currentEvent = event;
            rec.count++;
            rec.message = msg.message;
            w2ui['eventlist'].set(object, rec);
            w2ui['eventlist'].select(object);
        }

    }

    setToolBar(tools) {
        let itemsToRemove = [];
        let toolmap = {};
        for (let i in this.defaultToolbarItems) {
            toolmap[this.defaultToolbarItems[i].id] = this.defaultToolbarItems[i];
        }
        for (let i in tools) {
            toolmap[tools[i].id] = tools[i];
        }
        for (let i in this.config.toolbar.items) {
            itemsToRemove.push(this.config.toolbar.items[i].id);
        }
        for (let i in itemsToRemove) {
            this.config.toolbar.remove(itemsToRemove[i]);
        }
        for (let i in toolmap) {
            this.config.toolbar.add(toolmap[i]);
        }
        this.config.toolbar.refresh();
    }

    processTopMenu(event) {
        const me = this;
        if (event.target === 'errorItem') {
            $.ajax({
                url: './app/errors',
                success: function (results) {
                    me.createErrorDialog(results);
                    w2popup.open({
                        title: 'Errors',
                        body: '<div id="errorDialog" style="width: 100%; height: 100%;"></div>',
                        style: 'padding: 15px 0px 0px 0px',
                        width: 800,
                        height: 800,
                        showMax: true,
                        onToggle: function (event) {
                            $(w2ui.errorDialog.box).hide();
                            event.onComplete = function () {
                                $(w2ui.errorDialog.box).show();
                                w2ui.errorDialog.resize();
                            }
                        },
                        onOpen: function (event) {
                            event.onComplete = function () {
                                // specifying an onOpen handler instead is equivalent to specifying an onBeforeOpen handler, which would make this code execute too early and hence not deliver.
                                w2ui['ErrorList'].refresh();
                                $('#errorDialog').w2render("ErrorList");
                                w2ui['ErrorList'].refresh();
                            }
                        }
                    });
                }
            });
        } else if (event.target === 'editItem') {
            if (me.selectedObject.link) {
                $.ajax({
                    url: me.selectedObject.link + '&doc=true',
                    success: function (results) {
                        let setURL = me.selectedObject.link.replace('get', 'update');
                        if (me.editors.hasOwnProperty(me.selectedObject.view)) {
                            me.editors[me.selectedObject.view](results, setURL);
                        } else {
                            AModel.editDocs(results, setURL);
                        }
                    }
                });
            } else {
                let sobj = me.selectedObject.results;
                let url = `${sobj._type.toLowerCase()}?id=${sobj._id}`
                $.ajax({
                    url: url,
                    success: function (results) {
                        let sobj = results;
                        AObject.editObject(sobj);
                    }
                });
            }
        } else if (event.target === 'userActivity') {
            $.ajax({
                url: './useractivity/list',
                success: function (results) {
                    AUserActivity.showListDialog(results);
                }
            });
        } else if (event.target === 'generate') {
            if (me.selectedObject.link) {
                // let url = `${me.currentView}/generate?target=Items`;
                let url = `app/generate`;
                me.currentView = 'note';
                AGenerativeAI.inputPopup(url);
            } else if (me.currentView) {
                // let url = `${me.currentView}/generate?target=Items`;
                let url = `app/generate`;
                me.currentView = 'note';
                AGenerativeAI.inputPopup(url);
            } else {
                let url = `app/generate`;
                me.currentView = 'note';
                AGenerativeAI.inputPopup(url);
            }
        }
    }

    showTaskForm() {
        // Validate if 'bottomLayout' is initialized
        if (!w2ui['bottomLayout']) {
            console.error('bottomLayout is not initialized.');
            return;
        }

        // Define task actions as reusable methods
        function markComplete(recid) {
            let taskGrid = w2ui.taskList;
            let record = taskGrid?.get(recid);
            if (record && record.status !== 'Complete') {
                record.status = 'Complete';
                taskGrid.refresh(); // Refresh the grid to update the display
                console.log(`Task ${recid} marked as complete.`);
            } else {
                console.log(`Task ${recid} is already marked complete.`);
            }
        }

        function deleteTask(recid) {
            let taskGrid = w2ui.taskList;
            taskGrid.remove(recid); // Remove the record from the grid
            console.log(`Task ${recid} deleted.`);
        }

        // Initialize the grid if it doesn't exist
        if (!w2ui.hasOwnProperty('taskList')) {
            $().w2grid({
                name: 'taskList',
                show: {
                    toolbar: true,
                    footer: true
                },
                columns: [
                    {field: 'task', text: 'Task', size: '50%'},
                    {field: 'status', text: 'Status', size: '20%'},
                    {
                        field: 'actions',
                        text: 'Actions',
                        size: '30%',
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
                    console.log('Row selected:', event.recid);
                }
            });
        }

        // Render the grid in the 'bottomLayout' panel
        w2ui['bottomLayout'].content('left', w2ui.taskList);

        // Fetching data via AJAX
        const url = 'task/list';
        $.ajax({
            url: url,
            method: 'GET',
            success: (results) => {
                // Assuming `results` is an array of tasks [{recid, task, status}, ...]
                let taskGrid = w2ui.taskList;
                taskGrid.clear(); // Clear existing data
                let records = [];
                let i = 0;
                for (let name in results) {
                    let task = results[name];
                    records.push({recid: i++, task: task.name, status: task.status});
                }
                taskGrid.add(records); // Add new data to the grid
            },
            error: (xhr, status, error) => {
                w2alert("Error: " + error);
                console.error('AJAX Error:', error);
            }
        });
    }

    showAIForm() {
        let me = this;
        // Check if bottomLayout exists
        if (!w2ui['bottomLayout']) {
            console.error('bottomLayout is not initialized.');
            return;
        }

        // Define the entire custom HTML structure for the response area and form
        const htmlContent = `
        <style>
                .aiprompt {
                display: inline-block;
                padding: 10px;
                margin: 5px 0;
                background-color: #f0f8ff; /* Light blue (can substitute for light gray, e.g., #f7f7f7) */
                border: 1px solid #d3d3d3; /* Light gray border */
                border-radius: 5px; /* Rounded corners */
                font-size: 12px;
                font-family: Arial, sans-serif;
                color: #333; /* Text color */
            }
            .aiSendButton {
                display: inline-flex; 
                justify-content: center; 
                align-items: center; width: 40px; height: 40px; 
                background-color: #007bff; color: #fff; 
                border: none; border-radius: 50%; 
                font-size: 20px; line-height: 20px; 
                cursor: pointer;
            }
            .aiStopButton {
                display: inline-flex; 
                justify-content: center; 
                align-items: center; width: 40px; height: 40px; 
                background-color: #aa3300; color: #fff; 
                border: none; border-radius: 0%; 
                font-size: 32px; line-height: 20px; 
                cursor: wait;
            }
        </style>
        <div id="aiContainer" style="display: flex; flex-direction: column; height: 100%; border: 1px solid #ddd;">
    <!-- Response Area -->
    <div id="aiResponse" style="flex: 1; padding: 10px; overflow-y: auto; background-color: #f9f9f9; border-bottom: 1px solid #ddd;">
        <p><em>The AI's response will appear here...</em></p>
    </div>

    <!-- Form Container: Always stays at the bottom -->
    <div id="form-container" style="display: flex; align-items: center; padding: 10px; border-top: 1px solid #ddd; background: #fff;">
        <textarea id="aiPrompt" style="flex: 1; height: 40px; padding: 10px; 
                                       font-size: 12px; border: 1px solid #ddd; 
                                       border-radius: 5px; resize: none;"
                  placeholder="Enter your prompt here..."
                  onkeydown="if (event.key === 'Enter') { event.preventDefault(); askAI(); }"></textarea>
        <button id="send-button" class="aiSendButton" onClick="askAI();">
            ▶
        </button>
    </div>
</div>
    `;
        window.askAI = () => {
            const promptInput = document.getElementById('aiPrompt');
            const promptValue = promptInput.value.trim();
            if (!promptValue) {
                w2alert("Please enter a prompt.");
                return;
            }
            const responseDiv = document.getElementById('aiResponse');

            const newPromptDiv = document.createElement('div');
            newPromptDiv.className = 'aiprompt';
            newPromptDiv.textContent = promptValue;
            responseDiv.appendChild(newPromptDiv);

            const uid = `gearai-${Math.random().toString(36).substr(2, 9)}`;
            const newReplyDiv = document.createElement('div');
            newReplyDiv.id = uid;
            newReplyDiv.className = 'airesults';
            newReplyDiv.innerHTML = '<small><i>Generating Answer...</i></small>';
            responseDiv.appendChild(newReplyDiv);
            responseDiv.scrollTop = responseDiv.scrollHeight;
            promptInput.value = 'Waiting...';
            const url = 'ai/askAndMap';
            const sendButton = document.getElementById('send-button');
//            sendButton.innerHTML = '□';
            sendButton.innerHTML = '&#x25FC';
            sendButton.className = 'aiStopButton';

            let data = {prompt: promptValue};
            /*
            if(me.selectedObject) {
                data.context = `${me.selectedObject.type}:${me.selectedObject.id}`;
            }

             */
            $.ajax({
                url: url,
                data: data,
                success: (results) => {
                    const uniqResponseDiv = document.getElementById(uid);
                    let htmlResults = marked(results);
                    uniqResponseDiv.innerHTML = `<p>${htmlResults}</p>`;
                    responseDiv.scrollTop = responseDiv.scrollHeight;
                    promptInput.value = "Ask Gear AI a question..";
                    sendButton.className = 'aiSendButton';
                    sendButton.innerHTML = '▶';

                },
                failed: (error) => {
                    w2alert("Error: " + error);

                }
            });
        }
        // Inject the content into the main panel of the bottomLayout
        w2ui['bottomLayout'].html('main', htmlContent);

        // Add event listener to handle the form submission
    }

    selectNode(object) {
        this.selectedObject = object;
    }
}
