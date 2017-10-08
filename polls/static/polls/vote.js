var socketio = io.connect(location.origin + '/polls');

// register a vote as a result of a click event
function onButtonClick() {
    q = document.getElementsByClassName(this.classList[0]);
    for (var j = 0; j < q.length; j++) {
        if (q[j] == this) {
            q[j].classList.remove('not-chosen');
            q[j].classList.add('chosen');
            socketio.emit('vote', this.classList[0], j);
        }
        else {
            q[j].classList.remove('chosen');
            q[j].classList.add('not-chosen');
        }
    }
}

// set up click event handlers
window.onload = function() {
    var choices = document.getElementsByClassName('choice');
    for (var i = 0; i < choices.length; i++) {
        choices[i].onclick = onButtonClick;
    }
}

// send current votes to the server
// (this is useful in case the Socket.IO connection breaks and is re-established)
socketio.on('connect', function() {
    var choices = document.getElementsByClassName('choice');
    var votes = {};
    for (var i = 0; i < choices.length; i++) {
        q = document.getElementsByClassName(choices[i].classList[0]);
        for (var j = 0; j < q.length; j++) {
            if (q[j].classList.contains('chosen')) {
                votes[choices[i].classList[0]] = j;
                break;
            }
        }
    }
    socketio.emit('votes', votes);
});
