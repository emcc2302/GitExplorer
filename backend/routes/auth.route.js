import express from "express";
import passport from "passport";

const router = express.Router();

// Track used OAuth codes to prevent double-processing
const usedCodes = new Set();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", (req, res, next) => {
    const code = req.query.code;

    // If this code was already used, redirect straight to frontend
    if (!code || usedCodes.has(code)) {
        console.log("Duplicate OAuth callback ignored");
        return res.redirect(process.env.CLIENT_BASE_URL + "/");
    }

    usedCodes.add(code);
    // Clean up old codes after 1 minute
    setTimeout(() => usedCodes.delete(code), 60000);

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