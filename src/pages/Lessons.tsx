import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, Play, Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { isMacOS } from '@/platform/detect';
import { Lang, SETTING_KEY, SourceType } from '@/core/constants';
import {
  SkillLevel,
  lessonPassage,
  lessonsFor,
  type Lesson,
} from '@/core/lessons/curriculum';
import { keymapFor } from '@/core/text/keymaps';
import { isDevanagari } from '@/core/text/scripts';
import { Segmented, type SegmentedOption } from '@/ui/Segmented';
import {
  loadCustomLessons,
  saveCustomLessons,
  newCustomLesson,
  type CustomLesson,
} from '@/core/lessons/customLessons';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { ProgressBar } from '@/ui/ProgressBar';
import { useT } from '@/i18n';

export function Lessons() {
  const t = useT();
  const platform = usePlatform();
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const [done, setDone] = useState<Set<string> | null>(null);
  const [customs, setCustoms] = useState<CustomLesson[]>([]);
  const [addingLesson, setAddingLesson] = useState(false);
  /**
   * Which ladder is on screen.
   *
   * Seeded from the language being practised, but switchable: plenty of
   * candidates sit an English paper and a Hindi one, and the two ladders are
   * separate skills with separate progress. Held as a script rather than a
   * language because Hindi and Marathi share every layout, matra and conjunct —
   * and so share one ladder.
   */
  const [ladder, setLadder] = useState<Lang>(isDevanagari(settings.lang) ? Lang.Hi : Lang.En);
  const lessons = useMemo(() => lessonsFor(ladder), [ladder]);
  // The layout the row lessons are built from — the typist's own, not an
  // assumed one. Null for English and for phonetic input, which has no fixed
  // key per letter to drill.
  const keymap = keymapFor(settings.inputMethod, ladder);

  const ladderOptions: SegmentedOption<Lang>[] = [
    { value: Lang.En, label: t('lang.eng') },
    { value: Lang.Hi, label: t('lessons.devanagari') },
  ];

  useEffect(() => {
    platform.repo.getSetting(SETTING_KEY.CompletedLessons).then((raw) => {
      try {
        setDone(new Set(JSON.parse(raw ?? '[]') as string[]));
      } catch {
        setDone(new Set());
      }
    });
    loadCustomLessons((k) => platform.repo.getSetting(k)).then(setCustoms);
  }, [platform]);

  function isUnlocked(index: number): boolean {
    if (index === 0 || !done) return true;
    const prev = lessons[index - 1];
    return !!prev && done.has(prev.id);
  }

  function run(passage: string, title: string, lessonId: string, lang = settings.lang) {
    setConfig({
      ...drillBase(settings),
      // The lesson decides the language of its own run, not the last exam
      // setup: a Devanagari lesson typed as English would grade the passage
      // against the wrong keyboard entirely.
      lang,
      passage,
      title,
      documentId: null,
      sourceType: SourceType.Text,
      lessonId,
    });
    navigate('/app/exam');
  }

  function start(lesson: Lesson) {
    run(
      lessonPassage(lesson, { isMac: isMacOS(), keymap }),
      `Lesson: ${lesson.title}`,
      lesson.id,
      lesson.lang,
    );
  }

  async function addCustom(lesson: CustomLesson) {
    const next = [...customs, lesson];
    setCustoms(next);
    await saveCustomLessons((k, v) => platform.repo.setSetting(k, v), next);
  }

  async function removeCustom(id: string) {
    const next = customs.filter((l) => l.id !== id);
    setCustoms(next);
    await saveCustomLessons((k, v) => platform.repo.setSetting(k, v), next);
  }

  const completedCount = done ? lessons.filter((l) => done.has(l.id)).length : 0;
  const levels = Object.values(SkillLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('lessons.title')}</h1>
          <p className="mt-1 text-fg-muted">{t('lessons.subtitleLong')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Two ladders, two sets of progress. The switch is here rather than
              in Settings because it is a choice about this page, not about how
              runs are graded. */}
          <Segmented
            options={ladderOptions}
            value={ladder}
            onChange={setLadder}
            ariaLabel={t('lessons.ladderAria')}
          />
          <Button variant="secondary" onClick={() => setAddingLesson(true)}>
            <Plus size={16} /> {t('lessons.addNew')}
          </Button>
        </div>
      </div>

      <Card className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{t('lessons.curriculumProgress')}</span>
          <span className="tabular-nums text-fg-muted">
            {t('lessons.countOf', { done: completedCount, total: lessons.length })}
          </span>
        </div>
        <ProgressBar value={(completedCount / lessons.length) * 100} />
        <p className="text-xs text-fg-muted">
          {t(ladder === Lang.Hi ? 'lessons.devanagariNote' : 'lessons.romanNote')}
        </p>
      </Card>

      {levels.map((level) => (
        <div key={level} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            {t(`skill.${level}`)}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lessons.map((lesson, i) =>
              lesson.level !== level ? null : (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  completed={!!done?.has(lesson.id)}
                  unlocked={isUnlocked(i)}
                  onStart={() => start(lesson)}
                />
              ),
            )}
          </div>
        </div>
      ))}

      <CustomLessons
        lessons={customs}
        done={done}
        open={addingLesson}
        onOpenChange={setAddingLesson}
        onAdd={addCustom}
        onRemove={removeCustom}
        onStart={(l) => run(l.passage, `Lesson: ${l.title}`, l.id)}
      />
    </div>
  );
}

function LessonCard({
  lesson,
  completed,
  unlocked,
  onStart,
}: {
  lesson: Lesson;
  completed: boolean;
  unlocked: boolean;
  onStart: () => void;
}) {
  const t = useT();
  const disabled = !unlocked && !completed;
  return (
    <button
      onClick={disabled ? undefined : onStart}
      disabled={disabled}
      className={`flex flex-col items-start gap-2 rounded-panel border p-4 text-left transition-all ${
        disabled
          ? 'cursor-not-allowed border-line bg-surface-2 opacity-70'
          : 'cursor-pointer border-line bg-surface shadow-e1 hover:-translate-y-0.5 hover:border-accent-border hover:shadow-e2'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          completed ? 'bg-accent-soft text-accent-soft-fg' : 'bg-surface-2 text-fg-subtle'
        }`}
      >
        {completed ? <CheckCircle2 size={18} /> : disabled ? <Lock size={16} /> : <Play size={16} />}
      </span>
      <span className="text-sm font-semibold">{lesson.title}</span>
      <span className="text-xs text-fg-muted">{lesson.description}</span>
      <span className="text-[11px] tabular-nums text-fg-subtle">
        {t('lessons.targetLine', { wpm: lesson.targetWpm, accuracy: lesson.targetAccuracy })}
      </span>
    </button>
  );
}

function CustomLessons({
  lessons,
  done,
  open,
  onOpenChange,
  onAdd,
  onRemove,
  onStart,
}: {
  lessons: CustomLesson[];
  done: Set<string> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lesson: CustomLesson) => void;
  onRemove: (id: string) => void;
  onStart: (lesson: CustomLesson) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState('');
  const [passage, setPassage] = useState('');
  const [level, setLevel] = useState<SkillLevel>(SkillLevel.Beginner);
  const [wpm, setWpm] = useState('30');
  const [accuracy, setAccuracy] = useState('92');
  const sectionRef = useRef<HTMLDivElement>(null);

  // When opened from the page header, bring the form into view.
  useEffect(() => {
    if (open) sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [open]);

  const canAdd = title.trim().length > 0 && passage.trim().length > 0;

  function reset() {
    setTitle('');
    setPassage('');
    setLevel(SkillLevel.Beginner);
    setWpm('30');
    setAccuracy('92');
  }

  function submit() {
    if (!canAdd) return;
    onAdd(
      newCustomLesson({
        title: title.trim(),
        passage: passage.trim(),
        level,
        targetWpm: Math.max(1, Math.round(Number(wpm) || 30)),
        targetAccuracy: Math.min(100, Math.max(1, Math.round(Number(accuracy) || 92))),
      }),
    );
    reset();
    onOpenChange(false);
  }

  function cancel() {
    reset();
    onOpenChange(false);
  }

  const inputCls =
    'rounded-control border border-edge bg-field px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-4 focus:ring-accent-ring';

  return (
    <div ref={sectionRef} className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
        {t('lessons.yourLessons')}
      </h2>

      {open && (
        <Card className="space-y-4">
          <p className="text-sm text-fg-muted">
            {t('lessons.authorHint')}
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('lessons.namePlaceholder')}
            className={`${inputCls} w-full`}
          />
          <textarea
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder={t('lessons.passagePlaceholder')}
            className={`${inputCls} scroll-area h-28 w-full resize-none`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm text-fg-muted">
              {t('lessons.category')}
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SkillLevel)}
                className={inputCls}
              >
                {Object.values(SkillLevel).map((l) => (
                  <option key={l} value={l}>
                    {t(`skill.${l}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg-muted">
              {t('lessons.targetWpm')}
              <input
                type="number"
                min={1}
                value={wpm}
                onChange={(e) => setWpm(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg-muted">
              {t('lessons.targetAccuracy')}
              <input
                type="number"
                min={1}
                max={100}
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={cancel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submit} disabled={!canAdd}>
              <Plus size={16} /> {t('lessons.addLesson')}
            </Button>
          </div>
        </Card>
      )}

      {lessons.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {lessons.map((lesson) => {
            const completed = !!done?.has(lesson.id);
            return (
              <div
                key={lesson.id}
                className="flex flex-col items-start gap-2 rounded-panel border border-line bg-surface p-4"
              >
                <div className="flex w-full items-start justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      completed ? 'bg-accent-soft text-accent-soft-fg' : 'bg-surface-2 text-fg-subtle'
                    }`}
                  >
                    {completed ? <CheckCircle2 size={18} /> : <Play size={16} />}
                  </span>
                  <button
                    onClick={() => onRemove(lesson.id)}
                    aria-label={t('lessons.deleteCustom')}
                    className="rounded-inner p-1 text-fg-subtle transition-colors hover:text-danger-text"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className="text-sm font-semibold">{lesson.title}</span>
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fg-muted">
                  {t(`skill.${lesson.level}`)}
                </span>
                <span className="line-clamp-2 text-xs text-fg-muted">{lesson.passage}</span>
                <span className="text-[11px] tabular-nums text-fg-subtle">
                  {t('lessons.targetLine', { wpm: lesson.targetWpm, accuracy: lesson.targetAccuracy })}
                </span>
                <Button size="sm" variant="secondary" onClick={() => onStart(lesson)}>
                  <Play size={14} /> {t('lessons.practice')}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

