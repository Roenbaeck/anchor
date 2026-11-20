// Popovers: the modal background, the page popover and the code popover.
import { DrawingEngine } from './DrawingEngine.js';
import { Actions } from './Actions.js';
export function ModalBackground(message) {
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

export function URLPopover(url) {
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

// What is shown is code or a document; with options.file ('Model.sql') it has the buttons that copy it and download it as that file
// (options.type is the media type). They take what is in the box as it is, also if it has been edited there.
export function CodePopover(documentFragment, preformatted, options) {
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
    if(options && options.file) {
        var bar = document.createElement('div');
        bar.className = 'codebar';
        var copy = document.createElement('button'), download = document.createElement('button');
        copy.type = download.type = 'button';
        copy.textContent = 'Copy';
        copy.title = 'Copy what is shown to the clipboard';
        download.textContent = 'Download ' + options.file.replace(/^.*\./, '.');
        download.title = 'Save what is shown as the file ' + options.file;
        copy.addEventListener('click', function() {
            Actions.copyText(content.textContent).then(function(copied) {
                Actions.notify(copied ? 'Copied.' : 'The browser would not copy. Select the text and press Ctrl+C.');
            });
        }, false);
        download.addEventListener('click', function() { Actions.downloadText(content.textContent, options.file, options.type || 'text/plain'); }, false);
        bar.appendChild(copy);
        bar.appendChild(download);
        popover.appendChild(bar);
    }

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
