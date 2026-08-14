import { TelnyxRTC } from "@telnyx/webrtc";
import { GeneratedRing } from "./ringtone";
import {
  Emitter,
  type CallState,
  type DialInput,
  type Softphone,
  type SoftphoneCall,
  type SoftphoneEvents,
  type SoftphoneOptions,
  type SoftphoneStatus,
} from "./types";

/**
 * The production softphone, backed by the carrier's WebRTC edge. All carrier
 * concepts stay inside this file.
 *
 * VERIFY-LIVE: notification/state mapping written against @telnyx/webrtc
 * 2.x docs — confirm with a real token + real call before relying on edge
 * cases (hold, reconnect).
 */
export function createSoftphone(options: SoftphoneOptions): Softphone {
  return new TelnyxSoftphone(options);
}

/** Telnyx call.state values → our CallState. */
const STATE_MAP: Record<string, CallState> = {
  new: "connecting",
  requesting: "connecting",
  trying: "connecting",
  early: "connecting",
  ringing: "ringing",
  answering: "connecting",
  active: "active",
  held: "held",
  hangup: "ended",
  destroy: "ended",
  purge: "ended",
};

class TelnyxSoftphone implements Softphone {
  status: SoftphoneStatus = "idle";
  activeCall: CallHandle | null = null;

  private readonly options: SoftphoneOptions;
  private readonly emitter = new Emitter<SoftphoneEvents>();
  private client: TelnyxRTC | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private readonly ring = new GeneratedRing();

  constructor(options: SoftphoneOptions) {
    this.options = options;
  }

  on<E extends keyof SoftphoneEvents>(event: E, listener: SoftphoneEvents[E]): () => void {
    return this.emitter.on(event, listener);
  }

  async connect(): Promise<void> {
    if (this.client) return;
    this.setStatus("connecting");
    let token: string;
    try {
      token = await this.options.getToken();
    } catch (err) {
      this.setStatus("error", err as Error);
      throw err;
    }

    const client = new TelnyxRTC({
      login_token: token,
      ringtoneFile: this.options.ringtoneUrl,
      ringbackFile: this.options.ringbackUrl,
    });
    this.client = client;

    client.remoteElement = this.resolveAudioElement();

    client.on("telnyx.ready", () => this.setStatus("ready"));
    client.on("telnyx.error", (error: unknown) => {
      this.setStatus("error", error instanceof Error ? error : new Error(String(error)));
    });
    client.on("telnyx.socket.close", () => {
      // The SDK reconnects with the same token; report the gap honestly.
      if (this.status !== "idle") this.setStatus("reconnecting");
    });
    client.on("telnyx.notification", (notification: TelnyxNotification) => {
      if (notification.type !== "callUpdate" || !notification.call) return;
      this.handleCallUpdate(notification.call);
    });

    await client.connect();
  }

  disconnect(): void {
    this.ring.stop();
    this.activeCall?.detach();
    this.activeCall = null;
    this.client?.disconnect();
    this.client = null;
    this.setStatus("idle");
  }

  async dial(input: DialInput): Promise<SoftphoneCall> {
    if (!this.client || this.status !== "ready") {
      throw new Error("Softphone is not connected — call connect() and wait for status \"ready\".");
    }
    const raw = this.client.newCall({
      destinationNumber: input.to,
      callerNumber: input.callerNumber,
      callerName: input.callerName,
      audio: true,
      video: false,
    });
    const call = new CallHandle(raw as TelnyxCall, "outbound", input.to, () => this.clearIfActive(call));
    this.activeCall = call;
    call.subscribe((c) => this.emitter.emit("call", c));
    return call;
  }

  // ── internals ────────────────────────────────────────────────────────────

  private handleCallUpdate(raw: TelnyxCall): void {
    // Updates for a call we already track flow through its own handle.
    if (this.activeCall?.matches(raw)) {
      this.activeCall.update(raw);
      return;
    }
    const state = STATE_MAP[raw.state ?? ""] ?? "connecting";
    if (raw.direction === "inbound" && state === "ringing") {
      const remote = normalizeE164(
        raw.options?.remoteCallerNumber ?? raw.options?.callerNumber ?? "unknown",
      );
      const call = new CallHandle(raw, "inbound", remote, () => this.clearIfActive(call));
      this.activeCall = call;
      call.subscribe((c) => this.emitter.emit("call", c));
      // Audible ring until the call leaves "ringing" (answer/reject/miss).
      // A custom ringtoneUrl is handled by the underlying SDK instead.
      if (!this.options.ringtoneUrl) {
        this.ring.start();
        const stop = call.onChange((c) => {
          if (c.state !== "ringing") {
            this.ring.stop();
            stop();
          }
        });
      }
      this.emitter.emit("incoming", call);
    }
  }

  private clearIfActive(call: CallHandle): void {
    if (this.activeCall === call) this.activeCall = null;
  }

  private resolveAudioElement(): string {
    const el = this.options.audioElement;
    if (typeof el === "string") return el;
    if (el instanceof HTMLAudioElement) {
      if (!el.id) el.id = `handset-audio-${Math.random().toString(36).slice(2, 8)}`;
      return el.id;
    }
    if (!this.audioEl) {
      this.audioEl = document.createElement("audio");
      this.audioEl.id = `handset-audio-${Math.random().toString(36).slice(2, 8)}`;
      this.audioEl.autoplay = true;
      this.audioEl.style.display = "none";
      document.body.appendChild(this.audioEl);
    }
    return this.audioEl.id;
  }

  private setStatus(status: SoftphoneStatus, error?: Error): void {
    this.status = status;
    this.emitter.emit("status", status, error);
  }
}

/** Wraps one Telnyx call object behind the neutral SoftphoneCall surface. */
class CallHandle implements SoftphoneCall {
  readonly direction: "inbound" | "outbound";
  readonly remoteNumber: string;
  state: CallState;
  muted = false;
  startedAt: Date | null = null;
  endedReason: string | null = null;

  private raw: TelnyxCall;
  private readonly listeners = new Set<(call: SoftphoneCall) => void>();
  private readonly onEnded: () => void;

  constructor(raw: TelnyxCall, direction: "inbound" | "outbound", remoteNumber: string, onEnded: () => void) {
    this.raw = raw;
    this.direction = direction;
    this.remoteNumber = remoteNumber;
    this.onEnded = onEnded;
    this.state = STATE_MAP[raw.state ?? ""] ?? (direction === "outbound" ? "connecting" : "ringing");
  }

  get id(): string {
    return this.raw.id ?? "unknown";
  }

  matches(raw: TelnyxCall): boolean {
    return raw.id != null && raw.id === this.raw.id;
  }

  update(raw: TelnyxCall): void {
    this.raw = raw;
    const next = STATE_MAP[raw.state ?? ""] ?? this.state;
    if (next === this.state) return;
    this.state = next;
    if (next === "active" && !this.startedAt) this.startedAt = new Date();
    if (next === "ended") {
      const cause = raw.cause ?? raw.causeCode;
      this.endedReason = cause != null ? String(cause) : null;
      this.onEnded();
    }
    this.notify();
  }

  async answer(): Promise<void> {
    this.raw.answer();
  }

  async reject(): Promise<void> {
    this.raw.hangup();
  }

  async hangup(): Promise<void> {
    this.raw.hangup();
  }

  mute(): void {
    this.raw.muteAudio();
    this.muted = true;
    this.notify();
  }

  unmute(): void {
    this.raw.unmuteAudio();
    this.muted = false;
    this.notify();
  }

  sendDigits(digits: string): void {
    this.raw.dtmf(digits);
  }

  onChange(listener: (call: SoftphoneCall) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribe(listener: (call: SoftphoneCall) => void): void {
    this.listeners.add(listener);
  }

  detach(): void {
    this.listeners.clear();
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this);
      } catch {
        // listener errors must not break the phone
      }
    });
  }
}

// Minimal structural types for the parts of @telnyx/webrtc we touch — the
// SDK's own types are loose; keeping our surface typed narrows the contact.
interface TelnyxCall {
  id?: string;
  state?: string;
  cause?: string;
  causeCode?: string | number;
  direction?: string;
  options?: { remoteCallerNumber?: string; callerNumber?: string };
  answer(): void;
  hangup(): void;
  muteAudio(): void;
  unmuteAudio(): void;
  dtmf(digits: string): void;
}

interface TelnyxNotification {
  type: string;
  call?: TelnyxCall;
}

/** "14154136287" → "+14154136287"; leaves formatted/unknown values alone. */
function normalizeE164(raw: string): string {
  if (!raw || raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  if (digits.length === 10) return "+1" + digits;
  if (digits.length >= 7 && digits === raw) return "+" + digits;
  return raw;
}
