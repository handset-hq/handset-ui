"use client";

import * as React from "react";
import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";
import type { MessageStatus } from "@handset/react";
import { cn } from "@/lib/utils";

export interface DeliveryStatusProps {
  status: MessageStatus;
  className?: string;
}

/**
 * The delivery-state indicator for an outbound message: clock while sending,
 * one check when accepted, two when delivered, a red alert on failure.
 * Inbound / received messages render nothing.
 */
export function DeliveryStatus({ status, className }: DeliveryStatusProps) {
  switch (status) {
    case "queued":
    case "sending":
      return <Clock className={cn("h-3 w-3", className)} aria-label="Sending" />;
    case "sent":
      return <Check className={cn("h-3 w-3", className)} aria-label="Sent" />;
    case "delivered":
      return <CheckCheck className={cn("h-3 w-3", className)} aria-label="Delivered" />;
    case "failed":
      return <AlertCircle className={cn("h-3 w-3 text-destructive", className)} aria-label="Failed" />;
    default:
      return null;
  }
}
