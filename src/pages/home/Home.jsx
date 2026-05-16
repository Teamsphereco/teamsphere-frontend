/* eslint-disable react/prop-types */
import NavBar from '../../components/NavBar';
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import ChatSvg from "../../components/svg/ChatSvg";
import FolderSvg from "../../components/svg/FolderSvg";
import SaveSvg from "../../components/svg/SaveSvg";
import SearchSvg from "../../components/svg/SearchSvg";
import { getLandingCtaTarget } from "../../utils/landingCta";

const messageFeatures = [
  {
    eyebrow: "Instant sync",
    title: "Direct messages that stay immediate.",
    description: "Start private threads, see presence at a glance, and keep replies moving without waiting on a heavy workspace.",
    icon: ChatSvg,
  },
  {
    eyebrow: "Searchable history",
    title: "Every conversation is easy to return to.",
    description: "Search across people, messages, shared media, and saved moments with calm filters that preserve context.",
    icon: SearchSvg,
  },
  {
    eyebrow: "Smart notifications",
    title: "Signals instead of interruptions.",
    description: "Tune alerts by thread, mute the noise, and use summaries to catch up when the day outruns the inbox.",
    icon: SaveSvg,
  },
];

const groupWorkflow = [
  {
    eyebrow: "Group control",
    title: "Create focused rooms.",
    body: "Bring the right people into launch chats, support handoffs, study groups, or private planning rooms without cluttering the rest of the app.",
    icon: FolderSvg,
  },
  {
    eyebrow: "Replies and reactions",
    title: "Keep the thread readable.",
    body: "Inline replies, lightweight reactions, and media previews make busy conversations easier to scan and easier to rejoin.",
    icon: ChatSvg,
  },
  {
    eyebrow: "Shared context",
    title: "Return to what mattered.",
    body: "Pin useful messages, save files, and let search surface the details that make a conversation useful weeks later.",
    icon: SaveSvg,
  },
];

const privacyFeatures = [
  {
    title: "Private threads",
    body: "Conversation controls stay close to the chat, so membership, visibility, and notification choices feel clear.",
  },
  {
    title: "Presence with restraint",
    body: "See enough to know who is available without turning every moment into another status dashboard.",
  },
  {
    title: "Settings users understand",
    body: "Mute, archive, leave, and manage groups through simple controls designed around real conversations.",
  },
];

const useCases = [
  "Close friends",
  "Project rooms",
  "Campus groups",
  "Support handoffs",
  "Remote teams",
];

const ctaConfig = {
  "/chat": {
    primaryLabel: "Open chat",
    secondaryLabel: "See messages",
    secondaryHref: "#messages",
  },
  "/login": {
    primaryLabel: "Sign in",
    secondaryLabel: "Create account",
    secondaryHref: "/signup",
  },
  "/signup": {
    primaryLabel: "Start chatting",
    secondaryLabel: "Sign in",
    secondaryHref: "/login",
  },
};

function RouteButton({ href, label, variant }) {
  const baseClass =
    "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2";
  const isAnchorLink = href.startsWith("#");

  if (variant === "primary") {
    return (
      <Link
        to={href}
        className={`${baseClass} bg-[#171717] text-white shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a,0_0_0_1px_#00000014_inset] hover:bg-black`}
      >
        {label}
      </Link>
    );
  }

  if (isAnchorLink) {
    return (
      <a
        href={href}
        className={`${baseClass} border border-[#ebebeb] bg-white text-[#171717] hover:border-[#a1a1a1] hover:bg-[#fafafa]`}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      to={href}
      className={`${baseClass} border border-[#ebebeb] bg-white text-[#171717] hover:border-[#a1a1a1] hover:bg-[#fafafa]`}
    >
      {label}
    </Link>
  );
}

function SectionEyebrow({ children }) {
  return <p className="font-mono text-xs leading-4 text-[#888888]">{children}</p>;
}

function ChatPreview() {
  const conversations = [
    { name: "Maya Chen", text: "Shared the final wireframe.", time: "now", active: true },
    { name: "Launch room", text: "Jordan replied in Media QA.", time: "4m", active: false },
    { name: "Design review", text: "3 reactions on your note.", time: "12m", active: false },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-xl border border-[#ebebeb] bg-white shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]">
      <div className="flex h-10 items-center justify-between border-b border-[#ebebeb] px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff4d4d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f9cb28]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#50e3c2]" />
        </div>
        <p className="font-mono text-[11px] text-[#888888]">teamsphere.live</p>
      </div>

      <div className="grid min-h-[420px] grid-cols-1 bg-[#fafafa] md:grid-cols-[190px_1fr]">
        <aside className="border-b border-[#ebebeb] bg-white p-3 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#171717]">Chats</p>
            <span className="rounded-full border border-[#ebebeb] px-2 py-0.5 font-mono text-[10px] text-[#4d4d4d]">12</span>
          </div>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.name}
                className={`rounded-md border p-2 transition ${
                  conversation.active
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#ebebeb] bg-white text-[#171717]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium">{conversation.name}</p>
                  <span className={conversation.active ? "font-mono text-[10px] text-white/70" : "font-mono text-[10px] text-[#888888]"}>{conversation.time}</span>
                </div>
                <p className={conversation.active ? "mt-1 truncate text-[11px] text-white/70" : "mt-1 truncate text-[11px] text-[#888888]"}>{conversation.text}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[360px] flex-col bg-white">
          <div className="flex items-center justify-between border-b border-[#ebebeb] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#171717]">Maya Chen</p>
              <p className="font-mono text-[11px] text-[#29bc9b]">online now</p>
            </div>
            <div className="flex gap-1.5">
              <span className="h-8 w-8 rounded-full border border-[#ebebeb] bg-[#fafafa]" />
              <span className="h-8 w-8 rounded-full border border-[#ebebeb] bg-[#fafafa]" />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="max-w-[78%] rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2 shadow-[0px_1px_1px_#00000005]">
              <p className="text-sm leading-5 text-[#171717]">Thread summary is ready. The latest decision is pinned above the media notes.</p>
            </div>
            <div className="ml-auto max-w-[78%] rounded-lg bg-[#171717] px-3 py-2 text-white shadow-[0px_1px_1px_#00000005]">
              <p className="text-sm leading-5">Perfect. Send it to the launch room and keep replies attached.</p>
            </div>
            <div className="max-w-[82%] rounded-lg border border-[#ebebeb] bg-white px-3 py-2 shadow-[0px_1px_1px_#00000005]">
              <p className="mb-2 font-mono text-[11px] text-[#888888]">Media shared</p>
              <div className="grid grid-cols-3 gap-2">
                <span className="aspect-square rounded-md bg-[#f5f5f5]" />
                <span className="aspect-square rounded-md bg-[#d3e5ff]" />
                <span className="aspect-square rounded-md bg-[#f7d4d6]" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#ebebeb] p-3">
            <div className="flex items-center gap-2 rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#50e3c2]" />
              <p className="flex-1 text-sm text-[#888888]">Message Maya...</p>
              <span className="rounded-md bg-[#171717] px-2 py-1 text-xs font-medium text-white">Send</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const { authUser } = useAuthContext();
  const primaryHref = getLandingCtaTarget(authUser);
  const currentCta = ctaConfig[primaryHref] || ctaConfig["/signup"];

  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden bg-[#fafafa] font-['Inter',system-ui,-apple-system,sans-serif] text-[#171717] selection:bg-[#171717] selection:text-[#f2f2f2]">
      <NavBar
        primaryHref={primaryHref}
        primaryLabel={currentCta.primaryLabel}
        secondaryHref={currentCta.secondaryHref}
        secondaryLabel={currentCta.secondaryLabel}
      />

      <main className="relative">
        <section className="relative overflow-hidden bg-white px-4 pt-28 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-16 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_18%_48%,#50e3c2_0%,transparent_23%),radial-gradient(circle_at_38%_35%,#007cf0_0%,transparent_26%),radial-gradient(circle_at_56%_42%,#7928ca_0%,transparent_24%),radial-gradient(circle_at_72%_48%,#ff0080_0%,transparent_24%),radial-gradient(circle_at_84%_58%,#ff4d4d_0%,transparent_20%),radial-gradient(circle_at_65%_72%,#f9cb28_0%,transparent_22%)] opacity-30 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 pb-24 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-32 lg:pt-20">
            <div className="animate-fade-up">
              <SectionEyebrow>Instant sync</SectionEyebrow>
              <h1 className="mt-5 max-w-3xl text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-[#171717] sm:text-[64px] sm:leading-[64px] sm:tracking-[-3px]">
                Messaging that feels fast, private, and composed.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-7 text-[#4d4d4d]">
                Teamsphere is a modern communication layer for direct messages, group chats, media, search, and calm notifications. It helps every conversation start quickly, stay readable, and remain easy to return to.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <RouteButton href={primaryHref} label={currentCta.primaryLabel} variant="primary" />
                <RouteButton href={currentCta.secondaryHref} label={currentCta.secondaryLabel} variant="secondary" />
              </div>
            </div>

            <div className="animate-fade-up-delayed">
              <ChatPreview />
            </div>
          </div>
        </section>

        <section id="messages" className="border-y border-[#ebebeb] bg-[#fafafa] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-2xl">
              <SectionEyebrow>Private threads</SectionEyebrow>
              <h2 className="mt-3 text-[32px] font-semibold leading-10 tracking-[-1.28px] text-[#171717] sm:text-[40px] sm:leading-[48px]">
                The essentials of chat, tuned for speed.
              </h2>
              <p className="mt-4 text-base leading-6 text-[#4d4d4d]">
                Direct messages, reactions, media, search, and replies are arranged around the way people actually keep up with each other.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {messageFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="animate-fade-up rounded-lg border border-[#ebebeb] bg-white p-6 shadow-[0px_2px_2px_#0000000a,0px_8px_8px_-8px_#0000000a,0_0_0_1px_#00000014_inset] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#00000014_inset]"
                  style={{ animationDelay: `${0.08 * index}s` }}
                >
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ebebeb] bg-[#fafafa]">
                    <Icon className="h-5 w-5 fill-[#171717] stroke-[#171717]" />
                  </div>
                  <p className="font-mono text-xs text-[#888888]">{feature.eyebrow}</p>
                  <h3 className="mt-3 text-xl font-semibold leading-7 tracking-[-0.6px] text-[#171717]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">{feature.description}</p>
                </article>
              );
            })}
            </div>
          </div>
        </section>

        <section id="groups" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <SectionEyebrow>Group control</SectionEyebrow>
              <h2 className="mt-3 text-[32px] font-semibold leading-10 tracking-[-1.28px] text-[#171717] sm:text-[40px] sm:leading-[48px]">
                Group chats that keep their shape as they grow.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-6 text-[#4d4d4d]">
                A focused group chat should feel like a well-organized command center: fast to enter, clear to scan, and simple to manage.
              </p>
            </div>

            <div className="grid gap-4">
              {groupWorkflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article key={step.title} className="grid gap-5 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-5 shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a,0_0_0_1px_#00000014_inset] sm:grid-cols-[56px_1fr]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#ebebeb] bg-white">
                      <Icon className="h-5 w-5 fill-[#171717] stroke-[#171717]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#888888]">0{index + 1}</span>
                        <span className="h-px flex-1 bg-[#ebebeb]" />
                        <span className="font-mono text-xs text-[#888888]">{step.eyebrow}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.96px] text-[#171717]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">{step.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="privacy" className="relative overflow-hidden bg-[#171717] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_25%_40%,#007cf0_0%,transparent_24%),radial-gradient(circle_at_52%_38%,#7928ca_0%,transparent_25%),radial-gradient(circle_at_72%_52%,#ff0080_0%,transparent_22%),radial-gradient(circle_at_58%_70%,#f9cb28_0%,transparent_20%)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-[1400px]">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="font-mono text-xs leading-4 text-white/55">Private threads</p>
                <h2 className="mt-3 text-[32px] font-semibold leading-10 tracking-[-1.28px] text-white sm:text-[40px] sm:leading-[48px]">
                  Trust belongs inside the conversation.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-white/68">
                Privacy, presence, membership, and notification controls should feel understandable before a user sends the next message. Teamsphere keeps those controls visible, quiet, and close to the thread.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {privacyFeatures.map((feature) => (
                <article key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a,0_0_0_1px_#ffffff14_inset]">
                  <h3 className="text-xl font-semibold leading-7 tracking-[-0.6px] text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#ebebeb] bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <SectionEyebrow>Used for every kind of conversation</SectionEyebrow>
              <p className="mt-2 max-w-2xl text-lg leading-7 text-[#171717]">
                From a one-line check-in to a busy room with media, reactions, and follow-ups, the interface stays quiet enough to think.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {useCases.map((useCase) => (
                <span key={useCase} className="rounded-full border border-[#ebebeb] bg-[#fafafa] px-3 py-1.5 text-sm text-[#4d4d4d]">
                  {useCase}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fafafa] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[920px] text-center">
            <SectionEyebrow>Start now</SectionEyebrow>
            <h2 className="mt-3 text-[32px] font-semibold leading-10 tracking-[-1.28px] text-[#171717] sm:text-[48px] sm:leading-[48px] sm:tracking-[-2.4px]">
              Make every conversation easier to start, follow, and return to.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#4d4d4d]">
              Teamsphere gives messaging the precision of a developer console and the calm of a bright workspace, without turning chat into another dashboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <RouteButton href={primaryHref} label={currentCta.primaryLabel} variant="primary" />
              <RouteButton href={currentCta.secondaryHref} label={currentCta.secondaryLabel} variant="secondary" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
