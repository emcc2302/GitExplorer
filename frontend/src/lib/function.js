export const handleLoginWithGithub = () => {
	window.location.href =
		`${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
};
