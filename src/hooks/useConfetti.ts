import { useCallback } from 'react';

export function useConfetti() {
  const fireCelebration = useCallback(async (type: 'start' | 'complete') => {
    const confetti = (await import('canvas-confetti')).default;

    if (type === 'complete') {
      // Big burst for sprint completion
      const count = 200;
      const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
      const fire = (particleRatio: number, opts: Record<string, unknown>) =>
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else {
      // Smaller burst for sprint start
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981'],
        zIndex: 9999,
      });
    }
  }, []);

  return { fireCelebration };
}
