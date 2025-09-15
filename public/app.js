const socket = io("https://chat-salas-leo.onrender.com");
let username = "";
let currentRoom = "";

// Elementos del DOM
const loginScreen = document.getElementById("login-screen");
const roomSelectionScreen = document.getElementById("room-selection-screen");
const chatScreen = document.getElementById("chat-screen");

const usernameInput = document.getElementById("username-input");
const loginBtn = document.getElementById("login-btn");
const displayUsername = document.getElementById("display-username");
const logoutBtn = document.getElementById("logout-btn");

const publicRoomBtn = document.getElementById("public-room-btn");
const privateRoomNameInput = document.getElementById("private-room-name");
const createPrivateRoomBtn = document.getElementById("create-private-room-btn");
const joinPrivateRoomBtn = document.getElementById("join-private-room-btn");

const chatRoomName = document.getElementById("chat-room-name");
const messagesDiv = document.getElementById("messages");
const chatMessageInput = document.getElementById("chat-message-input");
const sendMessageBtn = document.getElementById("send-message-btn");
const backToRoomsBtn = document.getElementById("back-to-rooms-btn");

// ----- Funciones de navegación -----
loginBtn.addEventListener("click", login);
usernameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") login();
});

function login() {
    let value = usernameInput.value.trim();
    if (value.length === 0) {
        alert("Debe ingresar un nombre de usuario");
        return;
    }
    if (value.length > 15) {
        alert("El nombre de usuario debe tener máximo 15 caracteres");
        return;
    }
    username = value;
    displayUsername.textContent = username;
    socket.emit("set-username", username); // Guardar nombre en servidor
    loginScreen.classList.add("hidden");
    roomSelectionScreen.classList.remove("hidden");
}

logoutBtn.addEventListener("click", () => {
    username = "";
    usernameInput.value = "";
    roomSelectionScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
});

publicRoomBtn.addEventListener("click", () => {
    joinRoom("Sala Pública");
});

createPrivateRoomBtn.addEventListener("click", () => {
    const room = privateRoomNameInput.value.trim();
    if (room.length >= 8 && room.length <= 10) {
        joinRoom(room);
    } else {
        alert("La sala privada debe tener entre 8 y 10 caracteres");
    }
});

joinPrivateRoomBtn.addEventListener("click", () => {
    const room = privateRoomNameInput.value.trim();
    if (room.length >= 8 && room.length <= 10) {
        joinRoom(room);
    } else {
        alert("La sala privada debe tener entre 8 y 10 caracteres");
    }
});

backToRoomsBtn.addEventListener("click", () => {
    socket.emit("leave-room", currentRoom);
    chatScreen.classList.add("hidden");
    roomSelectionScreen.classList.remove("hidden");
    messagesDiv.innerHTML = "";
});

// ----- Funciones de chat -----
sendMessageBtn.addEventListener("click", sendMessage);
chatMessageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const msg = chatMessageInput.value.trim();
    if (msg.length === 0) return;
    socket.emit("chat-message", { room: currentRoom, username, message: msg });
    chatMessageInput.value = "";
}

function joinRoom(room) {
    if (currentRoom) socket.emit("leave-room", currentRoom);
    currentRoom = room;
    chatRoomName.textContent = room;
    roomSelectionScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
    messagesDiv.innerHTML = "";
    socket.emit("join-room", room);
}

// ----- Eventos de Socket.IO -----
socket.on("chat-message", (data) => {
    const msgElem = document.createElement("div");
    if (data.username === "Sistema") {
        msgElem.style.color = "#50fa7b";
        msgElem.style.fontStyle = "italic";
    }
    msgElem.textContent = `${data.username}: ${data.message}`;
    messagesDiv.appendChild(msgElem);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

