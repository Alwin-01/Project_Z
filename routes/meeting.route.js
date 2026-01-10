import express from "express";
import { createMeeting, joinMeeting, leaveMeeting } from "../controllers/meetingController.js";
const meetingRouter = express.Router();

meetingRouter.post("/create", createMeeting);
meetingRouter.post("/:meetingId/join", joinMeeting);
meetingRouter.post("/:meetingId/leave", leaveMeeting);

export default meetingRouter;