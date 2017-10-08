var map = null;
var markers = {};
var count = 0;
var socketio = io.connect(location.origin + '/where-admin');

// create a full-screen map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center:  {lat: 0, lng: 0}
    });
}

// update a pin for "sid" on the map
// if lat and lng are undefined, remove the pin for this client
socketio.on('update-pin', function(sid, lat, lng) {
    if (sid in markers) {
        if (lat == undefined) {
            markers[sid].setMap(null);
            delete markers[sid];
            count -= 1;
        }
        else {
            markers[sid].setPosition({lat: lat, lng: lng});
        }
    }
    else if (lat != undefined) {
        markers[sid] = new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map: map
        });
        count += 1;
    }
    // update pin count on page
    document.getElementById('count').innerHTML = Object.keys(markers).length;
});

// refresh the complete list of pins
socketio.on('update-pins', function(pins) {
    // remove existing pins
    for (var sid in markers) {
        markers[sid].setMap(null);
    }
    // create new pins
    count = 0;
    for (var sid in pins) {
        markers[sid] = new google.maps.Marker({
            position: {lat: pins[sid][0], lng: pins[sid][1]},
            map: map
        });
        count += 1;
    }    
    // update pin count on page
    document.getElementById('count').innerHTML = Object.keys(markers).length;
});
