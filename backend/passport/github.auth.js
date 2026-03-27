import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

// Serialize only the user ID into the session
passport.serializeUser(function (user, done) {
	done(null, user._id.toString());
});

// Deserialize by fetching fresh user from DB using the stored ID
passport.deserializeUser(async function (id, done) {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err, null);
	}
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
				let user = await User.findOne({ username: profile.username });
				if (!user) {
					user = new User({
						name: profile.displayName,
						username: profile.username,
						profileUrl: profile.profileUrl,
						avatarUrl: profile.photos[0].value,
						likedProfiles: [],
						likedBy: [],
					});
					await user.save();
				}
				done(null, user);
			} catch (err) {
				done(err, null);
			}
		}
	)
);