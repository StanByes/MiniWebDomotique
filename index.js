import express, { static as expressStatic } from "express";
import { createServer } from "http";
import * as path from "path";
import { Server } from "socket.io";

// We import the serial file to create the instance of port reader
import "./serial.js";

// We import the model methods to interact with DB
import { getLogs, insertLog } from "./db.js";

// Folder path constants
const DIR_PATH = import.meta.dirname;
const PUBLIC_PATH = path.join(DIR_PATH, "public");
const VIEWS_PATH = path.join(DIR_PATH, "views");

// Data init at server start
const data = {
  logs: getLogs()
};

// Create express web server instance and WebSocket (socket.io) and configure them
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(expressStatic(PUBLIC_PATH));

// Route [GET] /data to send data from the database
app.get("/data", (request, response) => {
  return response.status(200).json(data);
});

// All routes send the client to the index.html
app.use((request, response, next) => {
  response.sendFile(path.join(VIEWS_PATH, "index.html"));
});

// Listen to the "connection" event and show a message in the console (debug purpose)
io.on("connection", (client) => {
  console.log("New client connected - " + client.id);

  // Same logic for "disconnected" event
  client.on("disconnected", () => {
    console.log("Client disconnected - " + client.id);
  });
});

// Function to add a new log from the serial to the database and send information to clients through websocket
export const addLog = (eventType) => {
  const logData = {type: eventType, time: Date.now()};
  const insertedId = insertLog(logData);

  data.logs.push({id: insertedId, ...logData});
  data.logs = data.logs.sort((a, b) => b.time - a.time);

  io.emit("data");
};

// Indicate to the server to listen the port 3000 to be accessible
server.listen(3000, () => {
  console.log("Hello, World !");
});
