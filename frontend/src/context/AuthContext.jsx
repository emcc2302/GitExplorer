import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();

export const useAuthContext = () => {
	return useContext(AuthContext);
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = API_BASE_URL || "http://localhost:5000";

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);

	useEffect(() => {
		const checkUserLoggedIn = async () => {
			setLoading(true);
			try {
				// Check if redirected from OAuth with token
				const params = new URLSearchParams(window.location.search);
				const token = params.get("token");

				if (token) {
					// Remove token from URL immediately
					window.history.replaceState({}, "", "/");
					const res = await fetch(`${API_BASE_URL}/api/auth/verify-token?token=${token}`, {
						credentials: "include",
					});
					const data = await res.json();
					setAuthUser(data.user);
					setLoading(false);
					return;
				}

				// Normal session check
				const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
					credentials: "include",
				});
				const data = await res.json();
				setAuthUser(data.user);
			} catch (error) {
				toast.error(error.message);
				setAuthUser(null);
			} finally {
				setLoading(false);
			}
		};
		checkUserLoggedIn();
	}, []);

	// Connect socket when user logs in
	useEffect(() => {
		if (authUser) {
			const newSocket = io(SOCKET_URL, { withCredentials: true });
			setSocket(newSocket);
			newSocket.on("online_users", (users) => setOnlineUsers(users));
			return () => newSocket.close();
		} else {
			if (socket) socket.close();
			setSocket(null);
			setOnlineUsers([]);
		}
	}, [authUser]);

	return (
		<AuthContext.Provider value={{ authUser, setAuthUser, loading, socket, onlineUsers }}>
			{children}
		</AuthContext.Provider>
	);
};