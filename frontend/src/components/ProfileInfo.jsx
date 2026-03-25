import { IoLocationOutline } from "react-icons/io5";
import { RiGitRepositoryFill, RiUserFollowFill, RiUserFollowLine } from "react-icons/ri";
import { FaXTwitter } from "react-icons/fa6";
import { TfiThought } from "react-icons/tfi";
import { FaEye } from "react-icons/fa";
import { formatMemberSince } from "../utils/functions";
import LikeProfile from "./LikeProfile";
import FriendButton from "./FriendButton";
import { useAuthContext } from "../context/AuthContext";

const ProfileInfo = ({ userProfile }) => {
	const { authUser, onlineUsers } = useAuthContext();
	const memberSince = formatMemberSince(userProfile?.created_at);
	const isOwnProfile = authUser?.username === userProfile?.login;
	const isOnline = onlineUsers.includes(userProfile?.login);

	return (
		<div className="lg:w-1/3 w-full flex flex-col gap-2 lg:sticky md:top-10">
			<div className="bg-glass rounded-lg p-4">
				<div className="flex gap-3 items-center">
					{/* Avatar with online indicator */}
					<div className="relative">
						<a href={userProfile?.html_url} target="_blank" rel="noreferrer">
							<img src={userProfile?.avatar_url} className="rounded-md w-24 h-24 mb-2" alt="" />
						</a>
						{isOnline && (
							<span className="absolute bottom-3 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" title="Online" />
						)}
					</div>

					<div className="flex gap-2 items-center flex-col flex-1">
						{isOwnProfile && (
							<div className="bg-blue-500/20 border border-blue-400 text-blue-300 text-xs px-2 py-1 rounded-md w-full text-center font-medium">
								👤 Your Profile
							</div>
						)}
						<LikeProfile userProfile={userProfile} />
						<a
							href={userProfile?.html_url}
							target="_blank"
							rel="noreferrer"
							className="bg-glass font-medium w-full text-xs p-2 rounded-md cursor-pointer border border-blue-400 flex items-center gap-2"
						>
							<FaEye size={16} />
							View on Github
						</a>
					</div>
				</div>

				{userProfile?.bio ? (
					<div className="flex items-center gap-2 mt-1">
						<TfiThought />
						<p className="text-sm">{userProfile?.bio.substring(0, 60)}...</p>
					</div>
				) : null}

				{userProfile?.location ? (
					<div className="flex items-center gap-2">
						<IoLocationOutline />
						{userProfile?.location}
					</div>
				) : null}

				{userProfile?.twitter_username ? (
					<a
						href={`https://twitter.com/${userProfile.twitter_username}`}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2 hover:text-sky-500"
					>
						<FaXTwitter />
						{userProfile?.twitter_username}
					</a>
				) : null}

				<div className="my-2">
					<p className="text-gray-600 font-bold text-sm">Member since</p>
					<p>{memberSince}</p>
				</div>

				{userProfile?.email && (
					<div className="my-2">
						<p className="text-gray-600 font-bold text-sm">Email address</p>
						<p>{userProfile.email}</p>
					</div>
				)}

				{userProfile?.name && (
					<div className="my-2">
						<p className="text-gray-600 font-bold text-sm">Full name</p>
						<p>{userProfile?.name}</p>
					</div>
				)}

				<div className="my-2">
					<p className="text-gray-600 font-bold text-sm">Username</p>
					<p>{userProfile?.login}</p>
				</div>

				{/* Friend button - only show for other users when logged in */}
				{authUser && !isOwnProfile && (
					<div className="mt-3">
						<FriendButton username={userProfile?.login} avatarUrl={userProfile?.avatar_url} />
					</div>
				)}
			</div>

			<div className="flex flex-wrap gap-2 mx-4">
				<div className="flex items-center gap-2 bg-glass rounded-lg p-2 flex-1 min-w-24">
					<RiUserFollowFill className="w-5 h-5 text-blue-800" />
					<p className="text-xs">Followers: {userProfile?.followers}</p>
				</div>
				<div className="flex items-center gap-2 bg-glass rounded-lg p-2 flex-1 min-w-24">
					<RiUserFollowLine className="w-5 h-5 text-blue-800" />
					<p className="text-xs">Following: {userProfile?.following}</p>
				</div>
				<div className="flex items-center gap-2 bg-glass rounded-lg p-2 flex-1 min-w-24">
					<RiGitRepositoryFill className="w-5 h-5 text-blue-800" />
					<p className="text-xs">Public repos: {userProfile?.public_repos}</p>
				</div>
				<div className="flex items-center gap-2 bg-glass rounded-lg p-2 flex-1 min-w-24">
					<RiGitRepositoryFill className="w-5 h-5 text-blue-800" />
					<p className="text-xs">Public gists: {userProfile?.public_gists}</p>
				</div>
			</div>
		</div>
	);
};

export default ProfileInfo;
