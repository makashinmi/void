from pydantic import BaseModel
from typing import Optional
from datetime import date


class User(BaseModel):
    username: str
    password: str | None
    minutes_listened: int = 0
    rooms_visited: int = 0
    member_since: date = date.today()


class Room(BaseModel):
    code: str
    owner: str 
    members: list[str] | None = None
    playlist: list[dict] | None = None
    

class Guest(BaseModel):
    username: str
    room_code: str 
    sid: str | None = None


class TrackQuery(BaseModel):
    query: str
    option: int = 0
    extra: bool | None


class Track(BaseModel):
    name: str
    author: str
    duration_seconds: int
    source_name: str 
    source_id: str
    file: str


class Playlist(BaseModel):
    room_code: User
    track_id: Track 

