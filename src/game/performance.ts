import type { EffectiveTier, PerformanceMode } from './types';

export interface HardwareProfile {
  cores: number;
  memoryGb: number | null;
  reducedMotion: boolean;
  recommendedTier: EffectiveTier;
}

export function detectHardwareProfile(): HardwareProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { cores: 8, memoryGb: 8, reducedMotion: false, recommendedTier: 'ultra' };
  }
  const cores = navigator.hardwareConcurrency || 4;
  const memoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null;
  const reducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let recommendedTier: EffectiveTier = 'ultra';
  if (reducedMotion || cores <= 2 || (memoryGb !== null && memoryGb <= 2)) {
    recommendedTier = 'light';
  } else if (cores <= 4 || (memoryGb !== null && memoryGb <= 4)) {
    recommendedTier = 'medium';
  }

  return {
    cores,
    memoryGb,
    reducedMotion,
    recommendedTier,
  };
}

export function resolveEffectiveTier(
  mode: PerformanceMode,
  autoDowngradeSteps: number,
  profile: HardwareProfile,
): EffectiveTier {
  if (mode === 'ultra') return 'ultra';
  if (mode === 'medium') return 'medium';
  if (mode === 'light') return 'light';

  // Auto mode steps down Ultra -> Medium -> Light if sustained low FPS detected
  if (autoDowngradeSteps >= 2) return 'light';
  if (autoDowngradeSteps === 1) {
    return profile.recommendedTier === 'light' ? 'light' : 'medium';
  }
  return profile.recommendedTier;
}

export function glassClass(tier: EffectiveTier): string {
  if (tier === 'ultra') return 'liquid-glass-ultra';
  if (tier === 'medium') return 'liquid-glass-medium';
  return 'liquid-glass-light';
}
