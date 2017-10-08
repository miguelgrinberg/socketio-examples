const chunk_size = 64 * 1024;
var socketio = io.connect(location.origin + '/uploads', {transports: ['websocket']});
var files = [];

// file drop handling
var dropzone = document.getElementById('dropzone');
dropzone.ondragover = function(e) {
    e.preventDefault();
}
dropzone.ondrop = function(e) {
    e.preventDefault();
    for(var i = 0; i < e.dataTransfer.files.length; i++) {
        filediv = document.createElement('div');
        filename = document.createElement('div');
        filename.classList.add('filename');
        filename.innerHTML = e.dataTransfer.files[i].name;
        progress = document.createElement('div');
        progress.classList.add('file-progress');
        progress.classList.add('in-progress');
        filediv.appendChild(filename);
        filediv.appendChild(progress);
        document.getElementById('filelist').appendChild(filediv);
        files.push({
            file: e.dataTransfer.files[i],
            progress: progress,
            done: false
        });
    }
}

// read a chunk from a file
function readFileChunk(file, offset, length, success, error) {
    end_offset = offset + length;
    if (end_offset > file.size)
        end_offset = file.size;
    var r = new FileReader();
    r.onload = function(file, offset, length, e) {
        if (e.target.error != null)
            error(file, offset, length, e.target.error);
        else
            success(file, offset, length, e.target.result);
    }.bind(r, file, offset, length);
    r.readAsArrayBuffer(file.slice(offset, end_offset));
}

// read success callback
function onReadSuccess(file, offset, length, data) {
    if (this.done)
        return;
    if (!socketio.connected) {
        // the WebSocket connection was lost, wait until it comes back
        setTimeout(onReadSuccess.bind(this, file, offset, length, data), 5000);
        return;
    }
    socketio.emit('write-chunk', this.server_filename, offset, data, function(offset, ack) {
        if (!ack)
            onReadError(this.file, offset, 0, 'Transfer aborted by server')
    }.bind(this, offset));
    end_offset = offset + length;
    this.progress.style.width = parseInt(300 * end_offset / file.size) + "px";
    if (end_offset < file.size)
        readFileChunk(file, end_offset, chunk_size,
            onReadSuccess.bind(this),
            onReadError.bind(this));
    else {                        
        this.progress.classList.add('complete');
        this.progress.classList.remove('in-progress');
        this.done = true;
    }
}

// read error callback
function onReadError(file, offset, length, error) {
    console.log('Upload error for ' + file.name + ': ' + error);
    this.progress.classList.add('error');
    this.progress.classList.remove('in-progress');    
    this.done = true;
}

// upload button
var upload = document.getElementById('upload');
upload.onclick = function() {
    if (files.length == 0)
        alert('Drop some files above first!');
    for (var i = 0; i < files.length; i++) {
        socketio.emit('start-transfer', files[i].file.name, files[i].file.size, function(filename) {
            if (!filename) {
                // the server rejected the transfer
                onReadError.call(this, this.file, 0, 0, 'Upload rejected by server')
            }
            else {
                // the server allowed the transfer with the given filename
                this.server_filename = filename;
                readFileChunk(this.file, 0, chunk_size,
                    onReadSuccess.bind(this),
                    onReadError.bind(this));
            }
        }.bind(files[i]));
    }
    files = [];
}
