var player_elements = ['playBtn', 'pauseBtn', 'nextBtn', 'prevBtn', 'repeatBtn', 'shuffleBtn'] 
player_elements.forEach(function (id) {
	window[id] = document.getElementById(id);
});

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

var togglePlay = function (e) {
	e.stopImmediatePropagation();
	if (playBtn.checkVisibility()) {
		playBtn.style.display = 'none';
		pauseBtn.style.display = 'block';
	} else {
		playBtn.style.display = 'block';
		pauseBtn.style.display = 'none';
	};
};

pauseBtn.style.display = 'none';

repeatBtn.addEventListener('click', switchActiveState);
shuffleBtn.addEventListener('click', switchActiveState);
nextBtn.addEventListener('click', alert.bind(null, 'next'));
prevBtn.addEventListener('click', alert.bind(null, 'prev'));
playBtn.addEventListener('click', togglePlay);
pauseBtn.addEventListener('click', togglePlay);

