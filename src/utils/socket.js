import { io } from "socket.io-client";
//const URL = "http://localhost:5000";
const URL = "https://mini-zoom-example.onrender.com";
export const socket = io(URL);

