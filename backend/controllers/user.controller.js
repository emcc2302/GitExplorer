import User from "../models/user.model.js";

export const getUserProfileAndRepos = async (req, res) => {
	const { username } = req.params;

	try {
		if (!process.env.GITHUB_API_KEY) {
			return res.status(500).json({
				error: "GitHub API key not configured on server",
			});
		}

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
				error: "GitHub user repos_url missing",
			});
		}

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
