import { useState } from 'react';
import { Building2, Upload, X } from 'lucide-react';
import { MAX_LOGO_BYTES, type InstituteBrand } from '@/core/institute/brand';
import { useInstituteBrand } from '@/hooks/useInstituteBrand';
import { Button } from '@/ui/Button';
import { FileButton } from '@/ui/FileButton';
import { Card } from '@/ui/Card';
import { useT } from '@/i18n';

/**
 * An institute's name, logo and signatory.
 *
 * A coaching centre wants its own name on the certificates its students take
 * home, and wants to print a whole batch rather than one at a time from twenty
 * different result pages. This is the settings half; `BatchCertificates` on the
 * History page is the printing half.
 *
 * Stored as one settings row, so it travels inside a backup and between paired
 * devices like everything else — a centre that reinstalls does not lose it.
 */
export function InstituteCard() {
  const t = useT();
  const { brand, save, loading } = useInstituteBrand();
  const [draft, setDraft] = useState<InstituteBrand | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edited locally and committed on save, so a half-typed name is never what a
  // certificate prints.
  const value = draft ?? brand;
  const dirty = draft !== null;

  function patch(next: Partial<InstituteBrand>) {
    setDraft({ ...value, ...next });
  }

  async function onLogo(file: File) {
    if (file.size > MAX_LOGO_BYTES) {
      setError(t('institute.logoTooBig', { kb: Math.round(MAX_LOGO_BYTES / 1024) }));
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => patch({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  }

  if (loading) return null;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Building2 size={16} className="shrink-0 text-fg-subtle" />
          {t('institute.title')}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">{t('institute.hint')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('institute.name')}>
          <input
            value={value.name}
            onChange={(e) => patch({ name: e.target.value })}
            maxLength={60}
            placeholder={t('institute.namePlaceholder')}
            className="select"
          />
        </Field>
        <Field label={t('institute.subtitle')}>
          <input
            value={value.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            maxLength={80}
            placeholder={t('institute.subtitlePlaceholder')}
            className="select"
          />
        </Field>
        <Field label={t('institute.signatory')}>
          <input
            value={value.signatory}
            onChange={(e) => patch({ signatory: e.target.value })}
            maxLength={40}
            placeholder={t('institute.signatoryPlaceholder')}
            className="select"
          />
        </Field>
        <Field label={t('institute.signatoryTitle')}>
          <input
            value={value.signatoryTitle}
            onChange={(e) => patch({ signatoryTitle: e.target.value })}
            maxLength={40}
            placeholder={t('institute.signatoryTitlePlaceholder')}
            className="select"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {value.logo ? (
          <span className="flex items-center gap-2 rounded-control border border-line p-1.5">
            <img src={value.logo} alt="" className="h-10 w-10 object-contain" />
            <button
              type="button"
              onClick={() => patch({ logo: null })}
              aria-label={t('institute.removeLogo')}
              className="cursor-pointer rounded-inner p-1 text-fg-subtle transition-colors hover:bg-danger-soft hover:text-danger-text"
            >
              <X size={14} />
            </button>
          </span>
        ) : (
          <FileButton
            accept="image/png,image/jpeg,image/svg+xml"
            onPick={(file) => void onLogo(file)}
          >
            <Upload size={15} />
            {t('institute.uploadLogo')}
          </FileButton>
        )}
        <Button
          disabled={!dirty}
          onClick={() => {
            void save(value);
            setDraft(null);
          }}
        >
          {t('institute.save')}
        </Button>
        {dirty && (
          <Button variant="ghost" onClick={() => setDraft(null)}>
            {t('institute.cancel')}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">{label}</span>
      {children}
    </label>
  );
}
