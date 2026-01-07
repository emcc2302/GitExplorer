import User from "../models/user.model.js";

/**
 * Get GitHub user profile + repositories
 */
export const getUserProfileAndRepos = async (req, res) => {
	const { username } = req.params;

	try {
		if (!process.env.GITHUB_API_KEY) {
			return res.status(500).json({
				error: "GitHub API key not configured on server",
			});
		}

		// Fetch GitHub user
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_API_KEY}`,
				Accept: "application/vnd.github+json",
			},
		});

		if (!userRes.ok) {
			const text = await userRes.text();
			return res.status(userRes.status).json({
				error: "Failed to fetch GitHub user",
				details: text,
			});
		}

		const userProfile = await userRes.json();

		if (!userProfile.repos_url) {
			return res.status(500).json({
				error: "GitHub repos_url missing",
			});
		}

		// Fetch repositories
		const repoRes = await fetch(userProfile.repos_url, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_API_KEY}`,
				Accept: "application/vnd.github+json",
			},
		});

		if (!repoRes.ok) {
			const text = await repoRes.text();
			return res.status(repoRes.status).json({
				error: "Failed to fetch repositories",
				details: text,
			});
		}

		const repos = await repoRes.json();

		res.status(200).json({ userProfile, repos });
	} catch (error) {
		console.error("GitHub fetch error:", error);
		res.status(500).json({ error: error.message });
	}
};

/**
 * Like a user profile
 */
export const likeProfile = async (req, res) => {
	try {
		const { username } = req.params;

		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const user = await User.findById(req.user._id.toString());
		const userToLike = await User.findOne({ username });

		if (!userToLike) {
			return res.status(404).json({ error: "User is not a member" });
		}

		if (user.likedProfiles.includes(userToLike.username)) {
			return res.status(400).json({ error: "User already liked" });
		}

		userToLike.likedBy.push({
			username: user.username,
			avatarUrl: user.avatarUrl,
			likedDate: Date.now(),
		});

		user.likedProfiles.push(userToLike.username);

		await Promise.all([userToLike.save(), user.save()]);

		res.status(200).json({ message: "User liked" });
	} catch (error) {
		console.error("Like profile error:", error);
		res.status(500).json({ error: error.message });
	}
};

/**
 * Get users who liked the logged-in user
 */
export const getLikes = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const user = await User.findById(req.user._id.toString());

		res.status(200).json({ likedBy: user.likedBy });
	} catch (error) {
		console.error("Get likes error:", error);
		res.status(500).json({ error: error.message });
	}
};
