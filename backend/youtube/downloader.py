from pytube import YouTube, Search
from pprint import pprint


def getResultsByQuery(query: str):
    raw_results = [video.vid_info['videoDetails'] for video in Search(query).results if video.length > 60]

    if raw_results:
        results = [{'author': video['author'], 'name': video['title'], 'duration_seconds': video['lengthSeconds'], 'id': video['videoId']} for video in raw_results]
        return results 
    else:
        raise Exception('No videos longer than 60 seconds were found')


def _sortByABrDescending(stream):
    return -1 * int(stream.abr.replace('kbps', ''))


def downloadAudioById(id_: str):
    video = YouTube.from_id(id_)
    audio_streams = [stream for stream in video.fmt_streams if stream.type=='audio']

    if audio_streams:
        audio_streams.sort(key=_sortByABrDescending)
        path = '/'.join(audio_streams[0].download(output_path='/home/michael/Workspace/Python/void/flask-frontend/static/tracks').split('/')[-3::])
        print(path)
        return {'id': id_, 'path': f'/{path}'}
        # what next????
        # Stream Object has arguments for callbacks implemented, look into that
    else:
        raise Exception(f"No audio streams found for the target {id_}")


if __name__ == '__main__':
    results = getResultsByQuery(input('query: '))
    pprint(results)
    yt = results[int(input('option: '))]
    downloadAudioById(yt['id'])