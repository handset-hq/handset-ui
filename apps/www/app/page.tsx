"use client";

import * as React from "react";
import { HandsetProvider } from "@handset/react";
import { Check, Copy } from "lucide-react";
import { Messaging } from "@/components/handset/messaging";

const REGISTRY_ADD = "npx shadcn@latest registry add @handset=https://ui.handset.dev/r/{name}.json";
const INSTALL = "npx shadcn@latest add @handset/messaging @handset/next-routes";

const COMPONENTS = [
  { name: "phone-system", title: "Phone system", desc: "Texting, calls, and voicemail behind three tabs — one import." },
  { name: "contact-timeline", title: "Contact timeline", desc: "One customer's messages, calls, and voicemails in one scroll." },
  { name: "messaging", title: "Messaging", desc: "Two-pane texting surface — inbox plus thread, responsive to mobile." },
  { name: "inbox", title: "Inbox", desc: "Conversation list with previews, relative times, STOP badges, infinite scroll." },
  { name: "thread", title: "Thread", desc: "Message history with delivery states, opt-out handling, wired composer." },
  { name: "composer", title: "Composer", desc: "Draft box with live SMS segment counting and unicode detection." },
  { name: "voicemail-player", title: "Voicemail player", desc: "Playback with expiry-safe URLs, durations, and transcripts." },
  { name: "click-to-call-button", title: "Click-to-call", desc: "Rings the agent, bridges the customer, narrates the call live." },
  { name: "call-log", title: "Call log", desc: "Call history with outcomes and expandable transcripts." },
  { name: "call-transcript", title: "Call transcript", desc: "Speaker-labeled transcripts — one-shot or following a live call." },
  { name: "opt-in-form", title: "Opt-in form", desc: "Consent UI whose exact shape passed a real carrier review." },
  { name: "number-picker", title: "Number picker", desc: "Area-code search and one-click claim for self-serve onboarding." },
  { name: "port-status", title: "Port status", desc: "'Where's my number?' as a stepper, rejections made fixable." },
  { name: "texting-readiness", title: "Texting readiness", desc: "The 10DLC pipeline as a checklist instead of a mystery." },
  { name: "usage-meter", title: "Usage meter", desc: "Period usage with comparative bars — show or re-bill customers." },
  { name: "next-routes", title: "next-routes", desc: "Server proxy route — your API key never reaches the browser." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24">
      <header className="flex items-center justify-between py-6">
        <span className="text-sm font-semibold tracking-tight">
          Handset <span className="text-primary">UI</span>
        </span>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href="/docs">Docs</a>
          <a className="transition-colors hover:text-foreground" href="https://github.com/handset-hq/handset-ui">GitHub</a>
          <a className="transition-colors hover:text-foreground" href="https://docs.handset.dev">API docs</a>
          <a className="transition-colors hover:text-foreground" href="https://handset.dev">handset.dev</a>
        </nav>
      </header>

      <section className="py-14">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight [text-wrap:balance] sm:text-5xl">
          Texting inside your product, in an afternoon.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Open-source React components for embedded messaging, built on the{" "}
          <a className="underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href="https://handset.dev">
            Handset API
          </a>
          . Installed with the shadcn CLI — the source lands in your repo, styled with your tokens, yours to change.
        </p>
        <div className="mt-8 space-y-2">
          <CommandLine label="1. Point the CLI at the registry" command={REGISTRY_ADD} />
          <CommandLine label="2. Install the components" command={INSTALL} />
        </div>
      </section>

      <section aria-label="Live demo">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Live demo — this is the <code className="font-mono">messaging</code> block, running on mock data. Send something.
        </p>
        <HandsetProvider baseUrl="/api/handset">
          <div className="h-[480px]">
            <Messaging className="h-full shadow-sm" />
          </div>
        </HandsetProvider>
      </section>

      <section className="mt-20">
        <h2 className="text-lg font-semibold tracking-tight">Components</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
          {COMPONENTS.map((c) => (
            <a key={c.name} href={`/docs/components/${c.name}`} className="bg-background p-5 transition-colors hover:bg-muted/40">
              <p className="font-mono text-sm text-primary">@handset/{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </a>
          ))}
          <div className="bg-background p-5">
            <p className="font-mono text-sm text-muted-foreground">@handset/react</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The headless layer on npm — useConversations, useThread, useComposer — if you&apos;d rather bring your own UI.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Components render in your app and call <code className="font-mono">/api/handset/*</code> — routes in{" "}
            <em>your</em> backend, added by <code className="font-mono">@handset/next-routes</code>.
          </li>
          <li>
            Your server holds the Handset API key and scopes every request to the signed-in user&apos;s tenant. No keys,
            no tokens in the browser.
          </li>
          <li>
            The Handset API does the rest: numbers, delivery, threading, 10DLC compliance, STOP/HELP handling.
          </li>
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          MIT licensed. Built by{" "}
          <a className="underline underline-offset-4" href="https://handset.dev">
            Handset
          </a>
          , the business phone API for vertical SaaS.
        </p>
      </section>
    </main>
  );
}

function CommandLine({ label, command }: { label: string; command: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(command);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="group flex w-full items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-2.5 text-left font-mono text-[13px] transition-colors hover:bg-muted"
      >
        <span className="truncate">{command}</span>
        {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> : <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" />}
      </button>
    </div>
  );
}
