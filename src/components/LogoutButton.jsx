import useLogout from "../hooks/useLogout";

const LogoutButton = () => {
	const { loading, logout } = useLogout();

	return (
		<div className='mt-auto px-2'>
			{!loading ? (
                <button
                    type="button"
					className="w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1]"
                    onClick={logout}
                >
                    Logout
                </button>
			) : (
				<span className='text-xs text-[#888888]'>...</span>
			)}
		</div>
	);
};
export default LogoutButton;
