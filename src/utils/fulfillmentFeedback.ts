/** Короткий сигнал об успешной выдаче (жест / звук). Вызывать только из обработчика клика. */
export function playFulfillmentSuccessFeedback(): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([60, 40, 100]);
    }
  } catch {
    // Браузер может запретить вибрацию — не критично.
  }

  try {
    const AudioContextCtor =
      window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.06;

    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;
    oscillator.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    oscillator.stop(now + 0.2);

    void context.close();
  } catch {
    // Автовоспроизведение может быть заблокировано — не критично.
  }
}
