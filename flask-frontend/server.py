from flask import Flask, render_template, redirect, make_response, request as incame_request
import requests as rq
import json
from hashlib import md5
from flask_socketio import SocketIO, emit, send, join_room, leave_room
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
    guest = {'username': guest_data['username'], 'room_code': guest_data['room_code'].upper(), 'sid': ''}
    room_data = json.loads(rq.get(f'{API_URL}/rooms/{guest["room_code"]}').text)
    if room_data:
        return render_template('room.html', room=room_data)
    return render_template('home.html') 


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
@socketio.on('join')
def join(data):
    guest = {'username': data['username'], 'room_code': data['room_code'].upper(), 'sid': incame_request.sid}
    rq.post(f'{API_URL}/guests/', data=json.dumps(guest))
    join_room(data['room_code'].upper())
    emit('join', data['username'], to=data['room_code'].upper())

@socketio.on('disconnect')
def leave():
    response = rq.delete(f'{API_URL}/guests/?sid={incame_request.sid}').text
    guest = json.loads(response)
    print(guest)
    if guest:
        emit('leave', guest['username'], to=guest['room_code'])

@socketio.on('track_query')
def lookup_query(query):
    result = json.loads(rq.get(f'{API_URL}/tracks/RULA?source=youtube&query={query}').text)
    emit('track_query_options', result)

@socketio.on('track_query_choice')
def download_track(youtube_id):
    emit('track_query_download_progress', {'id': youtube_id}, to='RULA')
    track = json.loads(rq.post(f'{API_URL}/tracks/RULA?source=youtube&id={youtube_id}').text)
    # track['path'] = '/static/tracks/rickroll.webm'
    emit('track_query_download_finish', track, to='RULA')


if __name__ == '__main__':
    socketio.run(app)
