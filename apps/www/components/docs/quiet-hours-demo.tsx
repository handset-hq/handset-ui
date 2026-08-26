"use client";

import * as React from "react";
import { QuietHours } from "@/components/handset/quiet-hours";

function SendButton({ allowed }: { allowed: boolean }) {
  return (
    <button
      type="button"
      disabled={!allowed}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
    >
      Send now
    </button>
  );
}

export function QuietHoursDemo() {
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);
  const night = new Date();
  night.setHours(2, 0, 0, 0);

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <p className="mb-2 text-xs text-muted-foreground">At 12:00 — within hours</p>
        <QuietHours start="08:00" end="21:00" now={noon}>
          {(allowed) => <SendButton allowed={allowed} />}
        </QuietHours>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">At 02:00 — outside the window</p>
        <QuietHours start="08:00" end="21:00" now={night}>
          {(allowed) => <SendButton allowed={allowed} />}
        </QuietHours>
      </div>
    </div>
  );
}
