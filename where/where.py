"""Google Maps and Socket.IO demo

Shows a live map where participants can add themselves.
"""
from flask import Blueprint, current_app, url_for, render_template, request
from flask_socketio import emit
from socketio_examples import socketio

bp = Blueprint('where', __name__, static_folder='static',
              template_folder='templates')
pins = {}


@bp.route('/')
def index():
    """Return the admin client application."""
    pin_url = current_app.config.get('WHERE_PIN_URL') or \
        url_for('where.drop_pin', _external=True)
    return render_template(
        'where/main.html',
        google_maps_key=current_app.config['GOOGLE_MAPS_KEY'],
        pin_url=pin_url)


@bp.route('/drop-pin')
def drop_pin():
    """Return the client application."""
    return render_template(
        'where/drop_pin.html',
        google_maps_key=current_app.config['GOOGLE_MAPS_KEY'])


@socketio.on('disconnect', namespace='/where')
def on_disconnect():
    """A participant disconnected."""
    # remove the pin from this participant
    if request.sid in pins:
        del pins[request.sid]
    socketio.emit('update-pin', request.sid, namespace='/where-admin')


@socketio.on('drop-pin', namespace='/where')
def on_drop_pin(lat, lng):
    """A new pin has been dropped."""
    if request.sid in pins:
        pass
    pins[request.sid] = (lat, lng)
    socketio.emit('update-pin', (request.sid, lat, lng), namespace='/where-admin')


@socketio.on('connect', namespace='/where-admin')
def on_admin_connect():
    """An administrator has connected."""
    emit('update-pins', pins)
