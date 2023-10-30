import { socket } from './websockets.js';

var members_table = document.getElementById('info__table').tBodies[0];
var room_code = document.getElementById('info__code');

socket.on('connect', () => {
	socket.emit('join', {'username': localStorage.getItem('username'), 'room_code': localStorage.getItem('room_code')}); 
});

socket.on('join', (username) => {
	console.log(`${username} joined`)
	members_table.appendChild(document.createElement('tr'));
	var temp = document.createElement('td');
	temp.textContent = username;
	members_table.lastElementChild.appendChild(temp);
});

socket.on('leave', (username) => {
	console.log(`${username} left`)
	for (let i = 0; i < members_table.children.length; i++) {
		var child = members_table.children[i];
		if (child.innerText === username) {
			members_table.removeChild(child);
			break;
		};
	}	
});
