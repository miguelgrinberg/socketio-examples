"""Polls Socket.IO Example

Live polling of an audience.
"""
import json
import os
import uuid
from flask import Blueprint, current_app, render_template, url_for, session
from flask_socketio import emit
from socketio_examples import socketio

bp = Blueprint('polls', __name__, static_folder='static',
               template_folder='templates')


class PollTracker(object):
    """This class keeps track of the total votes for all the questions."""
    def __init__(self):
        self.polls = {'q1': [0, 0, 0],
                      'q2': [0, 0, 0, 0],
                      'q3': [0, 0, 0],
                      'q4': [0, 0, 0, 0, 0]}
        self.dirty = False
    
    def add_vote(self, question, answer):
        """Register a new vote."""
        self.polls[question][answer] += 1
        self.dirty = True

    def remove_vote(self, question, answer):
        """Remove a vote."""
        self.polls[question][answer] -= 1
        self.dirty = True

    def get_tally(self):
        """Return the updated totals if they changed, else return None."""
        if self.dirty:
            self.dirty = False
            return self.polls

    def set_dirty(self):
        """Force an update by setting the dirty flag."""
        self.dirty = True

tally = PollTracker()


@bp.route('/')
def index():
    """Return the poll administrator client application."""
    vote_url = current_app.config.get('POLLS_VOTE_URL') or \
        url_for('polls.vote', _external=True)
    return render_template('polls/main.html', vote_url=vote_url)


@bp.route('/vote')
def vote():
    """Return the poll participant client application."""
    return render_template('polls/vote.html')


@socketio.on('connect', namespace='/polls')
def on_voter_connect():
    """A new voter connected."""
    # initialize the votes for this participant
    session['votes'] = {}


@socketio.on('disconnect', namespace='/polls')
def on_voter_disconnect():
    """A voter disconnected."""
    # remove the votes from this participant
    for question, answer in session['votes'].items():
        tally.remove_vote(question, answer)


@socketio.on('vote', namespace='/polls')
def on_voter_vote(question, answer):
    """A new vote has been made."""
    if question in session['votes']:
        if session['votes'][question] == answer:
            # this is the same vote as before, so it can be ignored
            return
        # remove the previous vote on this question
        tally.remove_vote(question, session['votes'][question])
    # register the new vote
    session['votes'][question] = answer
    tally.add_vote(question, answer)


@socketio.on('votes', namespace='/polls')
def votes(votes):
    """The participant is sending all their votes."""
    # remove any previous votes stored in the participant's session
    for question, answer in session['votes'].items():
        tally.remove_vote(question, answer)
    # register the new votes
    for question, answer in votes.items():        
        tally.add_vote(question, answer)
    session['votes'] = votes


@socketio.on('connect', namespace='/polls-admin')
def on_admin_connect():
    """A poll administrator has connected."""
    # send the current tally
    emit('update-charts', tally.polls)


def update_task():
    """Background task to refresh charts when votes change."""
    while True:
        results = tally.get_tally()
        if results:
            # broadcast the results to all connected admins
            socketio.emit('update-charts', results, namespace='/polls-admin')
        socketio.sleep(5)

socketio.start_background_task(update_task)
