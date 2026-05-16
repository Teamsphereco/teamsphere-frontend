import { useEffect, useMemo, useRef, useState } from "react";

const STACK_TRANSITION_MS = 420;
const EXPAND_TRANSITION_MS = 520;
const SPRING_EASE = "cubic-bezier(0.22, 1, 0.36, 1.08)";

const DEFAULT_OFFSET_PX = 20;
const DEFAULT_SCALE_STEP = 0.045;
const MAX_STACK_PREVIEW = 5;

const getExpandedRect = () => {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const width = Math.min(viewportWidth * 0.92, 920);
	const height = Math.min(viewportHeight * 0.86, 680);

	return {
		top: Math.max((viewportHeight - height) / 2, 16),
		left: Math.max((viewportWidth - width) / 2, 16),
		width,
		height,
	};
};

const toFixedRectStyle = (rect) => ({
	position: "fixed",
	top: rect.top,
	left: rect.left,
	width: rect.width,
	height: rect.height,
});

function CardStack({
	cards,
	renderCard,
	renderExpandedCard,
	offsetPx = DEFAULT_OFFSET_PX,
	scaleStep = DEFAULT_SCALE_STEP,
	className = "",
}) {
	const cardRefs = useRef(new Map());
	const closeButtonRef = useRef(null);

	const [activeCardId, setActiveCardId] = useState(null);
	const [hoveredCardId, setHoveredCardId] = useState(null);
	const [overlayCard, setOverlayCard] = useState(null);
	const [overlayStyle, setOverlayStyle] = useState(null);
	const [isClosing, setIsClosing] = useState(false);

	const visibleCards = useMemo(
		() => (Array.isArray(cards) ? cards.slice(0, MAX_STACK_PREVIEW) : []),
		[cards]
	);

	const getCardElement = (cardId) => cardRefs.current.get(cardId) || null;

	const openCard = (cardId) => {
		if (activeCardId) return;

		const card = visibleCards.find((item) => item.id === cardId);
		const cardElement = getCardElement(cardId);
		if (!card || !cardElement) return;

		const startRect = cardElement.getBoundingClientRect();
		setActiveCardId(cardId);
		setOverlayCard(card);
		setOverlayStyle(toFixedRectStyle(startRect));
		setIsClosing(false);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setOverlayStyle((prevStyle) => ({
					...prevStyle,
					...toFixedRectStyle(getExpandedRect()),
				}));
			});
		});
	};

	const closeExpandedCard = () => {
		if (!overlayCard) return;
		const cardElement = getCardElement(overlayCard.id);
		if (!cardElement) {
			setActiveCardId(null);
			setOverlayCard(null);
			setOverlayStyle(null);
			setIsClosing(false);
			return;
		}

		const endRect = cardElement.getBoundingClientRect();
		setIsClosing(true);
		setOverlayStyle((prevStyle) => ({
			...prevStyle,
			...toFixedRectStyle(endRect),
		}));
	};

	useEffect(() => {
		if (!activeCardId) return undefined;

		const onEscape = (event) => {
			if (event.key === "Escape") {
				closeExpandedCard();
			}
		};

		window.addEventListener("keydown", onEscape);
		return () => window.removeEventListener("keydown", onEscape);
	}, [activeCardId, overlayCard]);

	useEffect(() => {
		if (!overlayCard) return;
		if (isClosing) return;
		closeButtonRef.current?.focus();
	}, [overlayCard, isClosing]);

	return (
		<div className={`relative w-full ${className}`}>
			<div className="relative h-[460px] w-full">
				{visibleCards.map((card, index) => {
					const baseOffset = index * offsetPx;
					const baseScale = 1 - index * scaleStep;
					const isActive = activeCardId === card.id;
					const hasActiveCard = Boolean(activeCardId);
					const isHovered = hoveredCardId === card.id && !hasActiveCard;

					const stackTransform = isHovered
						? `translateY(${Math.max(baseOffset - 8, 0)}px) scale(${baseScale + 0.018})`
						: `translateY(${baseOffset}px) scale(${baseScale})`;

					const hiddenTransform = `translateY(${baseOffset + 18}px) scale(${Math.max(baseScale - 0.03, 0.8)})`;
					const isSuppressed = hasActiveCard && !isActive;

					return (
						<button
							key={card.id}
							ref={(node) => {
								if (node) {
									cardRefs.current.set(card.id, node);
								} else {
									cardRefs.current.delete(card.id);
								}
							}}
							type="button"
							onClick={() => openCard(card.id)}
							onMouseEnter={() => setHoveredCardId(card.id)}
							onMouseLeave={() => setHoveredCardId(null)}
							onFocus={() => setHoveredCardId(card.id)}
							onBlur={() => setHoveredCardId(null)}
							className="absolute inset-x-0 top-0 block w-full overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-left shadow-xl shadow-slate-950/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
							style={{
								height: 330,
								transform: isSuppressed ? hiddenTransform : stackTransform,
								opacity: isActive || isSuppressed ? 0 : 1,
								pointerEvents: hasActiveCard ? "none" : "auto",
								zIndex: isHovered
									? visibleCards.length + 2
									: visibleCards.length - index,
								transition: `transform ${STACK_TRANSITION_MS}ms ${SPRING_EASE}, opacity ${STACK_TRANSITION_MS}ms ease`,
								willChange: "transform, opacity",
							}}
						>
							{renderCard(card, index)}
						</button>
					);
				})}
			</div>

			{overlayCard && overlayStyle ? (
				<div className="fixed inset-0 z-[90]">
					<button
						type="button"
						aria-label="Close expanded card overlay"
						onClick={closeExpandedCard}
						className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]"
						style={{
							opacity: isClosing ? 0 : 1,
							transition: `opacity ${STACK_TRANSITION_MS}ms ease`,
						}}
					/>
					<div
						className="absolute overflow-hidden rounded-3xl border border-slate-700/90 bg-slate-900 shadow-2xl shadow-black/70"
						style={{
							...overlayStyle,
							transition: `top ${EXPAND_TRANSITION_MS}ms ${SPRING_EASE}, left ${EXPAND_TRANSITION_MS}ms ${SPRING_EASE}, width ${EXPAND_TRANSITION_MS}ms ${SPRING_EASE}, height ${EXPAND_TRANSITION_MS}ms ${SPRING_EASE}`,
							willChange: "top, left, width, height",
						}}
						onTransitionEnd={(event) => {
							if (event.propertyName !== "top") return;
							if (!isClosing) return;
							setActiveCardId(null);
							setOverlayCard(null);
							setOverlayStyle(null);
							setIsClosing(false);
						}}
					>
						<div className="absolute right-4 top-4 z-10">
							<button
								ref={closeButtonRef}
								type="button"
								onClick={closeExpandedCard}
								className="rounded-lg border border-slate-600/80 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-slate-400"
							>
								Close
							</button>
						</div>
						<div className="h-full w-full">
							{renderExpandedCard
								? renderExpandedCard(overlayCard)
								: renderCard(overlayCard, 0)}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

export default CardStack;
