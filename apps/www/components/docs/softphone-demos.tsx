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

export function IncomingToastDemo() {
  const phone = useDemoPhone();
  return (
    <div className="space-y-3">
      <StageIncomingButton phone={phone} />
      <IncomingCallToast softphone={phone} position="static" className="w-72" />
      <CallHUD softphone={phone} className="w-72" />
    </div>
  );
}

function StageIncomingButton({ phone }: { phone: DemoSoftphoneHandle }) {
  return (
    <button
      type="button"
      onClick={() => phone.stageIncoming("+14155550163")}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <PhoneIncoming className="h-3.5 w-3.5" />
      Simulate an incoming call
    </button>
  );
}
