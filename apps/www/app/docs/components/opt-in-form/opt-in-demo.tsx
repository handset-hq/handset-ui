"use client";

import { OptInForm } from "@/components/handset/opt-in-form";

export function OptInDemo() {
  return (
    <div className="max-w-md rounded-lg border p-4">
      <OptInForm
        brandName="Brightside Property Co"
        messageFrequency="up to 4 messages per month"
        privacyUrl="https://handset.dev/privacy"
        termsUrl="https://handset.dev/terms"
        onSubmit={async () => {
          await new Promise((r) => setTimeout(r, 500));
        }}
      />
    </div>
  );
}
