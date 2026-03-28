import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();
export const useAuthContext = () => useContext(AuthContext);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = API_BASE_URL || "http://localhost:5000";
const TOKEN_KEY = "git_explorer_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const authFetch = (url, options = {}) => {
	const token = getToken();
	return fetch(url, {
		...options,
		credentials: "include",
		headers: {
			...options.headers,
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			"Content-Type": "application/json",
		},
	});
};

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);

	useEffect(() => {
		const checkUserLoggedIn = async () => {
			setLoading(true);
			try {
				const params = new URLSearchParams(window.location.search);
				const urlToken = params.get("token");

				if (urlToken) {
					window.history.replaceState({}, "", "/");
					setToken(urlToken);
					const res = await fetch(`${API_BASE_URL}/api/auth/verify-token?token=${urlToken}`);
					const data = await res.json();
					setAuthUser(data.user);
					setLoading(false);
					return;
				}

				const existingToken = getToken();
				if (existingToken) {
					const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
						headers: { Authorization: `Bearer ${existingToken}` },
					});
					const data = await res.json();
					if (data.user) {
						setAuthUser(data.user);
					} else {
						removeToken();
						setAuthUser(null);
					}
				} else {
					setAuthUser(null);
				}
			} catch (error) {
				toast.error(error.message);
				setAuthUser(null);
			} finally {
				setLoading(false);
			}
		};
		checkUserLoggedIn();
	}, []);

	useEffect(() => {
		if (authUser) {
			const token = getToken();
			const newSocket = io(SOCKET_URL, {
				withCredentials: true,
				auth: { token },
			});
			setSocket(newSocket);
			newSocket.on("online_users", (users) => setOnlineUsers(users));
			return () => newSocket.close();
		} else {
			if (socket) socket.close();
			setSocket(null);
			setOnlineUsers([]);
		}
	}, [authUser]);

	const logout = () => {
		removeToken();
		setAuthUser(null);
	};

	return (
		<AuthContext.Provider value={{ authUser, setAuthUser, loading, socket, onlineUsers, logout }}>
			{children}
		</AuthContext.Provider>
	);
};