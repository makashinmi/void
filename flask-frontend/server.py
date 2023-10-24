from flask import Flask, render_template, redirect, make_response, request as incame_request
import requests as rq
import json
from hashlib import md5
from flask_socketio import SocketIO, emit, send
from time import sleep


app = Flask(__name__)
app.debug = True
API_URL = 'http://localhost:8000/api'
socketio = SocketIO(app)


@app.get('/')
def homePage():
    return render_template('home.html') 

@app.post('/')
def joinRoom():
    guest_data = incame_request.form
    room_data = json.loads(rq.get(f'{API_URL}/rooms/{guest_data["room_code"].upper()}').text)
    return render_template('room.html', room=room_data) if room_data else render_template('new_home.html') 


@app.get('/login')
def loginPage():
    return render_template('login.html')

@app.post('/login')
def loginValidation():
    login = incame_request.form
    api_response = rq.get(f'{API_URL}/users/{login["username"]}').text
    try:
        user = json.loads(api_response)
    except json.decoder.JSONDecodeError:
        response = make_response(render_template('login.html', wrong_credentials=True))
    else:
        if md5(bytes(login['password'], 'utf-8')).hexdigest() == user['password']:
            response = make_response(redirect(f'/profile/{login["username"]}'))
            # assign this user their session somehow
        else:
            response = make_response(render_template('login.html', wrong_credentials=True))
    finally:
        return response



@app.get('/signup')
def signupPage():
    return render_template('signup.html')

# What if nickname already in use?
@app.post('/signup')
def signupValidation():
    signup = json.dumps(incame_request.form)
    rq.post(f'{API_URL}/users/', data=signup)
    return redirect(f'/profile/{incame_request.form.get("username")}')


@app.get('/profile/<username>')
def showUserProfile(username: str):
    user = json.loads(rq.get(f'{API_URL}/users/{username}').text)
    print(user)
    return render_template('profile.html', user=user)


@app.get('/whereami')
def whereamiPage():
    return render_template('whereami.html')


@app.get('/about')
def aboutPage():
    return render_template('about.html')


@app.route('/account')
def profilePage():
    if incame_request.cookies['token']: #.do_smth_with_token_to_ident_user():
        return redirect(f'/{incame_request.cookies["token"].split("&")[0]}')
    if incame_request.method == 'POST':
        data = json.dumps(incame_request.form)
        rq.post(f'{API_URL}/users/', data=data)
        # session.set_cookie(user_data) ??? Gotta remember the guy afterwards
        return redirect(f'/{data.username}')
    return render_template('login_signup.html')


#--- WEBSOCKET FUNCTIONALITY ---#
@socketio.on('my event')
def handle_message(data):
    print(f'received message: {data}')

@socketio.on('track_query')
def lookup_query(query):
    print(query)
    result = json.loads(rq.get(f'{API_URL}/tracks/RULA?source=youtube&query={query}').text)
    # result['id'] = 'dQw4w9WgXcQ'  # rickroll :D
    emit('track_query_result', result)

@socketio.on('track_query_choice')
def download_track(youtube_id):
    track = json.loads(rq.post(f'{API_URL}/tracks/RULA?source=youtube&id={youtube_id}').text)
    print(track)
    # track['path'] = '/static/tracks/rickroll.webm'
    emit('track_query_finish', track)


if __name__ == '__main__':
    socketio.run(app)
