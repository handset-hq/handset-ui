import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Number & usage hooks" };

export default function NumberHooksDocs() {
  return (
    <article>
      <DocHeader
        title="Number & usage hooks"
        lead="The headless layer behind the provisioning and ops components: searching and buying numbers, watching ports and readiness, reading usage."
      />

      <DocSection title="useAvailableNumbers / useBuyNumber">
        <CodeBlock
          code={`const { results, search, isSearching, hasSearched } = useAvailableNumbers();
await search({ areaCode: "415", limit: 6 });

const { buy, purchased, isBuying } = useBuyNumber();
await buy({ phoneNumber: results[0].phone_number, campaignId });`}
        />
        <p>
          Search is on-demand (no polling). <InlineCode>buy</InlineCode> sends an Idempotency-Key per attempt, so a
          network retry can&apos;t double-purchase; a lost race for a number surfaces as a retryable error.
        </p>
      </DocSection>

      <DocSection title="usePhoneNumber">
        <CodeBlock
          code={`const { number } = usePhoneNumber(numberId, { pollMs: 30000 });
number?.messaging_ready; // flips true at carrier approval`}
        />
      </DocSection>

      <DocSection title="usePortIn">
        <CodeBlock
          code={`const { portIn } = usePortIn(portInId); // polls every 30s
portIn?.status; // draft → in_review → foc_confirmed → completed`}
        />
        <p>
          <InlineCode>action_needed</InlineCode> carries the carrier&apos;s explanation in{" "}
          <InlineCode>status_detail</InlineCode>.
        </p>
      </DocSection>

      <DocSection title="useUsage">
        <CodeBlock
          code={`const { usage } = useUsage();                       // this month
const july = useUsage({ start: "2026-07-01", end: "2026-08-01" });
usage?.data; // [{ kind: "sms_segment_outbound", quantity: 4218 }, …]`}
        />
      </DocSection>
    </article>
  );
}
