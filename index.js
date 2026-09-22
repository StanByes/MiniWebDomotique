import express, { static as expressStatic } from "express";
import { createServer } from "http";
import * as path from "path";
import { Server } from "socket.io";

// We import the serial file to create the instance of port reader
import "./serial.js";

import { getLogs, insertLog } from "./db.js";

const DIR_PATH = import.meta.dirname;
const PUBLIC_PATH = path.join(DIR_PATH, "public");
const VIEWS_PATH = path.join(DIR_PATH, "views");

const data = {
  logs: getLogs()
};

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(expressStatic(PUBLIC_PATH));

app.get("/data", (request, response) => {
  return response.status(200).json(data);
});

app.use((request, response, next) => {
  response.sendFile(path.join(VIEWS_PATH, "index.html"));
});

io.on("connection", (client) => {
  console.log("New client connected - " + client.id);

  client.on("disconnected", () => {
    console.log("Client disconnected - " + client.id);
  });
});

export const addLog = (eventType) => {
  const logData = {type: eventType, time: Date.now()};
  const insertedId = insertLog(logData);

  data.logs.push({id: insertedId, ...logData});
  data.logs = data.logs.sort((a, b) => b.time - a.time);

  io.emit("data");
};

server.listen(3000, () => {
  console.log("Hello, World !");
});
