import { DocHeader, DocSection } from "@/components/docs/doc-page";
import { CodeBlock, InlineCode } from "@/components/docs/code-block";

export const metadata = { title: "Routing & porting hooks" };

export default function RoutingPortingHooksDocs() {
  return (
    <article>
      <DocHeader
        title="Routing & porting hooks"
        lead="The headless layer behind the routing and porting components: read and update a voice routing config, and drive a port-in through its lifecycle. Added in @handset/react 0.5.0."
      />

      <DocSection title="useRoutingConfig / useRoutingConfigs">
        <CodeBlock
          code={`const { config, update, isSaving } = useRoutingConfig(routingConfigId);

// Edit just the business hours, preserving the rest of the config.
await update({
  business_hours: { schedule: [{ days: ["mon","tue","wed","thu","fri"], open: "09:00", close: "17:00" }] },
  open_behavior: config!.open_behavior,
});

const { configs } = useRoutingConfigs({ tenantId }); // list, to pick one`}
        />
        <p>
          <InlineCode>useRoutingConfig</InlineCode> reads one config and <InlineCode>update</InlineCode> PATCHes it. The
          API requires <InlineCode>open_behavior</InlineCode>, so send it (and any{" "}
          <InlineCode>closed_behavior</InlineCode> / <InlineCode>recording</InlineCode>) alongside your hours rather
          than a bare <InlineCode>business_hours</InlineCode>. This is the hook behind{" "}
          <InlineCode>business-hours-editor</InlineCode>.
        </p>
      </DocSection>

      <DocSection title="usePorting">
        <CodeBlock
          code={`const { checkPortability, createPortIn, submitPortIn, cancelPortIn, isSubmitting } = usePorting();

const results = await checkPortability(["+14155550142"]);   // [{ phone_number, portable, reason }]

const draft = await createPortIn({
  tenantId,
  phoneNumbers: results.filter((r) => r.portable).map((r) => r.phone_number),
  entityName: "Bayview Dental LLC",
  authorizedPerson: "Alex Rivera",
  billingPhoneNumber: "+14155550142",
  accountNumber: "4821",
  serviceAddress: { street: "500 Ocean Ave", city: "San Francisco", state: "CA", postalCode: "94112" },
});

const submitted = await submitPortIn(draft.id);   // status → in_review`}
        />
        <p>
          The full port-in lifecycle as mutations. Pair with <InlineCode>usePortIn(id)</InlineCode> to follow the
          order&apos;s status afterward. This is the hook behind <InlineCode>port-in-wizard</InlineCode>;{" "}
          <InlineCode>isSubmitting</InlineCode> / <InlineCode>error</InlineCode> cover whichever call is in flight.
        </p>
      </DocSection>
    </article>
  );
}
