/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const VIEWPORT_SIZE = 320;
const OUTPUT_SIZE = 512;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getSafeOffsets = ({ x, y }, scale, imageSize, viewportSize) => {
	const displayWidth = imageSize.width * scale;
	const displayHeight = imageSize.height * scale;
	const maxOffsetX = Math.max((displayWidth - viewportSize) / 2, 0);
	const maxOffsetY = Math.max((displayHeight - viewportSize) / 2, 0);

	return {
		x: clamp(x, -maxOffsetX, maxOffsetX),
		y: clamp(y, -maxOffsetY, maxOffsetY),
	};
};

const createCroppedFile = async ({ imageElement, imageType, scale, offset }) => {
	const canvas = document.createElement("canvas");
	canvas.width = OUTPUT_SIZE;
	canvas.height = OUTPUT_SIZE;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Unable to crop image");
	}

	const displayWidth = imageElement.naturalWidth * scale;
	const displayHeight = imageElement.naturalHeight * scale;
	const drawX = VIEWPORT_SIZE / 2 - displayWidth / 2 + offset.x;
	const drawY = VIEWPORT_SIZE / 2 - displayHeight / 2 + offset.y;
	const resizeFactor = OUTPUT_SIZE / VIEWPORT_SIZE;

	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
	context.drawImage(
		imageElement,
		drawX * resizeFactor,
		drawY * resizeFactor,
		displayWidth * resizeFactor,
		displayHeight * resizeFactor
	);

	const targetType = imageType === "image/png" ? "image/png" : "image/jpeg";
	const blob = await new Promise((resolve, reject) => {
		canvas.toBlob(
			(resultBlob) => {
				if (!resultBlob) {
					reject(new Error("Failed to generate cropped image"));
					return;
				}
				resolve(resultBlob);
			},
			targetType,
			0.94
		);
	});

	const extension = targetType === "image/png" ? "png" : "jpg";
	return new File([blob], `avatar-crop.${extension}`, { type: targetType });
};

const ImageCropModal = ({ open, sourceFile, title, onCancel, onApply }) => {
	const imageRef = useRef(null);
	const dragRef = useRef({
		active: false,
		startX: 0,
		startY: 0,
		startOffsetX: 0,
		startOffsetY: 0,
	});

	const [imageUrl, setImageUrl] = useState("");
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const [baseScale, setBaseScale] = useState(1);
	const [scale, setScale] = useState(1);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isApplying, setIsApplying] = useState(false);

	const maxScale = useMemo(() => Math.max(baseScale * 3, baseScale), [baseScale]);

	useEffect(() => {
		if (!open || !sourceFile) {
			setImageUrl("");
			setImageLoaded(false);
			return undefined;
		}
		const nextUrl = URL.createObjectURL(sourceFile);
		setImageUrl(nextUrl);
		setImageLoaded(false);
		setImageSize({ width: 0, height: 0 });
		setBaseScale(1);
		setScale(1);
		setOffset({ x: 0, y: 0 });

		return () => URL.revokeObjectURL(nextUrl);
	}, [open, sourceFile]);

	useEffect(() => {
		if (!imageLoaded) return;
		setOffset((current) => getSafeOffsets(current, scale, imageSize, VIEWPORT_SIZE));
	}, [imageLoaded, imageSize, scale]);

	if (!open || !sourceFile) return null;

	const zoomValue = baseScale > 0 ? scale / baseScale : 1;

	const handleImageLoad = () => {
		const image = imageRef.current;
		if (!image) return;

		const naturalWidth = image.naturalWidth;
		const naturalHeight = image.naturalHeight;
		if (!naturalWidth || !naturalHeight) {
			toast.error("Invalid image dimensions");
			return;
		}

		const nextBaseScale = Math.max(
			VIEWPORT_SIZE / naturalWidth,
			VIEWPORT_SIZE / naturalHeight
		);
		setImageSize({ width: naturalWidth, height: naturalHeight });
		setBaseScale(nextBaseScale);
		setScale(nextBaseScale);
		setOffset({ x: 0, y: 0 });
		setImageLoaded(true);
	};

	const startDrag = (event) => {
		if (!imageLoaded) return;
		event.preventDefault();
		dragRef.current = {
			active: true,
			startX: event.clientX,
			startY: event.clientY,
			startOffsetX: offset.x,
			startOffsetY: offset.y,
		};
	};

	const continueDrag = (event) => {
		if (!dragRef.current.active) return;
		event.preventDefault();
		const deltaX = event.clientX - dragRef.current.startX;
		const deltaY = event.clientY - dragRef.current.startY;
		const nextOffset = {
			x: dragRef.current.startOffsetX + deltaX,
			y: dragRef.current.startOffsetY + deltaY,
		};
		setOffset(getSafeOffsets(nextOffset, scale, imageSize, VIEWPORT_SIZE));
	};

	const endDrag = () => {
		dragRef.current.active = false;
	};

	const handleZoomChange = (event) => {
		const nextZoom = Number(event.target.value);
		const nextScale = clamp(baseScale * nextZoom, baseScale, maxScale);
		setScale(nextScale);
		setOffset((current) => getSafeOffsets(current, nextScale, imageSize, VIEWPORT_SIZE));
	};

	const handleApply = async () => {
		const imageElement = imageRef.current;
		if (!imageElement || !imageLoaded) return;

		setIsApplying(true);
		try {
			const croppedFile = await createCroppedFile({
				imageElement,
				imageType: sourceFile.type,
				scale,
				offset,
			});
			onApply?.(croppedFile);
		} catch (error) {
			toast.error(error.message || "Failed to crop image");
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#171717]/70 p-4 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-xl border border-[#ebebeb] bg-white p-5 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset]">
				<p className="font-mono text-xs text-[#888888]">Adjust photo</p>
				<h3 className="mt-2 text-xl font-semibold leading-7 tracking-[-0.6px] text-[#171717]">{title || "Crop image"}</h3>
				<p className="mt-1 text-sm leading-5 text-[#4d4d4d]">Drag to reposition and use zoom to frame your avatar.</p>

				<div className="mt-4 flex justify-center">
					<div className="relative h-80 w-80 overflow-hidden rounded-full border border-[#ebebeb] bg-[#fafafa] shadow-[0px_1px_1px_#00000005,0_0_0_1px_#00000014_inset]">
						{imageUrl ? (
							<img
								ref={imageRef}
								src={imageUrl}
								alt="Crop source"
								onLoad={handleImageLoad}
								onPointerDown={startDrag}
								onPointerMove={continueDrag}
								onPointerUp={endDrag}
								onPointerCancel={endDrag}
								onPointerLeave={endDrag}
								className="absolute left-1/2 top-1/2 max-w-none touch-none select-none"
								style={{
									width: `${imageSize.width * scale}px`,
									height: `${imageSize.height * scale}px`,
									transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
									cursor: dragRef.current.active ? "grabbing" : "grab",
								}}
								draggable={false}
							/>
						) : null}
					</div>
				</div>

				<div className="mt-4">
					<div className="flex items-center justify-between font-mono text-xs text-[#888888]">
						<span>Zoom</span>
						<span>{zoomValue.toFixed(2)}x</span>
					</div>
					<input
						aria-label="Zoom"
						type="range"
						min={1}
						max={3}
						step={0.01}
						value={zoomValue}
						onChange={handleZoomChange}
						disabled={!imageLoaded}
						className="mt-2 w-full accent-[#171717]"
					/>
				</div>

				<div className="mt-5 flex items-center justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						disabled={isApplying}
						className="rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa] disabled:opacity-60"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleApply}
						disabled={!imageLoaded || isApplying}
						className="rounded-md bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isApplying ? "Applying..." : "Apply crop"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ImageCropModal;
