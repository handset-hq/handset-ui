/**
 * A generated ringtone — no audio assets to ship. Classic North American
 * ring: 440Hz + 480Hz, 2s on / 4s off, until stopped. Autoplay policies are
 * satisfied because connect() was user-initiated.
 */
export class GeneratedRing {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.ctx || typeof AudioContext === "undefined") return;
    try {
      this.ctx = new AudioContext();
    } catch {
      return; // no audio available; ring silently rather than crash
    }
    const burst = () => {
      const ctx = this.ctx;
      if (!ctx) return;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + 1.95);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
      gain.connect(ctx.destination);
      for (const freq of [440, 480]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2.0);
      }
    };
    burst();
    this.timer = setInterval(burst, 6000);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }
}
