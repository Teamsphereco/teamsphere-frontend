// Minimal BlurHash decoder. Mirrors the backend co.teamsphere.api.services.media.BlurHash
// encoder (base83, sRGB<->linear). Decodes a hash to a small canvas data URL usable as an
// <img> src placeholder while the real thumbnail loads.

const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

function decode83(str) {
	let value = 0;
	for (let i = 0; i < str.length; i++) {
		const digit = DIGITS.indexOf(str[i]);
		if (digit === -1) {
			return value;
		}
		value = value * 83 + digit;
	}
	return value;
}

function sRGBToLinear(value) {
	const v = value / 255;
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function linearToSRGB(value) {
	const v = Math.max(0, Math.min(1, value));
	return v <= 0.0031308
		? Math.round(v * 12.92 * 255 + 0.5)
		: Math.round((1.055 * v ** (1 / 2.4) - 0.055) * 255 + 0.5);
}

function signPow(value, exp) {
	return Math.sign(value) * Math.abs(value) ** exp;
}

function decodeDC(value) {
	return [sRGBToLinear(value >> 16), sRGBToLinear((value >> 8) & 255), sRGBToLinear(value & 255)];
}

function decodeAC(value, maximumValue) {
	const quantR = Math.floor(value / (19 * 19));
	const quantG = Math.floor(value / 19) % 19;
	const quantB = value % 19;
	return [
		signPow((quantR - 9) / 9, 2) * maximumValue,
		signPow((quantG - 9) / 9, 2) * maximumValue,
		signPow((quantB - 9) / 9, 2) * maximumValue,
	];
}

/**
 * Decode a blurhash to an RGBA Uint8ClampedArray of the given size.
 * Returns null if the hash is invalid.
 */
export function decodeBlurHash(blurhash, width, height, punch = 1) {
	if (!blurhash || blurhash.length < 6) {
		return null;
	}
	const sizeFlag = decode83(blurhash[0]);
	const numY = Math.floor(sizeFlag / 9) + 1;
	const numX = (sizeFlag % 9) + 1;
	const quantMax = decode83(blurhash[1]);
	const maximumValue = ((quantMax + 1) / 166) * punch;

	if (blurhash.length !== 4 + 2 * numX * numY) {
		return null;
	}

	const colors = new Array(numX * numY);
	colors[0] = decodeDC(decode83(blurhash.substring(2, 6)));
	for (let i = 1; i < numX * numY; i++) {
		const value = decode83(blurhash.substring(4 + i * 2, 6 + i * 2));
		colors[i] = decodeAC(value, maximumValue);
	}

	const pixels = new Uint8ClampedArray(width * height * 4);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let r = 0;
			let g = 0;
			let b = 0;
			for (let j = 0; j < numY; j++) {
				for (let i = 0; i < numX; i++) {
					const basis =
						Math.cos((Math.PI * x * i) / width) * Math.cos((Math.PI * y * j) / height);
					const color = colors[i + j * numX];
					r += color[0] * basis;
					g += color[1] * basis;
					b += color[2] * basis;
				}
			}
			const idx = 4 * (x + y * width);
			pixels[idx] = linearToSRGB(r);
			pixels[idx + 1] = linearToSRGB(g);
			pixels[idx + 2] = linearToSRGB(b);
			pixels[idx + 3] = 255;
		}
	}
	return pixels;
}

const dataUrlCache = new Map();

/** Decode a blurhash to a small PNG data URL, memoised by hash. Returns null on failure. */
export function blurHashToDataUrl(blurhash, width = 32, height = 32) {
	if (!blurhash) {
		return null;
	}
	if (dataUrlCache.has(blurhash)) {
		return dataUrlCache.get(blurhash);
	}
	try {
		const pixels = decodeBlurHash(blurhash, width, height);
		if (!pixels) {
			dataUrlCache.set(blurhash, null);
			return null;
		}
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.createImageData(width, height);
		imageData.data.set(pixels);
		ctx.putImageData(imageData, 0, 0);
		const url = canvas.toDataURL();
		dataUrlCache.set(blurhash, url);
		return url;
	} catch {
		dataUrlCache.set(blurhash, null);
		return null;
	}
}
