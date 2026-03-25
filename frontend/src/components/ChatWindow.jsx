import { useEffect, useRef, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import { useAuthContext } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatWindow = ({ username, onClose }) => {
	const { authUser, socket, onlineUsers } = useAuthContext();
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(true);
	const bottomRef = useRef(null);
	const isOnline = onlineUsers.includes(username);

	// Load history
	useEffect(() => {
		fetch(`${API_BASE_URL}/api/chat/messages/${username}`, { credentials: "include" })
			.then(r => r.json())
			.then(d => { setMessages(d.messages || []); setLoading(false); })
			.catch(() => setLoading(false));
	}, [username]);

	// Listen for new incoming messages
	useEffect(() => {
		if (!socket) return;

		const handleReceive = (msg) => {
			if (msg.senderId === username || msg.receiverId === username) {
				setMessages(prev => [...prev, msg]);
			}
		};

		const handleSent = (msg) => {
			setMessages(prev => [...prev, msg]);
		};

		socket.on("receive_message", handleReceive);
		socket.on("message_sent", handleSent);

		return () => {
			socket.off("receive_message", handleReceive);
			socket.off("message_sent", handleSent);
		};
	}, [socket, username]);

	// Auto scroll
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = () => {
		if (!input.trim() || !socket) return;
		socket.emit("send_message", { to: username, content: input.trim() });
		setInput("");
	};

	const handleKey = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
				<div className="flex items-center gap-2">
					<div className="relative">
						<div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold uppercase">
							{username[0]}
						</div>
						{isOnline && (
							<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800" />
						)}
					</div>
					<div>
						<p className="text-sm font-semibold text-white">@{username}</p>
						<p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-500"}`}>
							{isOnline ? "Online" : "Offline"}
						</p>
					</div>
				</div>
				<button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
					<IoClose size={20} />
				</button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-3 space-y-2 h-72">
				{loading && (
					<p className="text-center text-gray-500 text-xs mt-10">Loading messages...</p>
				)}
				{!loading && messages.length === 0 && (
					<p className="text-center text-gray-500 text-xs mt-10">No messages yet. Say hi! 👋</p>
				)}
				{messages.map((msg, i) => {
					const isMe = msg.senderId === authUser?.username;
					return (
						<div key={msg._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
									isMe
										? "bg-blue-600 text-white rounded-br-sm"
										: "bg-gray-700 text-gray-100 rounded-bl-sm"
								}`}
							>
								<p>{msg.content}</p>
								<p className={`text-xs mt-0.5 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
									{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								</p>
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className="flex items-center gap-2 px-3 py-2 border-t border-gray-700 bg-gray-800">
				<input
					type="text"
					className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
					placeholder="Type a message..."
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={handleKey}
				/>
				<button
					onClick={sendMessage}
					disabled={!input.trim()}
					className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
				>
					<IoSend size={16} />
				</button>
			</div>
		</div>
	);
};

export default ChatWindow;
