import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuthContext, authFetch } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LikeProfile = ({ userProfile }) => {
	const { authUser } = useAuthContext();
	const [liked, setLiked] = useState(false);
	const isOwnProfile = authUser?.username === userProfile.login;

	const handleLikeProfile = async () => {
		if (liked) return;
		try {
			const res = await authFetch(`${API_BASE_URL}/api/users/like/${userProfile.login}`, { method: "POST" });
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			toast.success(data.message);
			setLiked(true);
		} catch (error) {
			toast.error(error.message);
		}
	};

	if (!authUser || isOwnProfile) return null;

	return (
		<button
			className={`p-2 text-xs w-full font-medium rounded-md bg-glass border flex items-center gap-2 transition-colors duration-300
				${liked
					? "border-red-500 text-red-500"
					: "border-blue-400 text-white hover:border-red-400 hover:text-red-400"
				}`}
			onClick={handleLikeProfile}
			disabled={liked}
		>
			<FaHeart size={16} className={liked ? "fill-red-500" : ""} />
			{liked ? "Liked!" : "Like Profile"}
		</button>
	);
};

export default LikeProfile;