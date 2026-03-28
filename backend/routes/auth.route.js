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
		session: true,
	})(req, res, next);
}, (req, res) => {
	console.log("✅ GitHub OAuth success for:", req.user?.username);
	const token = jwt.sign(
		{ userId: req.user._id.toString() },
		process.env.SESSION_SECRET,
		{ expiresIn: "5m" }
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

		// Login and explicitly save session before responding
		req.login(user, (err) => {
			if (err) {
				console.error("req.login error:", err);
				return res.json({ user: null });
			}
			// Force session save before sending response
			req.session.save((saveErr) => {
				if (saveErr) {
					console.error("Session save error:", saveErr);
					return res.json({ user: null });
				}
				console.log("✅ Session saved for:", user.username);
				res.json({ user });
			});
		});
	} catch (err) {
		console.error("Token verify error:", err);
		res.json({ user: null });
	}
});

router.get("/check", (req, res) => {
	if (req.isAuthenticated()) {
		return res.json({ user: req.user });
	}
	res.json({ user: null });
});

router.get("/logout", (req, res) => {
	req.logout((err) => {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.json({ message: "Logged out" });
		});
	});
});

export default router;