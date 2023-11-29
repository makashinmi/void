import { socket } from './websockets.js';
import { player } from './player.js';

const searchForm = document.getElementById('search__form');
const searchInput = document.getElementById('search__input');
const searchButton = searchInput.nextElementSibling;
const query_results = document.getElementById('search__results');
const playlist = document.getElementById('playlist');

searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	if (searchInput.value) {
		searchInput.setAttribute('disabled', '');
		searchButton.setAttribute('disabled', '');
		query_results.innerHTML = `Searching for "${searchInput.value}"...`;
		socket.emit('track_query', searchInput.value);
		searchInput.value = '';
	};
});

searchButton.addEventListener('click', (e) => {
	searchForm.submit();
});

socket.on('connect', function() {
	socket.emit('my event', {data: "I'm connected!"});
});

var track_query_choice = function (id) {
	socket.emit('track_query_choice', id);
	query_results.innerHTML = '';
};

var formatTime = function (duration_seconds) {
	var seconds = duration_seconds % 60;
	var minutes = (duration_seconds - seconds) / 60;
	console.log(minutes + ':' + seconds > 10 ? '' : '0' + seconds);
	return minutes + ':' + (seconds > 10 ? seconds : '0' + seconds);
};

socket.on('track_query_options', (options) => {
	searchInput.removeAttribute('disabled');
	searchButton.removeAttribute('disabled');
	query_results.innerHTML = '';

	for(let i = 0; i < options.length; i++) {
		const row = document.createElement('div');
		row.setAttribute('class', 'track-query-option');

		var track = options[i];
		row.addEventListener('click', track_query_choice.bind(null, track.id));

		row.innerHTML = `<b>${track.author}</b> &mdash; ${track.name} (${formatTime(track.duration_seconds)})`;
		query_results.appendChild(row);
	};
});

socket.on('track_query_download_progress', (data_obj) => {
	var temp = document.createElement('div');
	temp.setAttribute('id', data_obj.id);
	temp.innerHTML = `${data_obj.id} &mdash; in progress`;
	playlist.appendChild(temp);
});

socket.on('track_query_download_finish', (track) => {
	var temp = document.createElement('div');
	temp.innerHTML = `
	<div id='${track.source_name}-${track.source_id}-${player.playlist.length}' class='playlist__track'>
		<i class='btn core__after core__radius icon-play'></i>
		<span class='title'>
			<span><b>${ track.author }</b></span>
			<span>${ track.name }</span>
		</span>
		<span class='duration'>
			(${ formatTime(track.duration_seconds) })
		</span>
	</div>
	`;
	temp.addEventListener('click', player.play.bind(player, player.playlist.length));
	console.log(track)
	playlist.removeChild(document.getElementById(track.source_id));
	playlist.appendChild(temp);
	player.playlist.push(track);
});
