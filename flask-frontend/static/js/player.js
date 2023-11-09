export { player };

var player_elements = ['playBtn', 'pauseBtn', 'nextBtn', 'prevBtn', 'repeatBtn', 'shuffleBtn', 'title', 'duration', 'progress', 'progressBar']; 
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
		self.current_audio.ontimeupdate = self.updateProgress.bind(self);
		self.resetPlaylistOrder();
	},
	fastforward: function(e) {
		var self = this;
		per = (e.clientX - progress.offsetLeft) / progress.offsetWidth;

		if(self.current_audio.src) {
			per = per < 0 ? 0 : per > 100 ? 100 : per;
			progressBar.style.width = `${per * 100}%`;
			duration.innerHTML = `${self.formatTime(Math.floor(per * self.current_audio.duration))}`;
		};
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
	skipTo: function (index) {
		var self = this;

		self.index = index > self.playlist.length - 1 ? 0 : index < 0 ? self.playlist.length - 1 : index;
		var track_obj = self.playlist[self.playlist_order[self.index]];

		self.current_audio.src = `/static/tracks/${track_obj.file}.webm`;
		title.innerHTML = `<b>${track_obj.author}</b> &mdash; ${track_obj.name}`;
		duration.innerHTML = `${self.formatTime(0)}`;
		progressBar.style.width = '0%';
		self.play();
	},
	shuffle: function () {
		var self = this;

		self.shuffled = !self.shuffled;

		if (self.shuffled) {
			// http://stackoverflow.com/questions/962802#962890
			var tmp, current, top = self.playlist.length;
			if(top) while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = self.playlist_order[current];
				self.playlist_order[current] = self.playlist_order[top];
				self.playlist_order[top] = tmp;
			}
			self.index = self.playlist_order.indexOf(self.index);
		} else {
			self.index = self.playlist_order[self.index];
			self.resetPlaylistOrder()
		};
	},
	updateProgress: function () {
		var self = this;

		var current_per = Number(Number(self.current_audio.currentTime / self.current_audio.duration * 100).toFixed(2));
		progressBar.style.width = `${current_per}%`;
		duration.innerHTML = `${self.formatTime(Math.floor(self.current_audio.currentTime))}`;
	}
};

var switchActiveState = function (e) {
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
	player.skipTo(player.index+1);
});
prevBtn.addEventListener('click', function (e) {
	player.skipTo(player.index-1);
});

playBtn.addEventListener('click', function (e) {
	player.play();
});
pauseBtn.addEventListener('click', function (e) {
	player.pause();
});

/* All this below works cool and all, but I really don't like how it's implemented */
/* P.S. Also this is prone to a bug: if you move the cursor, and then hold the click without moving it - nothing
changes up until you either let go of the click or even just slightly move the cursor */
var ff = function (e) { player.fastforward(e); };
var per = 0;

progress.addEventListener('mousedown', function (e) {
	progress.addEventListener('mousemove', ff);
	player.current_audio.ontimeupdate = null;
});
progress.addEventListener('mouseup', function (e) {
	player.current_audio.ontimeupdate = player.updateProgress.bind(player);
	progress.removeEventListener('mousemove', ff);
	player.current_audio.currentTime = player.current_audio.duration * per;
});
progress.addEventListener('click', function (e) {
	ff(e);
	player.current_audio.currentTime = player.current_audio.duration * per;
});
