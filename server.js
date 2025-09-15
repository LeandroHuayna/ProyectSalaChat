const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {}; // socket.id -> username

io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("set-username", (username) => {
        users[socket.id] = username;
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        const username = users[socket.id] || "Desconocido";
        console.log(`${username} se unió a la sala: ${room}`);
        socket.to(room).emit("chat-message", { username: "Sistema", message: `${username} se ha unido a la sala` });
    });

    socket.on("leave-room", (room) => {
        socket.leave(room);
        const username = users[socket.id] || "Desconocido";
        console.log(`${username} salió de la sala: ${room}`);
        socket.to(room).emit("chat-message", { username: "Sistema", message: `${username} ha salido de la sala` });
    });

    socket.on("chat-message", ({ room, username, message }) => {
        console.log(`[${room}] ${username}: ${message}`);
        io.to(room).emit("chat-message", { username, message });
    });

    socket.on("disconnect", () => {
        const username = users[socket.id] || "Desconocido";
        console.log(`Cliente desconectado: ${username}`);
        const rooms = socket.rooms;
        rooms.forEach((room) => {
            if (room !== socket.id) {
                socket.to(room).emit("chat-message", { username: "Sistema", message: `${username} se ha desconectado` });
            }
        });
        delete users[socket.id];
    });
});

//server.listen(port, () => {
//    console.log(`Servidor MC corriendo en http://localhost:${port}`);
//});
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor MC corriendo en http://${require('os').hostname()}:${port}`);
});

