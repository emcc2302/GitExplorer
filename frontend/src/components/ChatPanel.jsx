import { useEffect, useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdMarkChatUnread } from "react-icons/md";
import { useAuthContext } from "../context/AuthContext";
import ChatWindow from "./ChatWindow";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatPanel = () => {
	const { authUser, onlineUsers, socket } = useAuthContext();
	const [open, setOpen] = useState(false);
	const [friends, setFriends] = useState([]);
	const [pendingRequests, setPendingRequests] = useState([]);
	const [activeChat, setActiveChat] = useState(null);
	const [unreadFrom, setUnreadFrom] = useState(new Set());

	useEffect(() => {
		if (!authUser) return;
		fetch(`${API_BASE_URL}/api/chat/friends`, { credentials: "include" })
			.then(r => r.json()).then(d => setFriends(d.friends || []));
		fetch(`${API_BASE_URL}/api/chat/pending-requests`, { credentials: "include" })
			.then(r => r.json()).then(d => setPendingRequests(d.friendRequests || []));
	}, [authUser]);

	useEffect(() => {
		if (!socket) return;
		const handle = (msg) => {
			if (activeChat !== msg.senderId) {
				setUnreadFrom(prev => new Set([...prev, msg.senderId]));
			}
		};
		socket.on("receive_message", handle);
		return () => socket.off("receive_message", handle);
	}, [socket, activeChat]);

	const acceptRequest = async (username) => {
		const res = await fetch(`${API_BASE_URL}/api/chat/friend-request/${username}/accept`, {
			method: "POST", credentials: "include"
		});
		const data = await res.json();
		if (!data.error) {
			setPendingRequests(prev => prev.filter(r => r.username !== username));
			const accepted = pendingRequests.find(r => r.username === username);
			if (accepted) setFriends(prev => [...prev, { username, avatarUrl: accepted.avatarUrl }]);
		}
	};

	const declineRequest = async (username) => {
		await fetch(`${API_BASE_URL}/api/chat/friend-request/${username}/decline`, {
			method: "POST", credentials: "include"
		});
		setPendingRequests(prev => prev.filter(r => r.username !== username));
	};

	if (!authUser) return null;

	const totalNotif = pendingRequests.length + unreadFrom.size;

	return (
		<>
			{/* Floating Chat Button */}
			<button
				onClick={() => setOpen(!open)}
				className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all"
			>
				{open ? <IoClose size={24} /> : <FaCommentDots size={22} />}
				{!open && totalNotif > 0 && (
					<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
						{totalNotif}
					</span>
				)}
			</button>

			{/* Panel */}
			{open && (
				<div className="fixed bottom-24 right-6 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-40 overflow-hidden">
					<div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
						<h3 className="font-semibold text-white flex items-center gap-2">
							<MdMarkChatUnread size={18} className="text-blue-400" />
							Messages
						</h3>
					</div>

					{/* Pending Requests */}
					{pendingRequests.length > 0 && (
						<div className="border-b border-gray-700">
							<p className="text-xs text-yellow-400 font-semibold px-4 py-2 bg-yellow-500/10">
								{pendingRequests.length} Friend Request{pendingRequests.length > 1 ? "s" : ""}
							</p>
							{pendingRequests.map(req => (
								<div key={req.username} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800">
									<img src={req.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
									<span className="text-sm text-white flex-1 truncate">@{req.username}</span>
									<button onClick={() => acceptRequest(req.username)} className="text-green-400 text-xs hover:underline">Accept</button>
									<button onClick={() => declineRequest(req.username)} className="text-red-400 text-xs hover:underline ml-1">✕</button>
								</div>
							))}
						</div>
					)}

					{/* Friends List */}
					<div className="max-h-64 overflow-y-auto">
						{friends.length === 0 && pendingRequests.length === 0 && (
							<p className="text-gray-500 text-xs text-center py-8 px-4">
								No friends yet. Search for a user and send a friend request to start chatting!
							</p>
						)}
						{friends.map(friend => {
							const isOnline = onlineUsers.includes(friend.username);
							const hasUnread = unreadFrom.has(friend.username);
							return (
								<button
									key={friend.username}
									onClick={() => {
										setActiveChat(friend.username);
										setUnreadFrom(prev => {
											const n = new Set(prev);
											n.delete(friend.username);
											return n;
										});
										setOpen(false);
									}}
									className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-colors"
								>
									<div className="relative">
										<img src={friend.avatarUrl} className="w-9 h-9 rounded-full" alt="" />
										{isOnline && (
											<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
										)}
									</div>
									<div className="flex-1 text-left">
										<p className="text-sm text-white font-medium">@{friend.username}</p>
										<p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-500"}`}>
											{isOnline ? "Online" : "Offline"}
										</p>
									</div>
									{hasUnread && (
										<span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Active chat window */}
			{activeChat && (
				<ChatWindow username={activeChat} onClose={() => setActiveChat(null)} />
			)}
		</>
	);
};

export default ChatPanel;
