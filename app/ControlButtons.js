// ControlButtons: the buttons for pause, zoom, undo and redo.
import { SVG } from './config.js';
import { Model } from './Model.js';
import { DrawingEngine } from './DrawingEngine.js';
import { init } from './init.js';
export var ControlButtons = {
    playPauseButton: null,
    nudgeButton: null,
    undoButton: null,
    redoButton: null,
    zoomInButton: null,
    zoomOutButton: null,
    zoomFactor: 1.75,
    init: function() {
        this.playPauseButton = document.getElementById('playpause');
        this.undoButton = document.getElementById('undo');
        this.redoButton = document.getElementById('redo');
        this.zoomInButton = document.getElementById('zoomin');
        this.zoomOutButton = document.getElementById('zoomout');
        this.undoButton.setAttribute('title', 'Undo the last change. The last ' + Model.maxUndoLevels + ' changes are kept.');
        this.redoButton.setAttribute('title', 'Redo the change that was undone.');
        // the model says how many changes can be undone and redone; it does not call the buttons
        Model.on('history', function(history) {
            ControlButtons.setUndoLevels(history.undo);
            ControlButtons.setRedoLevels(history.redo);
        });

        // rebinding
        this.togglePlayPause = this.togglePlayPause.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);

        this.playPauseButton.addEventListener('click', this.togglePlayPause, false);
        this.undoButton.addEventListener('click', this.undo, false);
        this.redoButton.addEventListener('click', this.redo, false);
        this.zoomInButton.addEventListener('click', this.zoomIn, false);
        this.zoomOutButton.addEventListener('click', this.zoomOut, false);
        this.playing = false;
    },
    togglePlayPause: function (event) {
        if(DrawingEngine.running) {
            DrawingEngine.stop();
            this.setPlayState();
        }
        else {
            if (LayoutEngine.equilibrium) {
                this.invalidateLayout();
            }
            DrawingEngine.start(true);
            this.setPauseState();
        }
    },
    setUndoLevels: function(numberOfLevels) {
        var undos = '';
        if(numberOfLevels)
            undos = ' (' + numberOfLevels + ')';
        this.undoButton.firstChild.nodeValue = 'Undo' + undos;
    },
    setRedoLevels: function(numberOfLevels) {
        var redos = '';
        if(numberOfLevels)
            redos = ' (' + numberOfLevels + ')';
        this.redoButton.firstChild.nodeValue = 'Redo' + redos;
    },
    undo: function() {
        Model.undoState();
        DrawingEngine.start(false);
    },
    redo: function() {
        Model.redoState();
        DrawingEngine.start(false);
    },
    setPlayState: function() {
        this.playPauseButton.firstChild.nodeValue = 'Play';
        this.playPauseButton.className = 'pausing';
    },
    setPauseState: function() {
        this.playPauseButton.firstChild.nodeValue = 'Pause';
        this.playPauseButton.className = 'playing';
    },
    invalidateLayout: function () {
        for(var i = 0; i < Model.visibleNodes.length; i++) {
            Model.visibleNodes[i].start();
        }
    },
    doZoom: function (zoom) {
        var w = SVG.viewBox.baseVal.width;
        var h = SVG.viewBox.baseVal.height;
        var dx = w * (1-zoom)/2;
        var dy = h * (1-zoom)/2;
        SVG.viewBox.baseVal.x += dx;
        SVG.viewBox.baseVal.y += dy;
        SVG.viewBox.baseVal.width = w * zoom;
        SVG.viewBox.baseVal.height = h * zoom;
        DrawingEngine.start(false);
    },
    zoomIn: function (event) {
        this.doZoom(1/this.zoomFactor);
    },
    zoomOut: function (event) {
        this.doZoom(this.zoomFactor);
    }
};
