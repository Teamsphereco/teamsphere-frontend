import CardStack from "../../components/CardStack";

const demoCards = [
	{
		id: "card-a",
		title: "Roadmap Planning",
		tag: "Product",
		description: "Prioritize quarter goals and align release windows for the core team.",
		details:
			"This card opens into a full focus view. You can place richer content here like tasks, owner timelines, links, and summaries.",
		gradient: "from-cyan-500/30 via-sky-500/20 to-transparent",
	},
	{
		id: "card-b",
		title: "Customer Feedback",
		tag: "Support",
		description: "Summarize high-impact requests from strategic users and enterprise clients.",
		details:
			"Expanded cards preserve continuity by animating from stack position to fullscreen and back to the same origin in the deck.",
		gradient: "from-emerald-500/30 via-teal-500/20 to-transparent",
	},
	{
		id: "card-c",
		title: "Release Notes Draft",
		tag: "Engineering",
		description: "Capture shipped fixes, performance improvements, and upcoming availability.",
		details:
			"Each card keeps reusable rendering and independent state, while expansion is controlled by a single active-card identifier.",
		gradient: "from-indigo-500/30 via-blue-500/20 to-transparent",
	},
	{
		id: "card-d",
		title: "Campaign Assets",
		tag: "Marketing",
		description: "Track launch visuals, messaging variants, and distribution milestones.",
		details:
			"Hovering lightly lifts the card. Clicking brings it to front and expands with spring-like timing.",
		gradient: "from-fuchsia-500/30 via-pink-500/20 to-transparent",
	},
];

const renderCardSurface = (card, compact = false) => (
	<div className={`relative h-full w-full overflow-hidden ${compact ? "p-5" : "p-7 sm:p-8"}`}>
		<div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
		<div className="relative z-[1] flex h-full flex-col">
			<div className="mb-4 flex items-center justify-between">
				<span className="rounded-full border border-slate-500/70 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
					{card.tag}
				</span>
			</div>
			<h3 className={`${compact ? "text-2xl" : "text-3xl"} font-bold tracking-tight text-white`}>
				{card.title}
			</h3>
			<p className={`mt-3 ${compact ? "text-sm" : "text-base"} text-slate-200`}>
				{card.description}
			</p>
			<div className="mt-auto rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
				{card.details}
			</div>
		</div>
	</div>
);

function CardStackDemo() {
	return (
		<section className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-7">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-bold text-white sm:text-4xl">Card Stack Interaction</h1>
				<p className="mt-3 text-slate-300">
					Click a card to expand it. Press <kbd className="rounded border border-slate-600 px-1.5 py-0.5 text-xs">Esc</kbd> or close to return it to the deck.
				</p>

				<div className="mt-8">
					<CardStack
						cards={demoCards}
						renderCard={(card) => renderCardSurface(card, true)}
						renderExpandedCard={(card) => renderCardSurface(card, false)}
					/>
				</div>
			</div>
		</section>
	);
}

export default CardStackDemo;
