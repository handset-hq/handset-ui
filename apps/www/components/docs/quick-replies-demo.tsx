"use client";

import * as React from "react";
import { QuickReplies } from "@/components/handset/quick-replies";

export function QuickRepliesDemo() {
  const [picked, setPicked] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-md space-y-3">
      <QuickReplies
        replies={["On my way 🚗", "Running 5 min late", "Can we reschedule?", "All done — thanks!"]}
        onSelect={(t) => setPicked(t)}
      />
      {picked ? (
        <p className="text-sm text-muted-foreground">
          Sent: <span className="text-foreground">{picked}</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Tap a reply.</p>
      )}
    </div>
  );
}
