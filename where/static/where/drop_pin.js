var map = null;
var marker = null;
var socketio = io.connect(location.origin + '/where');

// create a full-screen map
function initMap() {
    // instantiate the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center:  {lat: 0, lng: 0}
    });

    // click event handler to drop the pin in a new location
    google.maps.event.addListener(map, 'click', function(event) {
        if (marker) {
            marker.setMap(null);
            marker = null;
        }
        marker = new google.maps.Marker({
            position: event.latLng,
            map: map
        });
        socketio.emit('drop-pin', marker.getPosition().lat(), marker.getPosition().lng())
    });
}

// send current pin to the server
// (this is useful in case the Socket.IO connection breaks and is re-established)
socketio.on('connect', function() {
    if (marker != null) {
        socketio.emit('drop-pin', marker.getPosition().lat(), marker.getPosition().lng())
    }
});
