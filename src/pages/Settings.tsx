import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { boardsByCategory, profileFor } from '@/core/scoring/examProfiles';
import { isMethodAvailable } from '@/core/text/keymaps';
import { MISSED_NUDGE_MINUTES } from '@/core/reminder/schedule';
import { bundleCounts, isBackupBundle } from '@/core/sync/lan';
import { isElectron } from '@/platform/detect';
import {
  ExamBoard,
  Difficulty,
  HindiFont,
  InputMethod,
  Lang,
} from '@/core/constants';
import { AiSettingsCard } from '@/components/settings/AiSettingsCard';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { UI_LANGS, UI_LANG_LABEL, useT, type UiLang } from '@/i18n';
import { DeviceSyncCard } from '@/components/settings/DeviceSyncCard';
import { LanguageToolsCard } from '@/components/settings/LanguageToolsCard';
import { InstituteCard } from '@/components/settings/InstituteCard';
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
  // Re-read after a prompt, so the hint below the switch stays truthful.
  const [notifyPermission, setNotifyPermission] = useState(() =>
    platform.notifications.permission(),
  );

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

  /**
   * The reminder has two ways to reach you: a system notification, and the tray
   * (or the browser tab) showing practice as pending. Only the first needs
   * permission — so a refused or blocked prompt must not stop the switch from
   * going on, which is what used to happen, silently.
   */
  async function toggleReminder(next: boolean) {
    settings.setReminderEnabled(next);
    if (!next) return;
    await platform.notifications.ensurePermission().catch(() => false);
    setNotifyPermission(platform.notifications.permission());
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
      setBackupStatus(t('settings.exportedCount', bundle.counts));
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
      const bundle: unknown = JSON.parse(await file.text());
      // The same guard the network path uses, so a hand-edited or truncated
      // file is refused before it reaches the store.
      if (!isBackupBundle(bundle)) throw new Error(t('settings.notABackup'));
      await platform.repo.importBackup(bundle);
      setEmpty(false);
      setBackupStatus(t('settings.restoredCount', bundleCounts(bundle)));
    } catch (err) {
      setBackupStatus(
        t('settings.restoreFailed', {
          error: err instanceof Error ? err.message : t('settings.notABackup'),
        }),
      );
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
      setFontNote(t('settings.fontLoaded', { file: file.name, slot: t(`hindiFont.${slot}`) }));
    } catch {
      setFontNote(t('settings.fontFailed'));
    }
  }

  const busy = exporting || importing;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

      <ProfileCard />

      <Card className="space-y-2">
        <label className="flex flex-col gap-2" htmlFor="interface-language">
          <span className="text-sm font-semibold">{t('settings.interfaceLanguage')}</span>
          <select
            id="interface-language"
            value={settings.uiLang}
            onChange={(e) => settings.setUiLang(e.target.value as UiLang)}
            aria-label={t('settings.interfaceLanguage')}
            className="select max-w-sm"
          >
            {UI_LANGS.map((code) => (
              <option key={code} value={code}>
                {UI_LANG_LABEL[code]}
              </option>
            ))}
          </select>
          <span className="text-xs text-fg-muted">
            {t('settings.interfaceHint')}
          </span>
        </label>
      </Card>

      {/* Masonry two columns on wide screens so cards pack tightly, less scrolling. */}
      <div className="columns-1 gap-6 *:mb-6 *:break-inside-avoid lg:columns-2">
        <Card className="space-y-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('settings.defaultLanguage')}</span>
          <select
            value={settings.lang}
            onChange={(e) => settings.setLang(e.target.value as Lang)}
            className="select"
          >
            {Object.values(Lang).map((l) => (
              <option key={l} value={l}>
                {t(`lang.${l}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('settings.defaultProfile')}</span>
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
          <span className="text-sm font-medium">{t('settings.defaultDifficulty')}</span>
          <select
            value={settings.difficulty}
            onChange={(e) => settings.setDifficulty(e.target.value as Difficulty)}
            className="select"
          >
            {Object.values(Difficulty).map((d) => (
              <option key={d} value={d}>
                {t(`difficulty.${d}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('settings.inputMethod')}</span>
          <select
            value={settings.inputMethod}
            onChange={(e) => settings.setInputMethod(e.target.value as InputMethod)}
            className="select"
          >
            {Object.values(InputMethod).map((m) => (
              <option key={m} value={m} disabled={!isMethodAvailable(m)}>
                {t(`inputMethod.${m}`)}
                {isMethodAvailable(m) ? '' : t('settings.layoutMissing')}
              </option>
            ))}
          </select>
          <span className="text-xs text-fg-muted">
            {t('settings.inputMethodHint')}
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('settings.font')}</span>
          <select
            value={settings.hindiFont}
            onChange={(e) => settings.setHindiFont(e.target.value as HindiFont)}
            className="select"
          >
            {Object.values(HindiFont).map((f) => (
              <option key={f} value={f}>
                {t(`hindiFont.${f}`)}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => fontRef.current?.click()}
              disabled={settings.hindiFont === HindiFont.System}
            >
              {t('settings.uploadFont')}
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
            {t('settings.fontHint')}
          </span>
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold">{t('settings.behaviour')}</h2>
        <Toggle
          label={t('setup.allowBackspace')}
          hint={t('setup.allowBackspaceHint')}
          checked={settings.backspaceEnabled}
          onChange={settings.setBackspaceEnabled}
        />
        <Toggle
          label={t('setup.allowSpace')}
          checked={settings.spaceEnabled}
          onChange={settings.setSpaceEnabled}
        />
        <Toggle
          label={t('setup.allowEnter')}
          checked={settings.enterEnabled}
          onChange={settings.setEnterEnabled}
        />
        <Toggle
          label={t('setup.examLock')}
          hint={t('setup.examLockHint')}
          checked={settings.examLock}
          onChange={settings.setExamLock}
        />
        <Toggle
          label={t('settings.onScreenKeyboard')}
          hint={t('settings.onScreenKeyboardHint')}
          checked={settings.showKeyboard}
          onChange={settings.setShowKeyboard}
        />
        <label className="flex items-center justify-between gap-4">
          <span className="flex flex-col">
            <span className="text-sm font-medium">{t('settings.dailyGoal')}</span>
            <span className="text-xs text-fg-muted">{t('settings.dailyGoalHint')}</span>
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={settings.dailyGoal}
            onChange={(e) =>
              settings.setDailyGoal(Math.min(50, Math.max(1, Math.floor(Number(e.target.value) || 1))))
            }
            aria-label={t('settings.dailyGoalAria')}
            className="select w-20"
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold">{t('settings.feedback')}</h2>
        <Toggle
          label={t('settings.dnd')}
          hint={t('settings.dndHint')}
          checked={settings.dnd}
          onChange={settings.setDnd}
        />
        {settings.dnd && <p className="max-w-2xl text-xs text-fg-muted">{t('settings.dndOn')}</p>}
        <Toggle
          label={t('settings.notifications')}
          hint={t('settings.notificationsHint')}
          checked={settings.notify}
          onChange={toggleNotify}
          disabled={!platform.notifications.available()}
        />
        {!platform.notifications.available() && (
          <p className="text-xs text-fg-muted">{t('settings.noNotifications')}</p>
        )}
        <Toggle
          label={t('settings.sounds')}
          hint={t('settings.soundsHint')}
          checked={settings.sound}
          onChange={settings.setSound}
          disabled={!platform.sound.available()}
        />
        <Toggle
          label={t('settings.reminder')}
          hint={t('settings.reminderHint')}
          checked={settings.reminderEnabled}
          onChange={toggleReminder}
        />
        {/* Cheap to offer, and the one preference here that is about the
            typist's body rather than their score. */}
        <Toggle
          label={t('breaks.toggle')}
          hint={t('breaks.toggleHint')}
          checked={settings.breakNudges}
          onChange={settings.setBreakNudges}
        />
        {settings.reminderEnabled && notifyPermission !== 'granted' && (
          <p className="max-w-2xl text-xs text-danger-text">
            {t(
              notifyPermission === 'denied'
                ? 'settings.reminderBlocked'
                : notifyPermission === 'unsupported'
                  ? 'settings.reminderUnsupported'
                  : 'settings.reminderNotYet',
            )}{' '}
            {t(isElectron() ? 'settings.reminderFallbackTray' : 'settings.reminderFallbackTab')}
            {notifyPermission === 'denied' && ` ${t('settings.reminderHowToAllow')}`}
          </p>
        )}
        {settings.reminderEnabled && (
          <label className="flex items-center justify-between gap-4">
            <span className="flex flex-col">
              <span className="text-sm font-medium">{t('settings.reminderTime')}</span>
              <span className="text-xs text-fg-muted">{t('settings.reminderTimeHint')}</span>
            </span>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => settings.setReminderTime(e.target.value)}
              aria-label={t('settings.reminderTime')}
              className="select w-32"
            />
          </label>
        )}
        {settings.reminderEnabled && (
          <p className="max-w-2xl text-xs text-fg-muted">
            {t(isElectron() ? 'settings.reminderMissedTray' : 'settings.reminderMissedTab', {
              minutes: MISSED_NUDGE_MINUTES,
            })}
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">{t('settings.backup')}</h2>
          <p className="mt-1 text-xs text-fg-muted">
            {t('settings.backupHint')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={exportBackup} disabled={busy || empty !== false} aria-busy={exporting}>
            {t(exporting ? 'settings.exporting' : 'settings.export')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-busy={importing}
          >
            {t(importing ? 'settings.restoring' : 'settings.restore')}
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
          <p className="text-xs text-fg-subtle">{t('settings.nothingToExport')}</p>
        )}
      </Card>

      <InstituteCard />

      <DeviceSyncCard />

      <ThemeCard />

      <LanguageToolsCard />

      <StorageCard />

      <AiSettingsCard />
      </div>

      <Button variant="secondary" onClick={logout}>
        {t('nav.logout')}
      </Button>
    </div>
  );
}
