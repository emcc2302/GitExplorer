import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
	return useContext(AuthContext);
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkUserLoggedIn = async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`${API_BASE_URL}/api/auth/check`,
					{
						credentials: "include",
					}
				);

				if (!res.ok) {
					throw new Error("Failed to check authentication");
				}

				const data = await res.json();
				setAuthUser(data.user); // null or authenticated user
			} catch (error) {
				toast.error(error.message);
				setAuthUser(null);
			} finally {
				setLoading(false);
			}
		};

		checkUserLoggedIn();
	}, []);

	return (
		<AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
};
