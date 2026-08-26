"use client";

import * as React from "react";
import { MessageTemplates } from "@/components/handset/message-templates";

const TEMPLATES = [
  { id: "1", name: "Appointment reminder", body: "Hi {{name}}, reminder: your appointment is {{date}} at {{time}}. Reply C to confirm or R to reschedule." },
  { id: "2", name: "On the way", body: "{{tech}} is on the way and will arrive in about {{eta}} minutes." },
  { id: "3", name: "Invoice ready", body: "Your invoice {{invoice}} for {{amount}} is ready: {{link}}" },
];

export function MessageTemplatesDemo() {
  const [body, setBody] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-md space-y-3">
      <MessageTemplates
        templates={TEMPLATES}
        variables={{ name: "Maria", date: "Thursday", time: "2:00 PM", tech: "Marcus", eta: "15", invoice: "#1042", amount: "$180", link: "pay.co/1042" }}
        onSelect={(b) => setBody(b)}
      />
      {body ? <p className="rounded-md border bg-muted/40 p-2.5 text-sm">{body}</p> : null}
    </div>
  );
}
