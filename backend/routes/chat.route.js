import express from "express";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";
import {
	sendFriendRequest,
	acceptFriendRequest,
	declineFriendRequest,
	getFriendStatus,
	getFriends,
	getPendingRequests,
	getMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/friend-request/:username", ensureAuthenticated, sendFriendRequest);
router.post("/friend-request/:username/accept", ensureAuthenticated, acceptFriendRequest);
router.post("/friend-request/:username/decline", ensureAuthenticated, declineFriendRequest);
router.get("/friend-status/:username", ensureAuthenticated, getFriendStatus);
router.get("/friends", ensureAuthenticated, getFriends);
router.get("/pending-requests", ensureAuthenticated, getPendingRequests);
router.get("/messages/:username", ensureAuthenticated, getMessages);

export default router;
