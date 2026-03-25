import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true },
		receiverId: { type: String, required: true },
		content: { type: String, required: true },
		read: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		name: { type: String, default: "" },
		profileUrl: { type: String, required: true },
		avatarUrl: { type: String },
		likedProfiles: { type: [String], default: [] },
		likedBy: [
			{
				username: { type: String, required: true },
				avatarUrl: { type: String },
				likedDate: { type: Date, default: Date.now },
			},
		],
		friendRequests: [
			{
				username: { type: String, required: true },
				avatarUrl: { type: String },
				sentAt: { type: Date, default: Date.now },
			},
		],
		friends: { type: [String], default: [] },
		sentRequests: { type: [String], default: [] },
	},
	{ timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
const User = mongoose.model("User", userSchema);
export default User;
