export { player };

var player_elements = ['playBtn', 'pauseBtn', 'nextBtn', 'prevBtn', 'repeatBtn', 'shuffleBtn', 'title', 'duration'] 
player_elements.forEach(function (id) {
	window[id] = document.getElementById(id);
});

var Player = function (playlist) {
	this.playlist = playlist;
	this.index = 0;
	this.repeat = false;
	this.shuffled = false;
	this.playlist_order = Array();
	for (var i = 0; i < this.playlist.length; ++i) this.playlist_order[i]=i;
	this.current_audio = new Audio();

	this.init();
};

Player.prototype = {
	init: function() {
		var self = this;

		self.current_audio.onended = (e) => { 
			if (self.repeat) self.play()
			else self.skipTo(self.index + 1)
		};
		self.resetPlaylistOrder();
	},
	formatTime: function(duration_seconds) {
		var seconds = duration_seconds % 60;
		var minutes = (duration_seconds - seconds) / 60;
		return minutes + ':' + (seconds < 10 ? `0${seconds}` : seconds);
	},
	play: function () {
		var self = this;

		if (self.playlist.length > 0) {
			playBtn.style.display = 'none';
			pauseBtn.style.display = 'block';

			if (self.current_audio.src === '') self.skipTo(0);
			self.current_audio.play();
			console.log(self.index);
		};
	},
	pause: function () {
		var self = this;

		self.current_audio.pause();
		playBtn.style.display = 'block';
		pauseBtn.style.display = 'none';
	},
	resetPlaylistOrder: function () {
		var self = this;
		for (var i = 0; i < self.playlist.length; ++i) self.playlist_order[i]=i;
	},
	skipHard: function(index) {
		var self = this;

		self.index = self.playlist_order.indexOf(index);
		self.skipTo(self.index);
	},
	skipNext: function() {
		var self = this;
		var next_index = self.index + 1;

		self.index = next_index > self.playlist.length - 1 ? self.playlist_order[0] :  self.playlist_order[next_index];	
		self.play();
	},
	skipPrev: function() {
		var self = this;
		var prev_index = self.index - 1;

		self.index = prev_index < 0 ? self.playlist_order[self.playlist.length - 1] : self.playlist_order[prev_index];
		self.play();
	},
	skipTo: function (index) {
		var self = this;

		self.index = index > self.playlist.length - 1 ? self.playlist_order[0] : index < 0 ? self.playlist_order[self.playlist.length - 1] : self.playlist_order[index];
		console.log('CURRENT INDEX: ' + self.index);
		console.log('NOW PLAYING: ' + self.playlist_order[self.index]);
		var track_obj = self.playlist[self.playlist_order[self.index]];

		self.current_audio.src = `/static/tracks/${track_obj.file}.webm`;
		title.innerHTML = `<b>${track_obj.author}</b> &mdash; ${track_obj.name}`;
		duration.innerHTML = `${self.formatTime(track_obj.duration_seconds)}`;
		self.play();
	},
	shuffle: function () {
		var self = this;

		self.shuffled = !self.shuffled;
		self.resetPlaylistOrder();

		if (self.shuffled) {
			// http://stackoverflow.com/questions/962802#962890
			var tmp, current, top = self.playlist.length;
			if(top) while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = self.playlist_order[current];
				self.playlist_order[current] = self.playlist_order[top];
				self.playlist_order[top] = tmp;
			};
			self.index = self.playlist_order.indexOf(self.index);
		};
		console.log('NEW PLAYLIST ORDER: ' + self.playlist_order);
	}
};

var switchActiveState = function (e) {
	e.stopImmediatePropagation();
	let target = e.currentTarget;
	if (target.hasAttribute('active')) {
		target.removeAttribute('active');
		target.firstChild.classList.remove('active');
	} else {
		target.setAttribute('active', '');
		target.firstChild.classList.add('active');
	};
};

var player = new Player(playlist_obj);

for (let i = 0; i < playlist_obj.length; i++) {
	var track_obj = playlist_obj[i];
	var track_elem = document.getElementById(`${track_obj.source_name}-${track_obj.source_id}`);
	track_elem.addEventListener('click', player.skipHard.bind(player, i));
};

pauseBtn.style.display = 'none';

repeatBtn.addEventListener('click', function(e) {
	switchActiveState(e);
	player.repeat = !player.repeat; 
});

shuffleBtn.addEventListener('click', function (e) {
	switchActiveState(e);
	player.shuffle();
});

nextBtn.addEventListener('click', function(e) {
	e.stopImmediatePropagation();
	player.skipTo(player.index+1);
});
prevBtn.addEventListener('click', function (e) {
	e.stopImmediatePropagation();
	player.skipTo(player.index-1);
});

playBtn.addEventListener('click', function (e) {
	e.stopImmediatePropagation();
	player.play();
});
pauseBtn.addEventListener('click', function (e) {
	e.stopImmediatePropagation();
	player.pause();
});

