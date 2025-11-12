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




// --- Express setup ---
const app = express();


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
  USERS.set(socket.id, { nickname: 'unknown',loginTime: Date.now() });  
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
