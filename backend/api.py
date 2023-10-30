from fastapi import FastAPI
from hashlib import md5
from random import choice
import json

import models
from database import Database
import youtube.downloader as yt

app = FastAPI()
db = Database()


@app.get('/api/')
async def home():
    return ''


# What if the username is already in use?
@app.post('/api/users/')
async def createUser(user: models.User):
    user.password = md5(bytes(user.password, 'utf-8')).hexdigest() 
    db.createUser(user)

@app.get('/api/users/{username}')
async def getUserByUsername(username: str):
    return db.getUserByUsername(username)


# What if the code already exists?
@app.post('/api/rooms/{username}')
async def createRoom(username: str):
    code = ''.join((choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(4)))
    newRoom = models.Room(code=code, owner=username)
    db.createRoom(newRoom)
    return newRoom 

@app.get('/api/rooms/{code}')
async def getRoomByCode(code: str):
    return db.getRoomByCode(code)


@app.post('/api/guests/')
async def insertGuest(guest: models.Guest):
    db.insertGuest(guest)

@app.delete('/api/guests/')
async def removeGuest(sid: str):
    return db.removeGuest(sid)
    

@app.get('/api/tracks/{room_code}')
async def getResultsByQuery(room_code: str, source: str, query: str, extra: bool | None = None):
    match source:
        case 'youtube':
            result = yt.getResultsByQuery(query)
        case _:
            result = []
    return result

@app.post('/api/tracks/{room_code}')
async def downloadBySourceId(room_code: str, source: str, id: str):
    match source:
        case 'youtube':
            track = yt.downloadAudioById(id)
        case _:
            raise Exception(f'Wrong source: {source}') 
    return track
