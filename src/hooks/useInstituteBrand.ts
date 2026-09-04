import { useCallback, useEffect, useState } from 'react';
import { usePlatform } from '@/platform/PlatformContext';
import { SETTING_KEY } from '@/core/constants';
import {
  EMPTY_BRAND,
  encodeBrand,
  parseBrand,
  type InstituteBrand,
} from '@/core/institute/brand';

/**
 * The institute's branding, and its logo already decoded.
 *
 * Certificate drawing is synchronous, so an image cannot be loaded inside it —
 * the logo is turned into a bitmap here, once, and handed over ready to draw.
 */
export function useInstituteBrand(): {
  brand: InstituteBrand;
  logo: HTMLImageElement | null;
  save: (next: InstituteBrand) => Promise<void>;
  loading: boolean;
} {
  const platform = usePlatform();
  const [brand, setBrand] = useState<InstituteBrand>(EMPTY_BRAND);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void platform.repo
      .getSetting(SETTING_KEY.InstituteBrand)
      .then((raw) => {
        if (alive) setBrand(parseBrand(raw));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [platform]);

  useEffect(() => {
    if (!brand.logo) {
      setLogo(null);
      return;
    }
    const image = new Image();
    image.onload = () => setLogo(image);
    // A logo that will not decode is dropped rather than left half-loaded — a
    // certificate with a broken image on it is worse than one without a logo.
    image.onerror = () => setLogo(null);
    image.src = brand.logo;
  }, [brand.logo]);

  const save = useCallback(
    async (next: InstituteBrand) => {
      setBrand(next);
      await platform.repo.setSetting(SETTING_KEY.InstituteBrand, encodeBrand(next));
    },
    [platform],
  );

  return { brand, logo, save, loading };
}
