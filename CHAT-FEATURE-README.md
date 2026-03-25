# GitExplorer — Chat & Friends Feature Guide

## What's New

### 1. Dynamic Hero Profile
- **Not logged in** → shows `emcc2302`'s GitHub profile by default
- **Logged in** → automatically loads YOUR GitHub profile in the hero section
- A welcome banner shows your avatar and username at the top

### 2. Friend Request System (Instagram-style)
When you view another user's profile:
- **Send Friend Request** button appears (blue, with user+ icon)
- Recipient sees **Accept / Decline** buttons on their end
- If both users send requests to each other → auto-accepted ✅
- Status transitions: `None → Pending Sent → Friends`

### 3. Real-time Chat via Socket.io
- Chat **only works between accepted friends**
- Once friends: an **Open Chat** button appears on the profile
- Chat window appears bottom-right with:
  - Real-time message delivery (Socket.io)
  - Message history loaded from MongoDB on open
  - Online/Offline indicator (green dot)
  - Enter to send, timestamps on each message

### 4. Floating Chat Panel (💬 button)
- Fixed bottom-right blue button visible when logged in
- Shows **unread message dot** and **pending request count** as badges
- Lists all friends with online/offline status
- Pending friend requests shown at the top with Accept/Decline inline
- Click a friend to open their chat window

---

## Installation

### Backend
```bash
cd backend
npm install   # installs socket.io + existing deps
```

### Frontend
```bash
cd frontend
npm install   # installs socket.io-client + existing deps
```

### Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_API_KEY=your_github_api_key
CLIENT_BASE_URL=http://localhost:5173
```

---

## New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/friend-request/:username` | Send a friend request |
| POST | `/api/chat/friend-request/:username/accept` | Accept a request |
| POST | `/api/chat/friend-request/:username/decline` | Decline a request |
| GET | `/api/chat/friend-status/:username` | Check friendship status |
| GET | `/api/chat/friends` | List all friends |
| GET | `/api/chat/pending-requests` | List incoming requests |
| GET | `/api/chat/messages/:username` | Load chat history |

## Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `send_message` | Client → Server | `{ to, content }` |
| `receive_message` | Server → Client | `{ _id, senderId, receiverId, content, createdAt }` |
| `message_sent` | Server → Sender | Same as above (echo) |
| `online_users` | Server → All | `[username, ...]` |

---

## New Files

### Backend
- `backend/routes/chat.route.js`
- `backend/controllers/chat.controller.js`
- `backend/models/user.model.js` (extended with friends/messages)
- `backend/server.js` (upgraded with Socket.io)

### Frontend
- `frontend/src/components/FriendButton.jsx`
- `frontend/src/components/ChatWindow.jsx`
- `frontend/src/components/ChatPanel.jsx`
- `frontend/src/components/ProfileInfo.jsx` (updated)
- `frontend/src/pages/HomePage.jsx` (updated)
- `frontend/src/context/AuthContext.jsx` (updated)
- `frontend/src/App.jsx` (updated)
