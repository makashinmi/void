from pydantic import BaseModel
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
    members: list[str] | None
    playlist: list[dict] | None
    

class Guest(BaseModel):
    id: int | None
    username: str
    room_code: Room


class TrackQuery(BaseModel):
    query: str
    option: int = 0
    extra: bool | None


class Track(BaseModel):
    id: str 
    room_code: str
    name: str
    duration_seconds: int
    path: str


class Playlist(BaseModel):
    room_code: User
    track_id: Track 

