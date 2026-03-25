import { MdLogout } from "react-icons/md";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Logout = () => {
	const { authUser, setAuthUser } = useAuthContext();

	const handleLogout = async () => {
		try {
			const res = await fetch(
				`${API_BASE_URL}/api/auth/logout`,
				{
					method: "GET",
					credentials: "include",
				}
			);

			if (!res.ok) {
				throw new Error("Logout failed");
			}

			await res.json(); // optional, but keeps flow consistent
			setAuthUser(null);
			toast.success("Logged out successfully");
		} catch (error) {
			toast.error(error.message);
		}
	};

	return (
		<>
			<img
				src={authUser?.avatarUrl}
				className="w-10 h-10 rounded-full border border-gray-800"
				alt="User Avatar"
			/>

			<div
				className="cursor-pointer flex items-center p-2 rounded-lg bg-glass mt-auto border border-gray-800"
				onClick={handleLogout}
			>
				<MdLogout size={22} />
			</div>
		</>
	);
};

export default Logout;
