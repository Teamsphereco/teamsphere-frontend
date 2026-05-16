/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ArrowSvg from "./svg/ArrowSvg";
import MenuSvg from "./svg/MenuSvg";

const navItems = [
	{ id: "messages", label: "Messages" },
	{ id: "groups", label: "Groups" },
	{ id: "privacy", label: "Privacy" },
];

const isAnchorLink = (href) => href.startsWith("#");

const NavBar = ({ primaryHref, primaryLabel, secondaryHref, secondaryLabel }) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-[#ebebeb]/90 bg-white/85 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
				<a href="#top" className="flex items-center gap-3" aria-label="Teamsphere home">
					<img src={logo} alt="Teamsphere logo" className="h-9 w-9 rounded-md object-cover ring-1 ring-[#ebebeb]" />
					<div>
						<p className="text-sm font-semibold leading-5 text-[#171717]">Teamsphere</p>
						<p className="font-mono text-[11px] leading-4 text-[#888888]">Messaging layer</p>
					</div>
				</a>

				<nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
					{navItems.map((item) => (
						<a
							key={item.id}
							href={`#${item.id}`}
							className="rounded-full px-3 py-2 text-sm font-medium text-[#4d4d4d] transition hover:bg-[#fafafa] hover:text-[#171717]"
						>
							{item.label}
						</a>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex">
					{isAnchorLink(secondaryHref) ? (
						<a href={secondaryHref} className="rounded-md border border-[#ebebeb] bg-white px-3 py-1.5 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa]">
							{secondaryLabel}
						</a>
					) : (
						<Link to={secondaryHref} className="rounded-md border border-[#ebebeb] bg-white px-3 py-1.5 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa]">
							{secondaryLabel}
						</Link>
					)}
					<Link
						to={primaryHref}
						className="rounded-md bg-[#171717] px-3 py-1.5 text-sm font-medium text-white shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a] transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
					>
						{primaryLabel}
					</Link>
				</div>

				<button
					onClick={() => setMobileOpen((state) => !state)}
					className="rounded-md border border-[#ebebeb] bg-white p-2 text-[#171717] transition hover:border-[#a1a1a1] md:hidden"
					aria-label="Toggle navigation menu"
				>
					{mobileOpen ? <ArrowSvg className="w-5 fill-[#171717]" /> : <MenuSvg className="w-5 fill-[#171717]" />}
				</button>
			</div>

			{mobileOpen ? (
				<div className="border-t border-[#ebebeb] bg-white px-4 pb-5 pt-4 shadow-[0px_8px_16px_-4px_#0000000a] md:hidden">
					<div className="space-y-3">
						{navItems.map((item) => (
							<a
								key={item.id}
								href={`#${item.id}`}
								onClick={() => setMobileOpen(false)}
								className="block rounded-md px-3 py-2 text-sm font-medium text-[#4d4d4d] transition hover:bg-[#fafafa] hover:text-[#171717]"
							>
								{item.label}
							</a>
						))}
					</div>
					<div className="mt-4 grid grid-cols-2 gap-2">
						{isAnchorLink(secondaryHref) ? (
							<a
								href={secondaryHref}
								onClick={() => setMobileOpen(false)}
								className="rounded-md border border-[#ebebeb] px-3 py-2 text-center text-sm font-medium text-[#171717]"
							>
								{secondaryLabel}
							</a>
						) : (
							<Link
								to={secondaryHref}
								onClick={() => setMobileOpen(false)}
								className="rounded-md border border-[#ebebeb] px-3 py-2 text-center text-sm font-medium text-[#171717]"
							>
								{secondaryLabel}
							</Link>
						)}
						<Link
							to={primaryHref}
							onClick={() => setMobileOpen(false)}
							className="rounded-md bg-[#171717] px-3 py-2 text-center text-sm font-medium text-white"
						>
							{primaryLabel}
						</Link>
					</div>
				</div>
			) : null}
		</header>
	);
};

export default NavBar;
