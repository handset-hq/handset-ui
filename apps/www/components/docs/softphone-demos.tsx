"use client";

import * as React from "react";
import { createDemoSoftphone, type DemoSoftphoneHandle } from "@handset/webrtc";
import { PhoneIncoming } from "lucide-react";
import { SoftphonePanel } from "@/components/handset/softphone";
import { Dialer } from "@/components/handset/dialer";
import { CallHUD } from "@/components/handset/call-hud";
import { IncomingCallToast } from "@/components/handset/incoming-call-toast";

function useDemoPhone(): DemoSoftphoneHandle {
  const [phone] = React.useState(() => createDemoSoftphone({ answerAfterSeconds: 2.5 }));
  React.useEffect(() => () => phone.disconnect(), [phone]);
  return phone;
}

/** Full panel; the docs' hero demo. */
export function SoftphonePanelDemo() {
  const phone = useDemoPhone();
  return (
    <div className="flex flex-col items-start gap-3">
      <SoftphonePanel softphone={phone} callerNumber="+14155550100" />
      <StageIncomingButton phone={phone} />
    </div>
  );
}

export function DialerDemo() {
  const phone = useDemoPhone();
  return (
    <div className="flex items-start gap-4">
      <Dialer softphone={phone} callerNumber="+14155550100" />
      <CallHUD softphone={phone} className="mt-1" />
    </div>
  );
}

const TOAST_POSITIONS = ["static", "bottom-right", "bottom-left", "top-right", "top-left"] as const;

export function IncomingToastDemo() {
  const phone = useDemoPhone();
  const [position, setPosition] = React.useState<(typeof TOAST_POSITIONS)[number]>("static");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StageIncomingButton phone={phone} />
        <span className="text-xs text-muted-foreground">position:</span>
        {TOAST_POSITIONS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPosition(p)}
            aria-pressed={position === p}
            className={
              position === p
                ? "rounded-md border border-primary/50 bg-primary/10 px-2 py-1 text-xs text-primary"
                : "rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/60"
            }
          >
            {p}
          </button>
        ))}
      </div>
      <IncomingCallToast softphone={phone} position={position} className={position === "static" ? "w-72" : undefined} />
      <CallHUD softphone={phone} className="w-72" />
    </div>
  );
}

function StageIncomingButton({ phone }: { phone: DemoSoftphoneHandle }) {
  const [staging, setStaging] = React.useState(false);
  // stageIncoming is a no-op unless the phone is ready — connect first, so
  // the button works even when the surrounding demo starts disconnected.
  const stage = async () => {
    setStaging(true);
    try {
      if (phone.status !== "ready") await phone.connect();
      phone.stageIncoming("+14155550163");
    } finally {
      setStaging(false);
    }
  };
  return (
    <button
      type="button"
      disabled={staging}
      onClick={() => void stage()}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
    >
      <PhoneIncoming className="h-3.5 w-3.5" />
      {staging ? "Connecting…" : "Simulate an incoming call"}
    </button>
  );
}

/** Minimal HUD demo: one button places a call, the bar narrates its life. */
export function CallHUDDemo() {
  const phone = useDemoPhone();
  const [placing, setPlacing] = React.useState(false);
  const place = async () => {
    setPlacing(true);
    try {
      if (phone.status !== "ready") await phone.connect();
      if (!phone.activeCall) await phone.dial({ to: "+14155550142" });
    } finally {
      setPlacing(false);
    }
  };
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={placing}
        onClick={() => void place()}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
      >
        {placing ? "Connecting…" : "Place a demo call"}
      </button>
      <CallHUD softphone={phone} draggable className="w-80" />
      <p className="text-xs text-muted-foreground">The bar is draggable — grab it anywhere but the buttons.</p>
    </div>
  );
}
