// Symbol: the SVG elements that draw a component.
"use strict";

function Symbol(component) {
    this.component = component;
}
Symbol.prototype = {
    component: null,
    interactive: null,
    graphicsElement: null,
    useElement: null,
    boundingBox: null,
    xOffset: null,
    yOffset: null,
    control: null,
    nameElement: null,
    nameText: null,
    nameControl: null,
    highlightElement: null,
    selectionElement: null,
    fixationElement: null,
    pathElement: null,
    forceElement: null,
    makeInteractive: function() {
        this.highlightElement = document.createElementNS(SVGNS, 'use');
        this.highlightElement.setAttributeNS(XLINKNS, 'xlink:href', '#highlight');
        this.highlightElement.component = this.component;
        this.selectionElement = document.createElementNS(SVGNS, 'use');
        this.selectionElement.setAttributeNS(XLINKNS, 'xlink:href', '#selection');
        this.selectionElement.component = this.component;
        this.fixationElement = document.createElementNS(SVGNS, 'use');
        this.fixationElement.setAttributeNS(XLINKNS, 'xlink:href', '#fixation');
    },
    hideDebug: function(imageLayer) {
        if(this.forceElement && imageLayer.contains(this.forceElement))
            imageLayer.removeChild(this.forceElement);
    },
    showDebug: function(imageLayer) {
        this.forceElement = document.createElementNS(SVGNS, 'line');
        this.forceElement.setAttributeNS(null, 'marker-end', 'url(#arrowhead)');
        // Add class so stroke color & opacity can be theme-controlled via CSS
        this.forceElement.classList.add('forceVector');
        if(!imageLayer.contains(this.forceElement))
            imageLayer.appendChild(this.forceElement);
    },
    hideGraphics: function(imageLayer) {
        if(this.graphicsElement && imageLayer.contains(this.graphicsElement))
            imageLayer.removeChild(this.graphicsElement);
    },
    showGraphics: function(imageLayer) {
        if(this.graphicsElement && !imageLayer.contains(this.graphicsElement))
            imageLayer.appendChild(this.graphicsElement);
    },
    hidePath: function(imageLayer) {
        if(this.pathElement && imageLayer.contains(this.pathElement))
            imageLayer.removeChild(this.pathElement);
    },
    showPath: function(imageLayer) {
        if(this.pathElement && !imageLayer.contains(this.pathElement))
            imageLayer.appendChild(this.pathElement);
    },
    hideName: function(imageLayer) {
        if(this.nameElement && imageLayer.contains(this.nameElement))
            imageLayer.removeChild(this.nameElement);
    },
    showName: function(imageLayer) {
        if(this.nameElement && !imageLayer.contains(this.nameElement))
            imageLayer.appendChild(this.nameElement);
    }
};
