import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = express.Router();

const OAuthCode = mongoose.model("OAuthCode", new mongoose.Schema({
	code: { type: String, unique: true },
	createdAt: { type: Date, default: Date.now, expires: 120 },
}));

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", async (req, res, next) => {
	const code = req.query.code;
	if (!code) return res.redirect(process.env.CLIENT_BASE_URL + "/login");

	try {
		await OAuthCode.create({ code });
	} catch (err) {
		console.log("Duplicate OAuth callback ignored");
		return res.redirect(process.env.CLIENT_BASE_URL + "/");
	}

	passport.authenticate("github", {
		failureRedirect: process.env.CLIENT_BASE_URL + "/login",
		session: false, // Don't use session — use JWT instead
	})(req, res, next);
}, (req, res) => {
	console.log("✅ GitHub OAuth success for:", req.user?.username);
	// Create a long-lived JWT (7 days)
	const token = jwt.sign(
		{ userId: req.user._id.toString() },
		process.env.SESSION_SECRET,
		{ expiresIn: "7d" }
	);
	res.redirect(`${process.env.CLIENT_BASE_URL}/?token=${token}`);
});

router.get("/verify-token", async (req, res) => {
	const { token } = req.query;
	if (!token) return res.json({ user: null });
	try {
		const decoded = jwt.verify(token, process.env.SESSION_SECRET);
		const user = await User.findById(decoded.userId);
		if (!user) return res.json({ user: null });
		console.log("✅ Token verified for:", user.username);
		res.json({ user });
	} catch (err) {
		console.error("Token verify error:", err.message);
		res.json({ user: null });
	}
});

// Check auth via JWT token in Authorization header
router.get("/check", async (req, res) => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];
		try {
			const decoded = jwt.verify(token, process.env.SESSION_SECRET);
			const user = await User.findById(decoded.userId);
			return res.json({ user });
		} catch (err) {
			return res.json({ user: null });
		}
	}
	// Fallback to session
	if (req.isAuthenticated()) return res.json({ user: req.user });
	res.json({ user: null });
});

router.get("/logout", (req, res) => {
	res.json({ message: "Logged out" });
});

export default router;