"use client";

import type { Message } from "@handset/react";
import { Composer } from "@/components/handset/composer";

/** Standalone composer demo with a fake send — try a long or emoji message. */
export function ComposerDemo() {
  const send = async (): Promise<Message> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      id: `msg_demo_${Date.now()}`,
      conversation_id: "cnv_demo",
      direction: "outbound",
      from: "num_demo",
      to: "+14155550132",
      status: "sent",
      created_at: new Date().toISOString(),
    };
  };
  return (
    <div className="rounded-lg border">
      <Composer send={send} className="border-t-0" />
    </div>
  );
}
