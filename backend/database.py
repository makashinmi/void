import sqlite3
import models
from datetime import datetime as dt


class Database:
    def __init__(self):
        self.connection = sqlite3.connect('db.sql')
        self.cur = self.connection.cursor()

    def addTrack(self, track: models.Track):
        self.cur.execute('INSERT INTO tracks (name, duration_seconds, path) VALUES (?, ?, ?)', [value for key, value in track])
        self.connection.commit()

    def createRoom(self, room: models.Room):
        self.cur.execute('INSERT INTO rooms VALUES (?, ?)', [value for key, value in room])
        self.connection.commit()

    def createUser(self, user: models.User):
        self.cur.execute('INSERT INTO users VALUES (?, ?, 0, 0, ?)', [user.username, user.password, dt.today().date()])
        self.connection.commit()

    def getRoomByCode(self, code: str):
        room_members = self.cur.execute('SELECT username FROM guests WHERE room_code=? UNION SELECT owner FROM rooms WHERE code=?', [code, code]).fetchall()
        print(code, room_members)
        playlist = self.cur.execute('SELECT name, duration_seconds, path FROM tracks WHERE room_code=?', [code]).fetchall()
        playlist = [{'name': track[0], 'duration_seconds': track[1], 'path': track[2]} for track in playlist]
        room = models.Room(code=code, owner=room_members[1][0], members=list(room_members[0]), playlist=playlist) if room_members else None
        return room 

    def getUserByUsername(self, username: str):
        print(username)
        un, pw, ml, rv, ms  = self.cur.execute('SELECT username, password, minutes_listened, rooms_visited, member_since FROM users WHERE username=?', [username]).fetchone()
        return models.User(username=un, password=pw, minutes_listened=ml, rooms_visited=rv, member_since=ms)

