export async function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	// Return 401 JSON instead of redirecting — frontend handles the redirect
	res.status(401).json({ error: "Unauthorized" });
}