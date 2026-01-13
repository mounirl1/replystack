import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ResponseProfileOptions,
  SectorOption,
  ToneOption,
  LengthOption,
  NegativeStrategyOption,
} from '@/types/responseProfile';

/**
 * Hook to translate response profile options from the API.
 * Replaces French labels/descriptions with translated versions.
 */
export function useTranslatedOptions(options: ResponseProfileOptions | null): ResponseProfileOptions | null {
  const { t } = useTranslation('settings');

  return useMemo(() => {
    if (!options) return null;

    // Translate sectors
    const translatedSectors: SectorOption[] = options.sectors.map((sector) => ({
      ...sector,
      label: t(`responseStyle.options.sectors.${sector.value}`, sector.label),
    }));

    // Translate tones
    const translatedTones: ToneOption[] = options.tones.map((tone) => ({
      ...tone,
      label: t(`responseStyle.options.tones.${tone.value}.label`, tone.label),
      description: t(`responseStyle.options.tones.${tone.value}.description`, tone.description),
      example: t(`responseStyle.options.tones.${tone.value}.example`, tone.example),
    }));

    // Translate lengths
    const translatedLengths: LengthOption[] = options.lengths.map((length) => ({
      ...length,
      label: t(`responseStyle.options.lengths.${length.value}.label`, length.label),
      description: t(`responseStyle.options.lengths.${length.value}.description`, length.description),
    }));

    // Translate negative strategies
    const translatedStrategies: NegativeStrategyOption[] = options.negativeStrategies.map((strategy) => ({
      ...strategy,
      label: t(`responseStyle.options.negativeStrategies.${strategy.value}.label`, strategy.label),
      description: t(`responseStyle.options.negativeStrategies.${strategy.value}.description`, strategy.description),
    }));

    return {
      sectors: translatedSectors,
      tones: translatedTones,
      lengths: translatedLengths,
      negativeStrategies: translatedStrategies,
    };
  }, [options, t]);
}
