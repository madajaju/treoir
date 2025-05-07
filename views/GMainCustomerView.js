import A3DGraph from '../js/ailtire/A3DGraph.js'
import GMainView from './GMainView.js'
import GFileView from "./GFileView.js";

export default class GMainCustomerView extends GMainView {
    constructor(config) {
        super(config);
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
                            name: 'main_toolbar',
                            style: `background-color: ${me.config.toolbar["background-color"]}; color: ${me.config.color};`,
                            items: [
                                {
                                    type: 'html',
                                    id: 'app',
                                    html: `<h3 style="color:white;">${me.config.title}</h3>`
                                },
                                {type: 'menu', id: 'fileMenu', text: 'File', style: 'color: white;',
                                    items: [
                                        { id: 'fileExport', text: 'Export'},
                                        { id: 'fileImport', text: 'Import'},
                                        { id: 'fileNew', text: 'New'},
                                        { id: 'fileSave', text: 'Save'},
                                        { id: 'fileSaveAs', text: 'Save As'},
                                        { id: 'fileClose', text: 'Close'},
                                    ]
                                },
                                {type: 'menu', id: 'viewMenu', text: 'View', style: 'color: white;',
                                    items: [
                                        { id: 'viewCustomer', text: 'Customer View'},
                                        { id: 'viewPartner', text: 'Partner View'},
                                        { id: 'viewLayers', text: 'Layers View'},
                                    ]
                                },
                                {type: "html", id: "context", html: "<div id='mainContextMenu'></div>"},
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
                                } else if (event.target === 'fileMenu:fileNew') {
                                    GFileView.newFileDialog(me);
                                } else if (event.target === 'fileMenu:fileSave') {

                                } else if (event.target === 'fileMenu:fileImport') {

                                } else if (event.target === 'fileMenu:fileExport') {

                                } else if (event.target === 'fileMenu:fileClose') {

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
                    if(typeof event.target === 'string') {
                        nodeID = event.target;
                    } else if(typeof event.target === 'object') {
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
}
