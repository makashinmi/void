const socket = io();

const searchForm = document.getElementById('form');
const searchInput = document.getElementById('input');
const searchButton = searchInput.nextElementSibling
const query_results = document.getElementById('query_results');
const playlist = document.getElementById('playlist');

searchForm.addEventListener('submit', (e) => {
e.preventDefault();
	if (searchInput.value) {
		searchInput.setAttribute('disabled', '');
		searchButton.nextElementSibling.setAttribute('disabled', '');
		query_results.innerHTML = `Searching for "${searchInput.value}"...`;
		socket.emit('track_query', searchInput.value);
		searchInput.value = '';
	}
});

searchButton.addEventListener('click', (e) => {
	searchForm.submit();
});

socket.on('connect', function() {
	socket.emit('my event', {data: "I'm connected!"});
});

function track_query_choice(id) {
	socket.emit('track_query_choice', id);
	query_results.innerHTML = '';
	const temp = document.createElement('div');
	temp.setAttribute('id', id);
	temp.innerHTML = `${id} &mdash; in progress`;
	playlist.appendChild(temp);
};

socket.on('track_query_result', (result) => {
	searchInput.removeAttribute('disabled');
	input.nextElementSibling.removeAttribute('disabled');
	query_results.innerHTML = '';

	for(let i = 0; i < result.length; i++) {
		const row = document.createElement('div');
		row.setAttribute('class', 'track-query-option');

		var track = result[i];
		row.setAttribute('onclick', `track_query_choice('${track.id}')`);

		var seconds = track.duration_seconds % 60;
		var minutes = (track.duration_seconds - seconds) / 60;
		if (seconds < 10) {
			seconds = `0${seconds}`;
		};
		row.innerHTML = `<b>${track.author}</b> &mdash; ${track.name} (${minutes}:${seconds})`;
		query_results.appendChild(row);
	};
});

socket.on('track_query_finish', (data_obj) => {
	const track = document.createElement('div');
	track.innerHTML = `<audio controls><source src='${data_obj.path}' type='audio/webm'></audio>`
	var temp = document.getElementById(data_obj.id);
	temp.parentNode.removeChild(temp);
	playlist.appendChild(track);
});
