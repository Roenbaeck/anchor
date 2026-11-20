// Layer: the SVG layers of the graph and of the miniature.
import { SVGNS } from './config.js';
export function Layer(graph) {
    this.graph = graph;
    this.layers = [];
}
Layer.prototype = {
    graph: null,
    layers: null,
    addLayer: function(name) {
        var layer = document.createElementNS(SVGNS, 'g');
        layer.setAttributeNS(null, 'id', name);
        this.graph.appendChild(layer);
        this.layers.push(name);
        this[name] = layer;
    },
    show: function(name) {
        var after;
        for(var i = this.layers.indexOf(name) + 1; i < this.layers.length; i++) {
            after = this.layers[i];
            if(this.isShowing(after))
                break;
        }
        if(i < this.layers.length) {
            this.graph.insertBefore(this[name], this[after]);
        }
        else {
            this.graph.appendChild(this[name]);
        }
    },
    isShowing: function(name) {
        return this.graph.contains(this[name]);
    },
    hide: function(name) {
        if(this.isShowing(name))
            this.graph.removeChild(this[name]);
    },
    clear: function(name) {
        var layer = this[name];
        while(layer.firstChild) {
            layer.removeChild(layer.firstChild);
        }
    },
    clearAll: function() {
        var l = this.layers.length;
        while(l--) {
            this.clear(this.layers[l]);
        }
    }
};
