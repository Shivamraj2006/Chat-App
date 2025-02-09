const socket = io('ws://localhost:3500');

const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');
const formJoin = document.querySelector('.form-join');
const chatHeader = document.querySelector('.chat-header');
const exitRoomBtn = document.querySelector('#exit-room');

function sendMessage(e) {
    e.preventDefault();
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        });
        msgInput.value = "";
    }
    msgInput.focus();
}

function enterRoom(e) {
    e.preventDefault();
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        });

        formJoin.classList.add('hidden');
        chatHeader.style.display = 'flex';
        document.querySelector('.room-name').textContent = chatRoom.value;
        exitRoomBtn.style.display = 'block';
    }
}

exitRoomBtn.addEventListener('click', () => {
    location.reload(); // Refresh to leave the room
});

document.querySelector('.form-msg').addEventListener('submit', sendMessage);
document.querySelector('.form-join').addEventListener('submit', enterRoom);

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value);
});

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = "";
    const { name, text, time } = data;
    const li = document.createElement('li');
    li.className = 'post';
    if (name === nameInput.value) li.classList.add('post--left');
    else if (name !== 'Admin') li.classList.add('post--right');

    li.innerHTML = name !== 'Admin' ? `
        <div class="post__header ${name === nameInput.value ? 'post__header--user' : 'post__header--reply'}">
            <span class="post__header--name">${name}</span> 
            <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>
    ` : `<div class="post__text">${text}</div>`;

    chatDisplay.appendChild(li);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = "";
    }, 3000);
});

socket.on('userList', ({ users }) => showUsers(users));
socket.on('roomList', ({ rooms }) => showRooms(rooms));

function showUsers(users) {
    usersList.textContent = users.length ? `Users in ${chatRoom.value}: ${users.map(u => u.name).join(", ")}` : "";
}

function showRooms(rooms) {
    roomList.textContent = rooms.length ? `Active Rooms: ${rooms.join(", ")}` : "";
}
