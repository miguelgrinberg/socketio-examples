import os
from flask import Flask, render_template
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['FILEDIR'] = 'static/_files/'
app.config['CHAT_URL'] = os.environ.get('CHAT_URL')
app.config['POLLS_VOTE_URL'] = os.environ.get('POLLS_VOTE_URL')
app.config['WHERE_PIN_URL'] = os.environ.get('WHERE_PIN_URL')
app.config['GOOGLE_MAPS_KEY'] = os.environ.get('GOOGLE_MAPS_KEY')
socketio = SocketIO(app)

from chat import bp as chat_bp
from audio import bp as audio_bp
from uploads import bp as uploads_bp
from polls import bp as polls_bp
from where import bp as where_bp

app.register_blueprint(chat_bp, url_prefix='/chat')
app.register_blueprint(audio_bp, url_prefix='/audio')
app.register_blueprint(uploads_bp, url_prefix='/uploads')
app.register_blueprint(polls_bp, url_prefix='/polls')
app.register_blueprint(where_bp, url_prefix='/where')


@app.route('/')
def index():
    return render_template('index.html')
