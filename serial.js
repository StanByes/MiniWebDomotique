import { SerialPort } from "serialport";

import { addLog } from "./index.js";

// We register a constant to map int values, which will be send, to the real action type
const EVENT_TYPE_MAP = new Map([[1, "FIRE"], [2, "DOOR_OPEN"], [3, "SHUTTER_OPEN"], [4, "DOOR_CLOSE"], [5, "SHUTTER_CLOSE"], [6, "FAN"], [7, "LIGHT_ON"], [8, "LIGHT_OFF"]]);

// We create an instance of SerialPort, allowing to read all of information sent to the specified port
const port = new SerialPort({
  path: "/dev/ttyACM0",
  baudRate: 9600
});

// Debug to ensure port reader is working
port.on("open", () => {
  console.log("Serial port connected !");
});

// We register to the event "data", allow our script to know when data is sent to the port (Arduino -> Computer) and read them
port.on("data", (data) => {
  // We convert the data from buffer (not readable data) to a string
  const formattedData = Buffer.from(data, "utf8").toString();

  // We change the type from string to an int to reconcile the data with the EVENT_TYPE_MAP indexes
  const parsedData = parseInt(formattedData);
  // Checking if the data, after the type change, is really a number
  if (isNaN(parsedData)) {
    return;
  }

  // Reconcile number parsed data to his action type name
  const eventType = EVENT_TYPE_MAP.get(parsedData);
  // Ensure an eventType exists for this value
  if (!eventType) {
    return;
  }

  // Add it to the database and send WebSocket info to refresh web clients
  addLog(eventType);
});

// Debug to know if an error occured when we try to connect to the port
port.on("error", (error) => {
  console.error(error)
});
