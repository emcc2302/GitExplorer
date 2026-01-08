import "./config/env.js";

import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";

import "./passport/github.auth.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import exploreRoutes from "./routes/explore.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
	cors({
		origin: process.env.CLIENT_BASE_URL,
		credentials: true,
	})
);

app.use(express.json());

app.use(
	session({
		name: "connect.sid",
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: true,     
			sameSite: "none", 
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/explore", exploreRoutes);

await connectMongoDB();
app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);
});
