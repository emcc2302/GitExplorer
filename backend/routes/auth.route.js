import express from "express";
import passport from "passport";
import mongoose from "mongoose";

const router = express.Router();

// Deduplicate OAuth codes using MongoDB TTL index
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
		// Duplicate code = second Render instance — just redirect, don't process
		console.log("Duplicate OAuth callback ignored, redirecting to home");
		return res.redirect(process.env.CLIENT_BASE_URL + "/");
	}

	passport.authenticate("github", {
		failureRedirect: process.env.CLIENT_BASE_URL + "/login",
		keepSessionInfo: true,
	})(req, res, next);
}, (req, res) => {
	console.log("✅ GitHub OAuth success for:", req.user?.username);
	res.redirect(process.env.CLIENT_BASE_URL + "/");
});

router.get("/check", (req, res) => {
	if (req.isAuthenticated()) {
		res.json({ user: req.user });
	} else {
		res.json({ user: null });
	}
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