// Popovers: the modal background, the page popover and the code popover.
"use strict";

function ModalBackground(message) {
    var modalBackground = document.createElement('div');
    modalBackground.setAttribute("id", "modalBackground");
    modalBackground.style.width = window.innerWidth + 'px';
    modalBackground.style.height = window.innerHeight + 'px';
    this.modalBackground = modalBackground;
    if(message) {
        var text = document.createTextNode(message);
        modalBackground.appendChild(text);
    }
    document.body.appendChild(modalBackground);
    return this;
}
ModalBackground.prototype = {
    modalBackground: null,
    close: function(event) {
        document.body.removeChild(this.modalBackground);
    }
};

function URLPopover(url) {
    DrawingEngine.stop();
    var self = this;

    this.modalBackground = new ModalBackground();

    var popover = document.createElement('div');
    popover.setAttribute("id", "urlPopover");
    var wPadding = window.innerWidth * 0.1;
    var hPadding = window.innerHeight * 0.1;
    var close = document.createElement('div');
    close.className = 'closebutton';
    close.addEventListener('click', function(event) { return self.close(event); }, false);
    popover.appendChild(close);

    var content = document.createElement('iframe');
    content.setAttribute("id", "content");
    content.style.width = (window.innerWidth - 2 * wPadding) + 'px';
    content.style.height = (window.innerHeight - 2 * hPadding) + 'px';
    content.src = url;

    popover.appendChild(content);
    document.body.appendChild(popover);

    this.popover = popover;
    return this;
}
URLPopover.prototype = {
    popover: null,
    modalBackground: null,
    close: function(event) {
        document.body.removeChild(this.popover);
        this.modalBackground.close();
        DrawingEngine.start(false);
    }
};

function CodePopover(documentFragment, preformatted) {
    DrawingEngine.stop();
    var self = this;

    this.modalBackground = new ModalBackground();

    var popover = document.createElement('div');
    popover.setAttribute("id", "codePopover");
    var wPadding = window.innerWidth * 0.1;
    var hPadding = window.innerHeight * 0.1;
    var close = document.createElement('div');
    close.className = 'closebutton';
    close.addEventListener('click', function(event) { return self.close(event); }, false);
    popover.appendChild(close);

    var content = document.createElement('div');
    content.setAttribute("id", "content");
    content.setAttribute("contenteditable", "true");
    content.setAttribute("spellcheck", "false");
    if(preformatted)
        content.setAttribute("class", "preformatted");
    content.style.width = (window.innerWidth - 2 * wPadding) + 'px';
    content.style.height = (window.innerHeight - 2 * hPadding) + 'px';
    content.appendChild(documentFragment);
    popover.appendChild(content);

    document.body.appendChild(popover);

    this.popover = popover;
    return this;
}
CodePopover.prototype = {
    popover: null,
    modalBackground: null,
    close: function(event) {
        document.body.removeChild(this.popover);
        this.modalBackground.close();
        DrawingEngine.start(false);
    }
};
