import { socket } from './websockets.js';

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

socket.on('track_query_options', (options) => {
	searchInput.removeAttribute('disabled');
	searchButton.removeAttribute('disabled');
	query_results.innerHTML = '';

	for(let i = 0; i < options.length; i++) {
		const row = document.createElement('div');
		row.setAttribute('class', 'track-query-option');

		var track = options[i];
		row.addEventListener('click', track_query_choice.bind(null, track.id));

		var seconds = track.duration_seconds % 60;
		var minutes = (track.duration_seconds - seconds) / 60;
		if (seconds < 10) {
			seconds = `0${seconds}`;
		};
		row.innerHTML = `<b>${track.author}</b> &mdash; ${track.name} (${minutes}:${seconds})`;
		query_results.appendChild(row);
	};
});

socket.on('track_query_download_progress', (data_obj) => {
	var temp = document.createElement('div');
	temp.setAttribute('id', data_obj.id);
	temp.innerHTML = `${data_obj.id} &mdash; in progress`;
	playlist.appendChild(temp);
});

socket.on('track_query_download_finish', (data_obj) => {
	const track = document.createElement('div');
	track.innerHTML = `<audio controls><source src='${data_obj.path}' type='audio/webm'></audio>`
	var temp = document.getElementById(data_obj.id);
	temp.parentNode.removeChild(temp);
	playlist.appendChild(track);
});
