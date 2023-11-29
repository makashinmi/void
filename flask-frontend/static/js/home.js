import { socket } from './websockets.js';

var form = document.getElementsByTagName('form')[0];

form.addEventListener('submit', (e) => {
	e.preventDefault();
	localStorage.setItem('username', form.username.value);
	localStorage.setItem('room_code', form.room_code.value);
	form.submit();
});
