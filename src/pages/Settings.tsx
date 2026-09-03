import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import type { BackupBundle } from '@/platform/ports';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { boardsByCategory, profileFor } from '@/core/scoring/examProfiles';
import { isMethodAvailable } from '@/core/text/keymaps';
import { MISSED_NUDGE_MINUTES } from '@/core/reminder/schedule';
import { isElectron } from '@/platform/detect';
import {
  ExamBoard,
  Difficulty,
  DIFFICULTY_LABEL,
  HindiFont,
  HINDI_FONT_LABEL,
  InputMethod,
  INPUT_METHOD_LABEL,
  Lang,
  LANG_LABEL,
} from '@/core/constants';
import { AiSettingsCard } from '@/components/settings/AiSettingsCard';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { UI_LANGS, UI_LANG_LABEL, useT, type UiLang } from '@/i18n';
import { LanguageToolsCard } from '@/components/settings/LanguageToolsCard';
import { StorageCard } from '@/components/settings/StorageCard';
import { ThemeCard } from '@/components/settings/ThemeCard';
import { registerFontFromDataUrl, fontSettingKey, UPLOADED_FAMILY, cacheFontToDesktop } from '@/ui/fonts';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Toggle } from '@/ui/Toggle';

export function Settings() {
  const t = useT();
  const platform = usePlatform();
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const setAccount = useAuthStore((s) => s.setAccount);

  const fileRef = useRef<HTMLInputElement>(null);
  const fontRef = useRef<HTMLInputElement>(null);
  const [empty, setEmpty] = useState<boolean | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [fontNote, setFontNote] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([platform.repo.listHistory(), platform.repo.listDocuments()]).then(([h, d]) =>
      setEmpty(h.length === 0 && d.length === 0),
    );
  }, [platform]);

  async function logout() {
    await platform.auth.logout();    setAccount(null);
    navigate('/', { replace: true });
  }

  async function toggleNotify(next: boolean) {
    if (next) {
      const granted = await platform.notifications.ensurePermission();
      settings.setNotify(granted);
      return;
    }
    settings.setNotify(false);
  }

  async function toggleReminder(next: boolean) {
    if (next) {
      const granted = await platform.notifications.ensurePermission();
      settings.setReminderEnabled(granted);
      return;
    }
    settings.setReminderEnabled(false);
  }

  async function exportBackup() {
    setExporting(true);
    setBackupStatus(null);
    try {
      const bundle = await platform.repo.exportBackup();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typly-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus(
        `Exported ${bundle.counts.tests} tests and ${bundle.counts.documents} paragraphs.`,
      );
    } finally {
      setExporting(false);
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setImporting(true);
    setBackupStatus(null);
    try {
      const bundle = JSON.parse(await file.text()) as BackupBundle;
      if (!bundle || bundle.app !== 'typly' || !bundle.tables) {
        throw new Error('not a Typly backup file');
      }
      await platform.repo.importBackup(bundle);
      setEmpty(false);
      setBackupStatus(
        `Restored ${bundle.counts?.tests ?? 0} tests and ${bundle.counts?.documents ?? 0} paragraphs.`,
      );
    } catch (err) {
      setBackupStatus(`Could not restore: ${err instanceof Error ? err.message : 'invalid file'}`);
    } finally {
      setImporting(false);
    }
  }

  async function onFontFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    const slot = settings.hindiFont;
    if (!file || slot === HindiFont.System) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await registerFontFromDataUrl(dataUrl, UPLOADED_FAMILY[slot]);
      // Persisted in the app store (IndexedDB on web, better-sqlite3 on desktop).
      await platform.repo.setSetting(fontSettingKey(slot), dataUrl);
      // Desktop: also mirror to the on-disk font cache (userData/fonts).
      await cacheFontToDesktop(slot, dataUrl);
      setFontNote(`Loaded ${file.name} for ${HINDI_FONT_LABEL[slot]}`);
    } catch {
      setFontNote('Could not load that font file.');
    }
  }

  const busy = exporting || importing;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <ProfileCard />

      <Card className="space-y-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{t('setup.language')} · Interface</span>
          <select
            value={settings.uiLang}
            onChange={(e) => settings.setUiLang(e.target.value as UiLang)}
            aria-label="Interface language"
            className="select max-w-sm"
          >
            {UI_LANGS.map((code) => (
              <option key={code} value={code}>
                {UI_LANG_LABEL[code]}
              </option>
            ))}
          </select>
          <span className="text-xs text-fg-muted">
            The language of the app itself. Passage language is chosen per test.
          </span>
        </label>
      </Card>

      {/* Masonry two columns on wide screens so cards pack tightly, less scrolling. */}
      <div className="columns-1 gap-6 *:mb-6 *:break-inside-avoid lg:columns-2">
        <Card className="space-y-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Default language</span>
          <select
            value={settings.lang}
            onChange={(e) => settings.setLang(e.target.value as Lang)}
            className="select"
          >
            {Object.values(Lang).map((l) => (
              <option key={l} value={l}>
                {LANG_LABEL[l]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Default exam profile</span>
          <select
            value={settings.board}
            onChange={(e) => settings.setBoard(e.target.value as ExamBoard)}
            className="select"
          >
            {boardsByCategory().map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.boards.map((b) => (
                  <option key={b} value={b}>
                    {profileFor(b).name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Default difficulty</span>
          <select
            value={settings.difficulty}
            onChange={(e) => settings.setDifficulty(e.target.value as Difficulty)}
            className="select"
          >
            {Object.values(Difficulty).map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABEL[d]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Devanagari input method</span>
          <select
            value={settings.inputMethod}
            onChange={(e) => settings.setInputMethod(e.target.value as InputMethod)}
            className="select"
          >
            {Object.values(InputMethod).map((m) => (
              <option key={m} value={m} disabled={!isMethodAvailable(m)}>
                {INPUT_METHOD_LABEL[m]}
                {isMethodAvailable(m) ? '' : ' — layout data not installed'}
              </option>
            ))}
          </select>
          <span className="text-xs text-fg-muted">
            Phonetic lets you type in Roman (e.g. namaste → नमस्ते). InScript remaps the keyboard to
            the government-standard Devanagari layout, Remington GAIL to the typewriter layout. All
            apply to Hindi and Marathi tests.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Hindi font</span>
          <select
            value={settings.hindiFont}
            onChange={(e) => settings.setHindiFont(e.target.value as HindiFont)}
            className="select"
          >
            {Object.values(HindiFont).map((f) => (
              <option key={f} value={f}>
                {HINDI_FONT_LABEL[f]}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => fontRef.current?.click()}
              disabled={settings.hindiFont === HindiFont.System}
            >
              Upload font (.ttf/.otf)
            </Button>
            <input
              ref={fontRef}
              type="file"
              accept=".ttf,.otf,font/ttf,font/otf"
              onChange={onFontFile}
              className="hidden"
            />
            {fontNote && <span className="text-xs text-fg-muted">{fontNote}</span>}
          </div>
          <span className="text-xs text-fg-muted">
            Pick a font above, then upload its .ttf/.otf if it isn’t installed. Kruti Dev also
            relabels the on-screen keyboard. Fonts persist in the app store and travel with backups.
          </span>
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold">Default test behavior</h2>
        <Toggle
          label="Backspace / Delete"
          hint="Allow correcting mistakes during the test."
          checked={settings.backspaceEnabled}
          onChange={settings.setBackspaceEnabled}
        />
        <Toggle
          label="Space key"
          checked={settings.spaceEnabled}
          onChange={settings.setSpaceEnabled}
        />
        <Toggle
          label="Enter key"
          checked={settings.enterEnabled}
          onChange={settings.setEnterEnabled}
        />
        <Toggle
          label="Exam lock"
          hint="Keeps the screen awake; leaving the tab prompts to submit the test."
          checked={settings.examLock}
          onChange={settings.setExamLock}
        />
        <Toggle
          label="On-screen keyboard"
          hint="Show a color-coded keyboard that highlights the next key and finger."
          checked={settings.showKeyboard}
          onChange={settings.setShowKeyboard}
        />
        <label className="flex items-center justify-between gap-4">
          <span className="flex flex-col">
            <span className="text-sm font-medium">Daily goal</span>
            <span className="text-xs text-fg-muted">Tests to complete each day.</span>
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={settings.dailyGoal}
            onChange={(e) =>
              settings.setDailyGoal(Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 1))))
            }
            aria-label="Daily goal in tests"
            className="select w-20"
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold">Notifications & feedback</h2>
        <Toggle
          label="Desktop notifications"
          hint="Alert when a test finishes, time runs out, or you go idle/away."
          checked={settings.notify}
          onChange={toggleNotify}
          disabled={!platform.notifications.available()}
        />
        {!platform.notifications.available() && (
          <p className="text-xs text-fg-muted">This browser does not support notifications.</p>
        )}
        <Toggle
          label="Typing sounds"
          hint="Subtle key clicks, an error tone, and a chime when a test ends."
          checked={settings.sound}
          onChange={settings.setSound}
          disabled={!platform.sound.available()}
        />
        <Toggle
          label="Practice reminder"
          hint="A daily nudge at a set time if you haven't practiced yet."
          checked={settings.reminderEnabled}
          onChange={toggleReminder}
          disabled={!platform.notifications.available()}
        />
        {settings.reminderEnabled && (
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col">
              <span className="text-sm font-medium">Reminder time</span>
              <span className="text-xs text-fg-muted">When to nudge you each day.</span>
            </span>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => settings.setReminderTime(e.target.value)}
              aria-label="Reminder time"
              className="select w-32"
            />
          </label>
        )}
        {settings.reminderEnabled && (
          <p className="max-w-2xl text-xs text-fg-muted">
            Miss it and Typly keeps asking: {MISSED_NUDGE_MINUTES} minutes later you get a second
            notification, and the {isElectron() ? 'tray icon' : 'browser tab'} shows practice as
            pending until you finish a test.
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Backup &amp; restore</h2>
          <p className="mt-1 text-xs text-fg-muted">
            Export your history and library to a JSON file, or restore from one. Restoring merges
            into your current data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={exportBackup} disabled={busy || empty !== false} aria-busy={exporting}>
            {exporting ? 'Exporting…' : 'Export backup'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-busy={importing}
          >
            {importing ? 'Restoring…' : 'Restore backup'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={onImportFile}
            className="hidden"
          />
          {backupStatus && <span className="text-xs text-fg-muted">{backupStatus}</span>}
        </div>
        {empty === true && (
          <p className="text-xs text-fg-subtle">Nothing to export yet — take a test first.</p>
        )}
      </Card>

      <ThemeCard />

      <LanguageToolsCard />

      <StorageCard />

      <AiSettingsCard />
      </div>

      <Button variant="secondary" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
