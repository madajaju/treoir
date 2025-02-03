import GLayerView from "./GLayerView.js";
import GPartnerView from "./GPartnerView.js";

export default class GViewer {

    static init() {
        $.ajax({
            url: './layer/list',
            success: (results) => {
                GLayerView.viewDeep3D(results);
            }
        });
        $.ajax({
            url: './partner/list',
            success: (results) => {
                GPartnerView.viewDeep3D(results);
            }
        });
    }
    static view3D(obj, mode) {
        let data = {nodes: {}, links: []};
        data.nodes["Logical"] = {
            id: "Logical",
            name: "Logical Layer",
            view: GLayerView.view3D,
            color: "#118844",
            fx: 0,
            fy: 0,
            fz: GLayerView.default.width / 2,
            expandView: GLayerView.expand,
            expandLink: 'noLink'
        },

            data.nodes["Process"] = {
                id: "Process",
                name: "Process Layer",
                view: GLayerView.view3D,
                color: "#115588",
                fx: 0,
                fy: 0,
                fz: -GLayerView.default.width / 2,
                rotate: {y: -Math.PI},
                expandView: GLayerView.expand,
                expandLink: 'noLink'
            },
            data.nodes["Physical"] = {
                id: "Physical",
                name: "Physical Layer",
                view: GLayerView.view3D,
                color: "#441188",
                fx: GLayerView.default.width / 2,
                fy: 0,
                fz: 0,
                rotate: {y: Math.PI / 2},
                expandView: GLayerView.expand,
                expandLink: 'noLink'
            }
        GViewer.loadOrganizationalNodes(data);
        window.graph.addData(data.nodes, data.links);
    }

    static loadOrganizationalNodes(data) {
        data.nodes["Organizational"] = {
            id: "Organizational",
            name: "Organizational Layer",
            color: "#884411",
            view: GLayerView.view3D,
            fx: -GLayerView.default.width/2,
            fy: 0,
            fz: 0,
            rotate: { y: -Math.PI/2 },
            expandView: GLayerView.expand,
            expandLink: 'noLink'
        };
        let heightFactor = (GLayerView.default.height/4)
        data.nodes["Organizational-Stakeholders"] = {
            id: "Organizational-Stakeholders",
            name: "Stakeholders",
            color: "#bb7744",
            opacity: 1,
            view: GLayerView.view3D,
            rotate: { y: -Math.PI/2 },
            rbox: {
                parent: "Organizational",
                fx:0,
                fy:2*heightFactor/2,
                fz: 3
            },
            width: GLayerView.default.width - 20,
            height: heightFactor -20,
        };
        data.nodes["Organizational-Culture"] = {
            id: "Organizational-Culture",
            name: "Culture and Values",
            color: "#bb7744",
            view: GLayerView.view3D,
            rotate: { y: -Math.PI/2 },
            rbox: {
                parent: "Organizational",
                fx:0,
                fy:-2*heightFactor/2,
                fz: 3
            },
            opacity: 1,
            width: GLayerView.default.width - 20,
            height: heightFactor -20,
        }
        data.nodes["Organizational-Personas"] = {
            id: "Organizational-Personas",
            name: "Personas",
            color: "#bb7744",
            view: GLayerView.view3D,
            rotate: { y: -Math.PI/2 },
            rbox: {
                parent: "Organizational",
                fx: -80,
                fy: heightFactor/2- 20,
                fz: 3
            },
            opacity: 1,
            width: GLayerView.default.width - 80,
            height: heightFactor -20,
        }
        data.nodes["Organizational-Channels"] = {
            id: "Organizational-Channels",
            name: "Communication Channels",
            color: "#bb7744",
            view: GLayerView.view3D,
            rotate: { y: -Math.PI/2 },
            rbox: {
                parent: "Organizational",
                fx: 0,
                fy: 0,
                fz: 3
            },
            opacity: 1,
            width: 2*heightFactor - 20,
            height: 60 -20,
        }

    }
}