/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImageCropModal from "./ImageCropModal";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const inputClass =
	"block h-10 w-full rounded-md border border-[#ebebeb] bg-white px-3 text-sm text-[#171717] placeholder:text-[#888888] transition focus:border-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-[#171717]/10";

export default function Profile({
	onSubmit,
	onChange,
	onProfileImageChange,
	formData,
	onStateChange,
	onLoading,
}) {
	const [cropSourceFile, setCropSourceFile] = useState(null);
	const [cropOpen, setCropOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState("");

	useEffect(() => {
		if (!formData?.file) {
			setPreviewUrl("");
			return undefined;
		}
		const nextPreviewUrl = URL.createObjectURL(formData.file);
		setPreviewUrl(nextPreviewUrl);
		return () => URL.revokeObjectURL(nextPreviewUrl);
	}, [formData?.file]);

	const handleImageInputChange = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type?.startsWith("image/")) {
			toast.error("Please choose an image file");
			event.target.value = "";
			return;
		}

		if (file.size > MAX_FILE_SIZE_BYTES) {
			toast.error("File size must be less than 10MB");
			event.target.value = "";
			return;
		}

		setCropSourceFile(file);
		setCropOpen(true);
		event.target.value = "";
	};

	const closeCropper = () => {
		setCropOpen(false);
		setCropSourceFile(null);
	};

	const handleApplyCrop = (croppedFile) => {
		onProfileImageChange?.(croppedFile);
		closeCropper();
	};

	return (
		<section className="relative min-h-screen overflow-hidden bg-[#fafafa] px-4 py-8 font-['Inter',system-ui,-apple-system,sans-serif] text-[#171717] selection:bg-[#171717] selection:text-[#f2f2f2] sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_22%_40%,#50e3c2_0%,transparent_24%),radial-gradient(circle_at_44%_36%,#007cf0_0%,transparent_25%),radial-gradient(circle_at_62%_48%,#7928ca_0%,transparent_24%),radial-gradient(circle_at_78%_56%,#ff0080_0%,transparent_22%),radial-gradient(circle_at_58%_72%,#f9cb28_0%,transparent_20%)] opacity-20 blur-3xl" />
			<div className="relative mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1180px] items-center gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr]">
				<div className="hidden lg:block">
					<p className="font-mono text-xs text-[#888888]">TEAMSPHERE</p>
					<h1 className="mt-5 max-w-xl text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-[#171717]">
						Finish with a face people can find fast.
					</h1>
					<p className="mt-5 max-w-lg text-lg leading-7 text-[#4d4d4d]">
						Crop a clean avatar, choose a recognizable username, and enter Teamsphere with a profile that feels ready for real conversations.
					</p>
					<div className="mt-8 rounded-lg border border-[#ebebeb] bg-white p-5 shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a,0_0_0_1px_#00000014_inset]">
						<p className="font-mono text-xs text-[#888888]">Setup flow</p>
						<div className="mt-4 grid grid-cols-2 gap-3">
							<div className="rounded-md border border-[#ebebeb] bg-[#fafafa] p-3 text-[#4d4d4d]">
								<p className="font-mono text-[11px] text-[#888888]">01</p>
								<p className="mt-1 text-sm font-medium">Account</p>
							</div>
							<div className="rounded-md bg-[#171717] p-3 text-white">
								<p className="font-mono text-[11px] text-white/60">02</p>
								<p className="mt-1 text-sm font-medium">Profile photo</p>
							</div>
						</div>
					</div>
				</div>

				<form className="w-full rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset] sm:p-8 lg:ml-auto lg:max-w-md" onSubmit={onSubmit}>
					<p className="font-mono text-xs text-[#888888]">Step 02 / Profile</p>
					<h1 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.96px] text-[#171717]">Create your profile.</h1>
					<p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
						Choose a unique @handle, set a display nickname, and add an optional avatar.
					</p>

					<div className="mt-6 space-y-5">
						<div>
							<label className="mb-2 block text-sm font-medium text-[#171717]" htmlFor="username">
								Handle
							</label>
							<input
								className={inputClass}
								id="username"
								type="text"
								name="username"
								placeholder="Tenet_01"
								value={formData.username}
								onChange={(e) => onChange(e, "input")}
								minLength={5}
								maxLength={32}
								pattern="[A-Za-z0-9_]{5,32}"
								required
							/>
						</div>

						<div>
							<label className="mb-2 block text-sm font-medium text-[#171717]" htmlFor="nickname">
								Nickname
							</label>
							<input
								className={inputClass}
								id="nickname"
								type="text"
								name="nickname"
								placeholder="Flanderzz"
								value={formData.nickname}
								onChange={(e) => onChange(e, "input")}
							/>
						</div>

						<div>
							<label className="mb-2 block text-sm font-medium text-[#171717]" htmlFor="profileImage">
								Profile image
							</label>
							<div className="rounded-lg border border-dashed border-[#a1a1a1] bg-[#fafafa] p-4">
								<div className="flex items-center gap-4">
									{previewUrl ? (
										<img
											src={previewUrl}
											alt="Profile image preview"
											className="h-16 w-16 rounded-full border border-[#ebebeb] object-cover"
										/>
									) : (
										<div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ebebeb] bg-white font-mono text-xs text-[#888888]">
											IMG
										</div>
									)}
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-[#171717]">Upload and crop</p>
										<p className="mt-1 text-xs leading-5 text-[#4d4d4d]">Drag to reposition, zoom for framing, then apply the crop.</p>
									</div>
								</div>
								<div className="mt-4 flex flex-wrap gap-2">
									<label htmlFor="profileImage" className="inline-flex h-9 cursor-pointer items-center rounded-md bg-[#171717] px-3 text-sm font-medium text-white transition hover:bg-black">
										{previewUrl ? "Replace image" : "Choose image"}
									</label>
									{previewUrl ? (
										<button
											type="button"
											onClick={() => onProfileImageChange?.(null)}
											className="inline-flex h-9 items-center rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa]"
										>
											Remove
										</button>
									) : null}
								</div>
								<input
									className="sr-only"
									accept="image/*"
									id="profileImage"
									name="file"
									type="file"
									onChange={handleImageInputChange}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2 pt-1">
						<button
							type="button"
							className="inline-flex h-11 items-center justify-center rounded-md border border-[#ebebeb] bg-white px-4 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa]"
							onClick={onStateChange}
						>
							Back
						</button>
						<button
							type="submit"
							className="inline-flex h-11 items-center justify-center rounded-md bg-[#171717] px-4 text-sm font-medium text-white shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
							disabled={onLoading}
						>
							{onLoading ? (
								<div
									className="inline-block size-5 animate-spin rounded-full border-[2px] border-current border-t-transparent"
									role="status"
									aria-label="loading"
								>
									<span className="sr-only">Loading...</span>
								</div>
							) : (
								"Create account"
							)}
						</button>
					</div>
				</div>
			</form>
			</div>

			<ImageCropModal
				open={cropOpen}
				sourceFile={cropSourceFile}
				title="Crop profile image"
				onCancel={closeCropper}
				onApply={handleApplyCrop}
			/>
		</section>
	);
}
