import express from "express";
import * as meetingController from "../controllers/meetingController.js";
import * as meetingChatController from "../controllers/meetingChatController.js";
import { authenticateUser, authorizeHost } from "../middleware/authenticateMiddleware.js";

const router = express.Router();

// Meeting management routes (host only)
router.post("/create", authenticateUser, authorizeHost, meetingController.createMeeting);
router.get("/host", authenticateUser, authorizeHost, meetingController.getHostMeetings);
router.put("/:meetingId", authenticateUser, authorizeHost, meetingController.updateMeeting);
router.post("/:meetingId/participants", authenticateUser, authorizeHost, meetingController.addParticipants);
router.delete("/:meetingId/participants/:email", authenticateUser, authorizeHost, meetingController.removeParticipant);
router.put("/:meetingId/start", authenticateUser, authorizeHost, meetingController.startMeeting);
router.put("/:meetingId/end", authenticateUser, authorizeHost, meetingController.endMeeting);
router.put("/:meetingId/cancel", authenticateUser, authorizeHost, meetingController.cancelMeeting);

// Meeting participant routes (user only)
router.get("/user", authenticateUser, meetingController.getUserMeetings);
router.put("/:meetingId/respond", authenticateUser, meetingController.respondToInvitation);
router.post("/:meetingId/join", authenticateUser, meetingController.joinMeeting);
router.put("/:meetingId/leave", authenticateUser, meetingController.leaveMeeting);

// Common routes (both host and users)
router.get("/:meetingId", authenticateUser, meetingController.getMeetingById);

// Chat routes
router.post("/:meetingId/chat", authenticateUser, meetingChatController.sendMessage);
router.get("/:meetingId/chat", authenticateUser, meetingChatController.getChatMessages);

export default router;