import User from "../models/user.model.js";

const githubCache = new Map();

const CACHE_TTL = 5 * 60 * 1000;

export const getUserProfileAndRepos = async (req, res) => {
	const { username } = req.params;

	try {
		if (!process.env.GITHUB_API_KEY) {
			return res.status(500).json({
				error: "GitHub API key not configured on server",
			});
		}

		const cached = githubCache.get(username);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			console.log("Serving from cache:", username);
			return res.status(200).json(cached.data);
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 15000);

		const headers = {
			Authorization: `Bearer ${process.env.GITHUB_API_KEY}`,
			Accept: "application/vnd.github+json",
		};

		const userRes = await fetch(
			`https://api.github.com/users/${username}`,
			{
				headers,
				signal: controller.signal,
			}
		);

		if (!userRes.ok) {
			const text = await userRes.text();
			clearTimeout(timeoutId);
			return res.status(userRes.status).json({
				error: "Failed to fetch GitHub user",
				details: text,
			});
		}

		const userProfile = await userRes.json();

		if (!userProfile.repos_url) {
			clearTimeout(timeoutId);
			return res.status(500).json({
				error: "GitHub repos_url missing",
			});
		}

		const repoRes = await fetch(userProfile.repos_url, {
			headers,
			signal: controller.signal,
		});

		if (!repoRes.ok) {
			const text = await repoRes.text();
			clearTimeout(timeoutId);
			return res.status(repoRes.status).json({
				error: "Failed to fetch repositories",
				details: text,
			});
		}

		const repos = await repoRes.json();

		clearTimeout(timeoutId);

		const responseData = { userProfile, repos };

		githubCache.set(username, {
			data: responseData,
			timestamp: Date.now(),
		});

		res.status(200).json(responseData);
	} catch (error) {
		if (error.name === "AbortError") {
			return res.status(504).json({
				error: "GitHub API request timed out",
			});
		}

		console.error("GitHub fetch error:", error);
		res.status(500).json({ error: error.message });
	}
};

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
