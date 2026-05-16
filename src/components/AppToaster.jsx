import { Toaster, ToastBar } from "react-hot-toast";
import toast from "react-hot-toast";

const baseToastStyle = {
	background: "rgba(15, 23, 42, 0.92)",
	color: "#e2e8f0",
	border: "1px solid rgba(71, 85, 105, 0.7)",
	borderRadius: "14px",
	boxShadow: "0 16px 32px rgba(2, 6, 23, 0.45)",
	padding: "12px 14px",
	maxWidth: "420px",
};

const AppToaster = () => {
	return (
		<Toaster
			position="top-right"
			gutter={10}
			containerStyle={{
				top: 18,
				right: 18,
				left: 18,
			}}
			toastOptions={{
				duration: 3600,
				style: baseToastStyle,
				success: {
					duration: 2800,
					iconTheme: {
						primary: "#22c55e",
						secondary: "#dcfce7",
					},
				},
				error: {
					duration: 4200,
					iconTheme: {
						primary: "#f43f5e",
						secondary: "#ffe4e6",
					},
				},
			}}
		>
				{(t) => (
					<ToastBar
						toast={t}
						style={{
							...t.style,
							animation: t.type === "custom"
								? (t.visible ? "toast-slide-in 240ms ease-out" : "none")
								: t.visible
									? "toast-slide-in 240ms ease-out"
									: "toast-fade-out 200ms ease-in forwards",
						}}
					>
					{({ icon, message }) => (
						t.type === "custom" ? (
							<div className="w-full">{message}</div>
						) : (
							<div className="flex w-full items-start gap-3">
								<div className="mt-0.5">{icon}</div>
								<div className="flex min-w-0 flex-1 items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										{message}
									</div>
									<button
										type="button"
										onClick={() => toast.dismiss(t.id)}
										className="shrink-0 rounded-md border border-slate-600/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-400 hover:text-white"
										aria-label="Dismiss notification"
									>
										Close
									</button>
								</div>
							</div>
						)
					)}
				</ToastBar>
			)}
		</Toaster>
	);
};

export default AppToaster;
