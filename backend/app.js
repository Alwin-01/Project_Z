import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import connectToSocket from "./config/socket.js";
import meetingRoute from "./routes/meeting.route.js";
import authRoute from "./routes/auth.route.js";
import roomRoute from "./routes/roomRoutes.js";

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/meeting", meetingRoute);
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);

// Connect to Database
connectDB();

// Socket.io 
const io = connectToSocket(server);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-meeting", (data) => {
    const { meetingId, userId } = data;
    socket.join(meetingId);
    console.log(`${userId} joined meeting ${meetingId}`);
    
    // Notify others in the room
    socket.to(meetingId).emit("participant-joined", {
      roomName: meetingId,
      participant: {
        identity: userId,
        sid: socket.id
      }
    });
    
    socket.emit("joined-meeting", { meetingId, userId });
  });

  socket.on("leave-meeting", (data) => {
    const { meetingId, userId } = data;
    socket.leave(meetingId);
    console.log(`${userId} left meeting ${meetingId}`);
  });

  socket.on("chat-message", (data) => {
    const { roomName, message, sender, timestamp } = data;
    io.emit("chat-message", { roomName, message, sender, timestamp });
    console.log(`Chat message in ${roomName}: ${sender}: ${message}`);
  });

  socket.on("video-stream", (data) => {
    const { roomName, participantName, hasVideo } = data;
    socket.to(roomName).emit("video-stream", { participantName, hasVideo });
    console.log(`Video stream in ${roomName}: ${participantName} has video: ${hasVideo}`);
  });

  socket.on("camera-toggle", (data) => {
    const { roomName, participantName, isCameraOff } = data;
    socket.to(roomName).emit("camera-toggle", { participantName, isCameraOff });
    console.log(`Camera toggle in ${roomName}: ${participantName} camera off: ${isCameraOff}`);
  });

  // WebRTC signaling
  socket.on("offer", (data) => {
    const { to, offer } = data;
    socket.to(to).emit("offer", { from: socket.id, offer });
    console.log(`Relaying offer from ${socket.id} to ${to}`);
  });

  socket.on("answer", (data) => {
    const { to, answer } = data;
    socket.to(to).emit("answer", { from: socket.id, answer });
    console.log(`Relaying answer from ${socket.id} to ${to}`);
  });

  socket.on("ice-candidate", (data) => {
    const { to, candidate } = data;
    socket.to(to).emit("ice-candidate", { from: socket.id, candidate });
    console.log(`Relaying ICE candidate from ${socket.id} to ${to}`);
  });

  socket.on("end-meeting", (data) => {
    const { meetingId } = data;
    io.to(meetingId).emit("meeting-ended", { meetingId });
    console.log(`Meeting ${meetingId} ended`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});