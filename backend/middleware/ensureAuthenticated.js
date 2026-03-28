import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function ensureAuthenticated(req, res, next) {
	// Check JWT in Authorization header
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		try {
			const token = authHeader.split(" ")[1];
			const decoded = jwt.verify(token, process.env.SESSION_SECRET);
			const user = await User.findById(decoded.userId);
			if (user) {
				req.user = user;
				return next();
			}
		} catch (err) {
			return res.status(401).json({ error: "Unauthorized" });
		}
	}
	// Fallback to session
	if (req.isAuthenticated()) return next();
	res.status(401).json({ error: "Unauthorized" });
}