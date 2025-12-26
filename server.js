import dotenv from 'dotenv'; // if using ES modules
dotenv.config();

import fs from "fs";
import path from "path";

import https from "https";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { loadJSONSync } from './loadJSONSync.js';
import { loadTXTSync } from './loadTXTSync.js';

// const waves = loadJSONSync('./waves.json');
// console.log(waves);

// const words = loadTXTSync('./words.txt');
// console.log(words.length);


const USERS = new Map();
const ROOMS = new Map();

ROOMS.set("1", { id: 1 , name: "TEST", maxPlayers: 100, players: [] });



// --- Express setup ---
const app = express();

app.get("/backgrounds.css", (req, res) => {
  res.send("Socket.IO HTTPS server is running!");
});


let server;

// --- Adjust these paths to match your Let's Encrypt certificate files ---
let privateKey;// = fs.readFileSync("/etc/letsencrypt/live/pasciak.com/privkey.pem");
let certificate;// = fs.readFileSync("/etc/letsencrypt/live/pasciak.com/fullchain.pem");

try {
  privateKey = fs.readFileSync("privkey.pem");
  certificate = fs.readFileSync("fullchain.pem");
  // --- Create HTTPS server ---
  server = https.createServer({ key: privateKey, cert: certificate }, app);
} catch (err) {
  //console.error("❌ Failed to load SSL certs. Falling back to HTTP:", err);
  server = http.createServer(app);
}


app.use(express.static(path.join(import.meta.dirname, 'web')));



// --- Create Socket.IO server with CORS enabled for all origins ---
const io = new Server(server, {
  cors: {
    origin: "*", // allow all external sites
    methods: ["GET", "POST"],
  },
});

// Map socket.id => { nickname, room }




// --- Handle socket connections ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("list_rooms", () => {
    socket.emit("rooms_list", ROOMS);
  });


  socket.on("set_nickname", (nickname) => {
    //if nickanme in use
    nickname = nickname.trim().substring(0, 20); // limit length to 20 chars
    nickname = nickname.replace(/[^a-zA-Z0-9_]/g, ''); // allow only alphanumeric and underscores
    if (nickname.length === 0) {
      socket.emit("nickname_set_ack", { success: false, message: "Invalid nickname. Please choose a different one." });
      console.log("❌ Invalid nickname:", nickname);
      return;
    }
    if ([...USERS.values()].some(user => user.nickname === nickname)) {
      socket.emit("nickname_set_ack", { success: false, message: "Nickname already in use. Please choose another one." });
      console.log("❌ Nickname already in use:", nickname);
      return;
    }

    USERS.set(socket.id, { nickname: nickname, loginTime: new Date().toISOString() });
    socket.emit("nickname_set_ack", { success: true });
  });



  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
    const user = USERS.get(socket.id);
    if (user) {
      console.log(`(${socket.id})  start ${user.loginTime} disconnected`);
      USERS.delete(socket.id);
    }
  });




});










// --- Start the HTTPS server ---
const PORT = 4433; // or 3001 if you’re testing locally
server.listen(PORT, () => {
  console.log(`✅ HTTPS Socket.IO server running on port ${PORT}`);
});
