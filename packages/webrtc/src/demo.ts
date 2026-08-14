import {
  Emitter,
  type CallState,
  type DialInput,
  type Softphone,
  type SoftphoneCall,
  type SoftphoneEvents,
  type SoftphoneStatus,
} from "./types";

export interface DemoSoftphoneOptions {
  /** Seconds an outbound call "rings" before the fake callee answers. */
  answerAfterSeconds?: number;
  /** Ring an incoming demo call this many seconds after connect (0 = never). */
  incomingAfterSeconds?: number;
  incomingFrom?: string;
}

/** A demo softphone: everything a Softphone is, plus call staging. */
export interface DemoSoftphoneHandle extends Softphone {
  /** Ring an inbound demo call right now (no-op unless ready and idle). */
  stageIncoming(from: string): SoftphoneCall | null;
}

/**
 * A softphone that needs no network, credentials, or microphone: outbound
 * calls "answer" after a moment, and it can stage an incoming call. Powers
 * the docs demos; also handy in component tests and Storybooks.
 */
export function createDemoSoftphone(options: DemoSoftphoneOptions = {}): DemoSoftphoneHandle {
  return new DemoSoftphone(options);
}

class DemoSoftphone implements Softphone {
  status: SoftphoneStatus = "idle";
  activeCall: DemoCall | null = null;

  private readonly options: DemoSoftphoneOptions;
  private readonly emitter = new Emitter<SoftphoneEvents>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(options: DemoSoftphoneOptions) {
    this.options = options;
  }

  on<E extends keyof SoftphoneEvents>(event: E, listener: SoftphoneEvents[E]): () => void {
    return this.emitter.on(event, listener);
  }

  async connect(): Promise<void> {
    this.setStatus("connecting");
    await wait(600);
    this.setStatus("ready");
    const inSecs = this.options.incomingAfterSeconds ?? 0;
    if (inSecs > 0) {
      this.timers.push(
        setTimeout(() => this.stageIncoming(this.options.incomingFrom ?? "+14155550132"), inSecs * 1000),
      );
    }
  }

  disconnect(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.activeCall?.forceEnd();
    this.activeCall = null;
    this.setStatus("idle");
  }

  async dial(input: DialInput): Promise<SoftphoneCall> {
    if (this.status !== "ready") throw new Error("Demo softphone is not connected.");
    const call = new DemoCall("outbound", input.to, () => this.clearIfActive(call));
    this.activeCall = call;
    call.subscribe((c) => this.emitter.emit("call", c));
    call.set("ringing");
    this.timers.push(
      setTimeout(() => {
        if (call.state === "ringing") call.set("active");
      }, (this.options.answerAfterSeconds ?? 3) * 1000),
    );
    return call;
  }

  /** Stage an inbound ringing call right now (docs "simulate call" button). */
  stageIncoming(from: string): SoftphoneCall | null {
    if (this.status !== "ready" || this.activeCall) return null;
    const call = new DemoCall("inbound", from, () => this.clearIfActive(call));
    this.activeCall = call;
    call.subscribe((c) => this.emitter.emit("call", c));
    this.emitter.emit("incoming", call);
    return call;
  }

  private clearIfActive(call: DemoCall): void {
    if (this.activeCall === call) this.activeCall = null;
  }

  private setStatus(status: SoftphoneStatus): void {
    this.status = status;
    this.emitter.emit("status", status);
  }
}

class DemoCall implements SoftphoneCall {
  readonly id = `democall_${Math.random().toString(36).slice(2, 10)}`;
  readonly direction: "inbound" | "outbound";
  readonly remoteNumber: string;
  state: CallState;
  muted = false;
  startedAt: Date | null = null;
  endedReason: string | null = null;

  private readonly listeners = new Set<(call: SoftphoneCall) => void>();
  private readonly onEnded: () => void;

  constructor(direction: "inbound" | "outbound", remoteNumber: string, onEnded: () => void) {
    this.direction = direction;
    this.remoteNumber = remoteNumber;
    this.onEnded = onEnded;
    this.state = "ringing";
  }

  set(state: CallState): void {
    if (this.state === state) return;
    this.state = state;
    if (state === "active" && !this.startedAt) this.startedAt = new Date();
    if (state === "ended") this.onEnded();
    this.notify();
  }

  forceEnd(): void {
    this.set("ended");
  }

  async answer(): Promise<void> {
    if (this.state === "ringing") this.set("active");
  }

  async reject(): Promise<void> {
    this.set("ended");
  }

  async hangup(): Promise<void> {
    this.set("ended");
  }

  mute(): void {
    this.muted = true;
    this.notify();
  }

  unmute(): void {
    this.muted = false;
    this.notify();
  }

  sendDigits(): void {
    // no-op in the demo
  }

  onChange(listener: (call: SoftphoneCall) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribe(listener: (call: SoftphoneCall) => void): void {
    this.listeners.add(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this);
      } catch {
        // ignore
      }
    });
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
