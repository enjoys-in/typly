import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SourceType } from '@/core/constants';
import { useIncomingStore } from '@/store/incomingStore';
import { readExamSnapshot } from '@/hooks/useExamSnapshot';
import { currentStreak, testsToday } from '@/core/stats';
import { readProgressMap, inProgressIds, nextPart } from '@/core/library/progress';
import { isChallengeFile } from '@/core/text/fileKind';
import { parseChallenge } from '@/core/share/challenge';
import type { ShellStatus } from '@/core/ipc/shell';
import type { OpenedFile, Platform } from '@/platform/ports';

/**
 * Keeps the desktop shell and the app in step, in both directions:
 *
 * - out: what the tray menu, tooltip and dock badge say (today's practice, the
 *   streak, and whether anything is waiting to be resumed);
 * - in: files opened with Typly, and routes picked from the tray, dock menu or
 *   jump list.
 *
 * All of it is inert on the web, where the shell port is a no-op.
 */
export function useShellBridge(): void {
  const platform = usePlatform();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const dnd = useSettingsStore((s) => s.dnd);
  const setDnd = useSettingsStore((s) => s.setDnd);
  const setFile = useIncomingStore((s) => s.setFile);
  const setChallenge = useIncomingStore((s) => s.setChallenge);
  const setDraft = useExamStore((s) => s.setDraft);

  // Routes from the tray / dock menu / jump list.
  useEffect(() => {
    return platform.shell.onNavigate((route) => navigate(route));
  }, [platform, navigate]);

  // Do not disturb can be switched from the tray without opening the window.
  // The store stays the one source of truth: the tray asks, this applies it,
  // and the new status is published back below.
  useEffect(() => {
    return platform.shell.onSetDnd(setDnd);
  }, [platform, setDnd]);

  // A file opened with Typly goes to the New Test page, which runs it through
  // the same extraction pipeline as the drop zone. One that arrived during a
  // cold launch is claimed on mount.
  //
  // A challenge file is the exception: it already *is* a passage plus rules, so
  // it skips import entirely and lands on the setup page with the challenger's
  // score held for the result report.
  useEffect(() => {
    const open = (file: OpenedFile) => {
      if (isChallengeFile(file.name)) {
        const challenge = parseChallenge(new TextDecoder().decode(file.bytes));
        if (challenge) {
          setChallenge(challenge);
          setDraft({
            passage: challenge.passage,
            title: challenge.title,
            documentId: null,
            sourceType: SourceType.Text,
            lang: challenge.lang,
          });
          navigate('/app/setup');
          return;
        }
        // Unreadable: fall through and let the ordinary import try, so a
        // mis-named text file still opens as a passage rather than vanishing.
      }
      setFile(file);
      navigate('/app/new');
    };
    const off = platform.shell.onOpenFile(open);
    void platform.shell.takeOpenedFile().then((file) => {
      if (file) open(file);
    });
    return off;
  }, [platform, navigate, setFile, setChallenge, setDraft]);

  // Recomputed on every navigation: finishing a test, resuming one or splitting
  // a document all end in a route change, so the tray is never stale.
  useEffect(() => {
    if (!platform.shell.available()) return;
    let alive = true;
    void (async () => {
      const status = await collectStatus(platform, dailyGoal, dnd).catch(() => null);
      if (alive && status) platform.shell.setStatus(status);
    })();
    return () => {
      alive = false;
    };
  }, [platform, dailyGoal, dnd, pathname]);
}

async function collectStatus(
  platform: Platform,
  dailyGoal: number,
  dnd: boolean,
): Promise<ShellStatus> {
  const get = (key: string) => platform.repo.getSetting(key);
  const rows = await platform.repo.listHistory();
  const snapshot = await readExamSnapshot(platform.repo);

  // The most recently touched split document, named so the tray can offer it by
  // title rather than as an anonymous "continue".
  const map = await readProgressMap(get);
  const [docId] = inProgressIds(map);
  let resumeLabel: string | null = null;
  if (docId != null) {
    const entry = map[String(docId)];
    const doc = await platform.repo.getDocument(docId);
    const part = entry ? nextPart(entry) : null;
    if (doc && entry && part !== null) {
      resumeLabel = `${doc.title} · part ${part + 1} of ${entry.parts}`;
    }
  }

  return {
    testsToday: testsToday(rows),
    dailyGoal,
    streak: currentStreak(rows),
    hasUnfinished: snapshot !== null,
    resumeLabel,
    dnd,
  };
}
