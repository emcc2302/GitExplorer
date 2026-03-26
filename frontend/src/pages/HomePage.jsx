import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import ProfileInfo from "../components/ProfileInfo";
import Repos from "../components/Repos";
import Search from "../components/Search";
import SortRepos from "../components/SortRepos";
import Spinner from "../components/Spinner";
import { useAuthContext } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_USERNAME = "emcc2302";

const HomePage = () => {
	const { authUser } = useAuthContext();
	const [userProfile, setUserProfile] = useState(null);
	const [repos, setRepos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sortType, setSortType] = useState("recent");

	const getUserProfileAndRepos = useCallback(async (username) => {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/api/users/profile/${username}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to fetch user data");
			const { repos, userProfile } = await res.json();
			repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
			setRepos(repos);
			setUserProfile(userProfile);
			return { userProfile, repos };
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}, []);

	// Load logged-in user's profile if authenticated, else default profile
	// REPLACE with this
useEffect(() => {
    const usernameToLoad = authUser ? authUser.username : DEFAULT_USERNAME;
    getUserProfileAndRepos(usernameToLoad);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [authUser?.username]);

	const onSearch = async (e, username) => {
		e.preventDefault();
		setLoading(true);
		setRepos([]);
		setUserProfile(null);
		const result = await getUserProfileAndRepos(username);
		if (result) {
			setUserProfile(result.userProfile);
			setRepos(result.repos);
		}
		setSortType("recent");
		setLoading(false);
	};

	const onSort = (sortType) => {
		const sorted = [...repos];
		if (sortType === "recent") sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
		else if (sortType === "stars") sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
		else if (sortType === "forks") sorted.sort((a, b) => b.forks_count - a.forks_count);
		setSortType(sortType);
		setRepos(sorted);
	};

	return (
		<div className="m-4">
			{/* Welcome banner when logged in */}
			{authUser && (
				<div className="bg-glass rounded-lg p-3 mb-4 flex items-center gap-3 border border-blue-500/30">
					<img src={authUser.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
					<div>
						<p className="text-sm font-semibold text-white">Welcome back, <span className="text-blue-400">@{authUser.username}</span>!</p>
						<p className="text-xs text-gray-400">Your profile is shown below. Search to explore others.</p>
					</div>
				</div>
			)}
			{!authUser && (
				<div className="bg-glass rounded-lg p-3 mb-4 border border-gray-600/30">
					<p className="text-sm text-gray-400 text-center">
						Viewing <span className="text-blue-400 font-semibold">@{DEFAULT_USERNAME}</span>'s profile by default.{" "}
						<a href="/login" className="text-blue-500 underline">Login</a> to see yours.
					</p>
				</div>
			)}

			<Search onSearch={onSearch} />
			{repos.length > 0 && <SortRepos onSort={onSort} sortType={sortType} />}
			<div className="flex gap-4 flex-col lg:flex-row justify-center items-start">
				{userProfile && !loading && <ProfileInfo userProfile={userProfile} />}
				{!loading && <Repos repos={repos} />}
				{loading && <Spinner />}
			</div>
		</div>
	);
};

export default HomePage;
