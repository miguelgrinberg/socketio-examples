# Socket.IO Examples

This repository contains a few examples that demonstrate the features of the
Python Socket.IO server in combination with Flask.

## How to Run

First create a virtual environment and import the requirements.

One of the demos uses the Google Maps API. For that demo to work you need to
request a Google Maps API key from Google, as described
[here](https://developers.google.com/maps/documentation/javascript/get-api-key).

To start the server, run:

```
(venv) $ export GOOGLE_MAPS_KEY=<your-google-maps-key>
(venv) $ export FLASK_APP=socketio_examples.py
(venv) $ flask run
```

Finally, open _http://localhost:5000_ on your web browser to access the
application.

Note: You can run the application without a Google Maps key. All the demos
except "Where do you live?" will work just fine.
