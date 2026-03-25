import User, { Message } from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
	try {
		const { username } = req.params;
		const currentUser = await User.findById(req.user._id);
		const targetUser = await User.findOne({ username });

		if (!targetUser) return res.status(404).json({ error: "User not found" });
		if (currentUser.username === username) return res.status(400).json({ error: "Cannot friend yourself" });
		if (currentUser.friends.includes(username)) return res.status(400).json({ error: "Already friends" });
		if (currentUser.sentRequests.includes(username)) return res.status(400).json({ error: "Request already sent" });
		if (targetUser.sentRequests.includes(currentUser.username)) {
			// They already sent us a request - auto accept
			currentUser.friends.push(username);
			targetUser.friends.push(currentUser.username);
			currentUser.sentRequests = currentUser.sentRequests.filter(u => u !== username);
			targetUser.sentRequests = targetUser.sentRequests.filter(u => u !== currentUser.username);
			currentUser.friendRequests = currentUser.friendRequests.filter(r => r.username !== username);
			targetUser.friendRequests = targetUser.friendRequests.filter(r => r.username !== currentUser.username);
			await Promise.all([currentUser.save(), targetUser.save()]);
			return res.status(200).json({ message: "You are now friends!", status: "friends" });
		}

		targetUser.friendRequests.push({ username: currentUser.username, avatarUrl: currentUser.avatarUrl });
		currentUser.sentRequests.push(username);
		await Promise.all([currentUser.save(), targetUser.save()]);
		res.status(200).json({ message: "Friend request sent!", status: "pending" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const acceptFriendRequest = async (req, res) => {
	try {
		const { username } = req.params;
		const currentUser = await User.findById(req.user._id);
		const requester = await User.findOne({ username });

		if (!requester) return res.status(404).json({ error: "User not found" });

		currentUser.friends.push(username);
		requester.friends.push(currentUser.username);
		currentUser.friendRequests = currentUser.friendRequests.filter(r => r.username !== username);
		requester.sentRequests = requester.sentRequests.filter(u => u !== currentUser.username);

		await Promise.all([currentUser.save(), requester.save()]);
		res.status(200).json({ message: "Friend request accepted!" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const declineFriendRequest = async (req, res) => {
	try {
		const { username } = req.params;
		const currentUser = await User.findById(req.user._id);
		const requester = await User.findOne({ username });

		currentUser.friendRequests = currentUser.friendRequests.filter(r => r.username !== username);
		if (requester) {
			requester.sentRequests = requester.sentRequests.filter(u => u !== currentUser.username);
			await requester.save();
		}
		await currentUser.save();
		res.status(200).json({ message: "Friend request declined" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getFriendStatus = async (req, res) => {
	try {
		const { username } = req.params;
		const currentUser = await User.findById(req.user._id);

		if (currentUser.friends.includes(username)) return res.json({ status: "friends" });
		if (currentUser.sentRequests.includes(username)) return res.json({ status: "pending_sent" });
		const incomingReq = currentUser.friendRequests.find(r => r.username === username);
		if (incomingReq) return res.json({ status: "pending_received" });
		return res.json({ status: "none" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getFriends = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		const friends = await User.find({ username: { $in: currentUser.friends } }).select("username name avatarUrl");
		res.json({ friends });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getPendingRequests = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id);
		res.json({ friendRequests: currentUser.friendRequests });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { username } = req.params;
		const currentUser = req.user.username;
		const messages = await Message.find({
			$or: [
				{ senderId: currentUser, receiverId: username },
				{ senderId: username, receiverId: currentUser },
			],
		}).sort({ createdAt: 1 });
		res.json({ messages });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
