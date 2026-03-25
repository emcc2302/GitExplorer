import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

// env is already loaded by server.js via config/env.js — no need to re-import dotenv here

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const user = await User.findOne({ username: profile.username });
				if (!user) {
					const newUser = new User({
						name: profile.displayName,
						username: profile.username,
						profileUrl: profile.profileUrl,
						avatarUrl: profile.photos[0].value,
						likedProfiles: [],
						likedBy: [],
					});
					await newUser.save();
					done(null, newUser);
				} else {
					done(null, user);
				}
			} catch (err) {
				done(err, null);
			}
		}
	)
);
