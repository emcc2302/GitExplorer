import express from "express";
import passport from "passport";
import mongoose from "mongoose";

const router = express.Router();

// Store used OAuth codes in MongoDB so all instances share state
const OAuthCode = mongoose.model("OAuthCode", new mongoose.Schema({
    code: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 120 } // auto-delete after 2 min
}));

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", async (req, res, next) => {
    const code = req.query.code;

    if (!code) return res.redirect(process.env.CLIENT_BASE_URL + "/login");

    try {
        // Try to insert the code — if it already exists, duplicate request
        await OAuthCode.create({ code });
    } catch (err) {
        // Duplicate code — second instance trying to process same request
        console.log("Duplicate OAuth callback ignored");
        return res.redirect(process.env.CLIENT_BASE_URL + "/");
    }

    passport.authenticate("github", {
        failureRedirect: process.env.CLIENT_BASE_URL + "/login",
    })(req, res, next);
}, (req, res) => {
    console.log("GitHub OAuth success for:", req.user?.username);
    res.redirect(process.env.CLIENT_BASE_URL + "/");
});

router.get("/check", (req, res) => {
    if (req.isAuthenticated()) {
        res.send({ user: req.user });
    } else {
        res.send({ user: null });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        res.json({ message: "Logged out" });
    });
});

export default router;