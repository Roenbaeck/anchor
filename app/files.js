// files: opening a model from a file, also dropped on the page.
import { Actions } from './Actions.js';
(function(){
    const input = document.getElementById('modelFileInput');
    const statusRegion = document.getElementById('fileLoadStatus');
    if(!input) return;

    async function loadFile(file){
        if(!file) return;
        if(Actions.loading) return; // prevent concurrent loads
        Actions.showLoading('Loading ' + file.name + '…');
        try {
            const text = await file.text(); // modern File API, returns Promise
            const xml = new DOMParser().parseFromString(text, 'text/xml');
            // Basic parse error detection (presence of parsererror element)
            if(xml.getElementsByTagName('parsererror').length){
                throw new Error('XML parse error');
            }
            Actions.lastLocalFilename = file.name;
            Actions._applyLoadedModel(xml, false);
            statusRegion.textContent = 'Loaded ' + file.name;
        } catch(err){
            console.error('Failed to load file', err);
            alert('Failed to load model: ' + err.message);
            Actions.hideLoading();
        } finally {
            // allow selecting same file again
            input.value = '';
        }
    }

    function handleFileList(fileList){
        if(!fileList || !fileList.length) return;
        // restrict strictly to the first file
        loadFile(fileList[0]);
    }

    input.addEventListener('change', e => handleFileList(e.target.files));

    // Optional drag & drop support
    document.addEventListener('dragover', e => { e.preventDefault(); });
    document.addEventListener('drop', e => {
        if(!e.dataTransfer) return;
        const files = e.dataTransfer.files;
        if(files && files.length){
            e.preventDefault();
            handleFileList(files);
        }
    });
})();
