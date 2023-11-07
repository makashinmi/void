import sqlite3
import models
from datetime import datetime as dt

TRACK_COLUMNS = ('name', 'author', 'duration_seconds', 'source_name', 'source_id', 'file')


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
        owner = self.cur.execute('SELECT owner FROM rooms WHERE code=?', [code]).fetchone()
        if owner:
            members = self.cur.execute('SELECT username FROM guests WHERE room_code=?', [code]).fetchall()
            playlist = self.cur.execute(f'SELECT {", ".join(TRACK_COLUMNS)} FROM tracks INNER JOIN playlist ON playlist.room_code=?', [code]).fetchall()
            playlist = [dict(zip(TRACK_COLUMNS, track)) for track in playlist]
            print(playlist)
            room = models.Room(code=code, owner=owner[0], members=[row[0] for row in members], playlist=playlist)
            return room 
        return None

    def getUserByUsername(self, username: str):
        user = self.cur.execute('SELECT username, password, minutes_listened, rooms_visited, member_since FROM users WHERE username=?', [username]).fetchone()
        if user:
            un, pw, ml, rv, ms = user
            return models.User(username=un, password=pw, minutes_listened=ml, rooms_visited=rv, member_since=ms)
        return None

    def insertGuest(self, guest: models.Guest):
        self.cur.execute('INSERT INTO guests (username, room_code, sid) VALUES (?, ?, ?)', [value for key, value in guest])
        self.connection.commit()

    def insertTrack(self, track: models.Track):
        self.cur.execute(f'INSERT INTO {", ".join(TRACK_COLUMNS)} VALUES ({", ".join(["?"] * len(TRACK_COLUMNS))})', [key for key, value in track] + [value for key, value in track])
        self.connection.commit()

    def removeGuest(self, sid: str):
        guest = self.cur.execute('DELETE FROM guests WHERE sid=? RETURNING username, room_code', [sid]).fetchone()
        self.connection.commit()
        if guest:
            username, room_code = guest
            return models.Guest(username=username, room_code=room_code, sid='')
        return None 

