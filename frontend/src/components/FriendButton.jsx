import { useEffect, useState } from "react";
import { FaUserPlus, FaUserCheck, FaUserClock, FaCommentDots } from "react-icons/fa";
import { MdPersonAddDisabled } from "react-icons/md";
import toast from "react-hot-toast";
import ChatWindow from "./ChatWindow";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FriendButton = ({ username }) => {
	const [status, setStatus] = useState("loading"); // none | pending_sent | pending_received | friends
	const [showChat, setShowChat] = useState(false);

	useEffect(() => {
		if (!username) return;
		fetch(`${API_BASE_URL}/api/chat/friend-status/${username}`, { credentials: "include" })
			.then(r => r.json())
			.then(d => setStatus(d.status))
			.catch(() => setStatus("none"));
	}, [username]);

	const sendRequest = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/chat/friend-request/${username}`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			toast.success(data.message);
			setStatus(data.status === "friends" ? "friends" : "pending_sent");
		} catch (err) {
			toast.error(err.message);
		}
	};

	const acceptRequest = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/chat/friend-request/${username}/accept`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			toast.success(data.message);
			setStatus("friends");
		} catch (err) {
			toast.error(err.message);
		}
	};

	const declineRequest = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/chat/friend-request/${username}/decline`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			toast.success("Request declined");
			setStatus("none");
		} catch (err) {
			toast.error(err.message);
		}
	};

	if (status === "loading") return null;

	return (
		<>
			<div className="flex flex-col gap-2 w-full">
				{status === "none" && (
					<button
						onClick={sendRequest}
						className="flex items-center gap-2 justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors"
					>
						<FaUserPlus size={14} /> Send Friend Request
					</button>
				)}

				{status === "pending_sent" && (
					<div className="flex items-center gap-2 justify-center w-full bg-yellow-500/20 border border-yellow-500 text-yellow-400 text-xs font-medium px-3 py-2 rounded-md">
						<FaUserClock size={14} /> Request Sent
					</div>
				)}

				{status === "pending_received" && (
					<div className="flex flex-col gap-1">
						<p className="text-xs text-gray-400 text-center">This user sent you a friend request</p>
						<div className="flex gap-2">
							<button
								onClick={acceptRequest}
								className="flex-1 flex items-center gap-1 justify-center bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors"
							>
								<FaUserCheck size={14} /> Accept
							</button>
							<button
								onClick={declineRequest}
								className="flex-1 flex items-center gap-1 justify-center bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors"
							>
								<MdPersonAddDisabled size={14} /> Decline
							</button>
						</div>
					</div>
				)}

				{status === "friends" && (
					<>
						<div className="flex items-center gap-2 justify-center w-full bg-green-500/20 border border-green-500 text-green-400 text-xs font-medium px-3 py-2 rounded-md">
							<FaUserCheck size={14} /> Friends
						</div>
						<button
							onClick={() => setShowChat(true)}
							className="flex items-center gap-2 justify-center w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors"
						>
							<FaCommentDots size={14} /> Open Chat
						</button>
					</>
				)}
			</div>

			{showChat && (
				<ChatWindow username={username} onClose={() => setShowChat(false)} />
			)}
		</>
	);
};

export default FriendButton;
