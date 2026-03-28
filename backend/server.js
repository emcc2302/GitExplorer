import "./config/env.js";

import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import MongoStore from "connect-mongo";

import "./passport/github.auth.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import exploreRoutes from "./routes/explore.route.js";
import chatRoutes from "./routes/chat.route.js";

import connectMongoDB from "./db/connectMongoDB.js";
import { Message } from "./models/user.model.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

const isAllowedOrigin = (origin) => {
	if (!origin) return true; // allow non-browser (curl, Postman)
	if (!isProduction && origin.startsWith("http://localhost")) return true;
	if (origin === process.env.CLIENT_BASE_URL) return true;
	// Allow ALL Vercel preview deployments for this project
	if (origin.match(/https:\/\/git-explorer-.*\.vercel\.app$/)) return true;
	return false;
};

const corsOptions = {
	origin: (origin, callback) => {
		if (isAllowedOrigin(origin)) {
			callback(null, true);
		} else {
			callback(new Error(`CORS blocked: ${origin}`));
		}
	},
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const sessionMiddleware = session({
	name: "connect.sid",
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: process.env.MONGO_URI,
		ttl: 7 * 24 * 60 * 60,
		autoRemove: "native",
	}),
	cookie: {
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		httpOnly: true,
		maxAge: 7 * 24 * 60 * 60 * 1000,
	},
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/chat", chatRoutes);

const io = new Server(httpServer, { cors: corsOptions });

io.use((socket, next) => { sessionMiddleware(socket.request, {}, next); });
io.use((socket, next) => {
	passport.initialize()(socket.request, {}, () => {
		passport.session()(socket.request, {}, next);
	});
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
	const user = socket.request.user;
	if (!user) { socket.disconnect(); return; }
	const username = user.username;
	onlineUsers.set(username, socket.id);
	io.emit("online_users", Array.from(onlineUsers.keys()));
	console.log(`✅ ${username} connected`);

	socket.on("send_message", async ({ to, content }) => {
		if (!content?.trim()) return;
		try {
			const message = await Message.create({ senderId: username, receiverId: to, content: content.trim() });
			const payload = { _id: message._id, senderId: username, receiverId: to, content: message.content, createdAt: message.createdAt };
			const recipientSocketId = onlineUsers.get(to);
			if (recipientSocketId) io.to(recipientSocketId).emit("receive_message", payload);
			socket.emit("message_sent", payload);
		} catch (err) {
			socket.emit("error", { message: "Failed to send message" });
		}
	});

	socket.on("disconnect", () => {
		onlineUsers.delete(username);
		io.emit("online_users", Array.from(onlineUsers.keys()));
		console.log(`❌ ${username} disconnected`);
	});
});

await connectMongoDB();
httpServer.listen(PORT, () => {
	console.log(`🚀 Server on port ${PORT} [${isProduction ? "production" : "development"}]`);
});