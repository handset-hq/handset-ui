/**
 * Carrier-neutral softphone contract. Nothing outside the Telnyx adapter
 * (softphone.ts) may mention carrier concepts — the same boundary rule the
 * Handset backend keeps.
 */

export type SoftphoneStatus = "idle" | "connecting" | "ready" | "reconnecting" | "error";

export type CallState = "ringing" | "connecting" | "active" | "held" | "ended";

export interface SoftphoneCall {
  readonly id: string;
  readonly direction: "inbound" | "outbound";
  /** The other party's number, E.164 when known. */
  readonly remoteNumber: string;
  readonly state: CallState;
  readonly muted: boolean;
  /** Set once the call goes active. */
  readonly startedAt: Date | null;
  /** Answer an inbound ringing call. */
  answer(): Promise<void>;
  /** Decline an inbound ringing call without answering. */
  reject(): Promise<void>;
  hangup(): Promise<void>;
  mute(): void;
  unmute(): void;
  sendDigits(digits: string): void;
  /** Fires on every state or mute change. Returns an unsubscribe fn. */
  onChange(listener: (call: SoftphoneCall) => void): () => void;
}

export interface DialInput {
  /** Destination, E.164. */
  to: string;
  /**
   * Caller ID to present, E.164 — use one of the tenant's Handset numbers.
   * The carrier may enforce number ownership.
   */
  callerNumber?: string;
  callerName?: string;
}

export type SoftphoneEvents = {
  /** Connection lifecycle changes. */
  status: (status: SoftphoneStatus, error?: Error) => void;
  /** An inbound call is ringing. Call answer()/reject() on it. */
  incoming: (call: SoftphoneCall) => void;
  /** Any call (either direction) changed state. */
  call: (call: SoftphoneCall) => void;
};

export interface Softphone {
  readonly status: SoftphoneStatus;
  /** The current non-ended call, if any. */
  readonly activeCall: SoftphoneCall | null;
  connect(): Promise<void>;
  disconnect(): void;
  dial(input: DialInput): Promise<SoftphoneCall>;
  on<E extends keyof SoftphoneEvents>(event: E, listener: SoftphoneEvents[E]): () => void;
}

export interface SoftphoneOptions {
  /**
   * Returns a fresh login token. Called on connect and again whenever the
   * session needs to re-authenticate. Implement it as a call to YOUR
   * backend, which mints the token via POST /v1/web_clients/{id}/tokens —
   * the Handset API key never reaches the browser.
   */
  getToken: () => Promise<string>;
  /**
   * Where remote audio plays. An <audio> element or its id. When omitted,
   * an invisible element is created and appended to <body>.
   */
  audioElement?: HTMLAudioElement | string;
  /** Ringtone/ringback media URLs, optional. */
  ringtoneUrl?: string;
  ringbackUrl?: string;
}

/** Tiny typed emitter shared by implementations. */
export class Emitter<Events extends Record<string, (...args: never[]) => void>> {
  private listeners = new Map<keyof Events, Set<Events[keyof Events]>>();

  on<E extends keyof Events>(event: E, listener: Events[E]): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);
    return () => set.delete(listener);
  }

  emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        (listener as (...a: Parameters<Events[E]>) => void)(...args);
      } catch {
        // listener errors must not break the phone
      }
    });
  }
}
