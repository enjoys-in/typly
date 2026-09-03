import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, Play, Plus, Trash2 } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { useExamStore } from '@/store/examStore';
import { drillBase, useSettingsStore } from '@/store/settingsStore';
import { isMacOS } from '@/platform/detect';
import { SETTING_KEY, SourceType } from '@/core/constants';
import {
  LESSONS,
  SKILL_LEVEL_LABEL,
  SkillLevel,
  lessonPassage,
  type Lesson,
} from '@/core/lessons/curriculum';
import {
  loadCustomLessons,
  saveCustomLessons,
  newCustomLesson,
  type CustomLesson,
} from '@/core/lessons/customLessons';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { ProgressBar } from '@/ui/ProgressBar';

export function Lessons() {
  const platform = usePlatform();
  const navigate = useNavigate();
  const setConfig = useExamStore((s) => s.setConfig);
  const settings = useSettingsStore();
  const [done, setDone] = useState<Set<string> | null>(null);
  const [customs, setCustoms] = useState<CustomLesson[]>([]);
  const [addingLesson, setAddingLesson] = useState(false);

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
    const prev = LESSONS[index - 1];
    return !!prev && done.has(prev.id);
  }

  function run(passage: string, title: string, lessonId: string) {
    setConfig({
      ...drillBase(settings),
      passage,
      title,
      documentId: null,
      sourceType: SourceType.Text,
      lessonId,
    });
    navigate('/app/exam');
  }

  function start(lesson: Lesson) {
    run(lessonPassage(lesson, isMacOS()), `Lesson: ${lesson.title}`, lesson.id);
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

  const completedCount = done ? LESSONS.filter((l) => done.has(l.id)).length : 0;
  const levels = Object.values(SkillLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="mt-1 text-fg-muted">
            A beginner-to-advanced path. Hit each lesson&apos;s speed and accuracy target to unlock
            the next.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setAddingLesson(true)}>
          <Plus size={16} /> Add new lesson
        </Button>
      </div>

      <Card className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Curriculum progress</span>
          <span className="tabular-nums text-fg-muted">
            {completedCount} / {LESSONS.length} lessons
          </span>
        </div>
        <ProgressBar value={(completedCount / LESSONS.length) * 100} />
      </Card>

      {levels.map((level) => (
        <div key={level} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
            {SKILL_LEVEL_LABEL[level]}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LESSONS.map((lesson, i) =>
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
  const disabled = !unlocked && !completed;
  return (
    <button
      onClick={disabled ? undefined : onStart}
      disabled={disabled}
      className={`flex flex-col items-start gap-2 rounded-panel border p-4 text-left transition-all ${
        disabled
          ? 'cursor-not-allowed border-line bg-surface-2 opacity-70'
          : 'cursor-pointer border-line bg-surface hover:-translate-y-0.5 hover:border-accent-border hover:shadow-lg'
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
        Target {lesson.targetWpm} WPM · {lesson.targetAccuracy}%
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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Your lessons</h2>

      {open && (
        <Card className="space-y-4">
          <p className="text-sm text-fg-muted">
            Author your own drill from any text — your own passage, a syllabus paragraph, or exam
            material. Pick a category and targets, then practice it like any lesson.
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson name"
            className={`${inputCls} w-full`}
          />
          <textarea
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="Paste or type the passage to practice…"
            className={`${inputCls} scroll-area h-28 w-full resize-none`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm text-fg-muted">
              Category
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SkillLevel)}
                className={inputCls}
              >
                {Object.values(SkillLevel).map((l) => (
                  <option key={l} value={l}>
                    {SKILL_LEVEL_LABEL[l]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg-muted">
              Target WPM
              <input
                type="number"
                min={1}
                value={wpm}
                onChange={(e) => setWpm(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg-muted">
              Target accuracy %
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
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canAdd}>
              <Plus size={16} /> Add lesson
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
                    aria-label="Delete lesson"
                    className="rounded-inner p-1 text-fg-subtle transition-colors hover:text-danger-text"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className="text-sm font-semibold">{lesson.title}</span>
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fg-muted">
                  {SKILL_LEVEL_LABEL[lesson.level]}
                </span>
                <span className="line-clamp-2 text-xs text-fg-muted">{lesson.passage}</span>
                <span className="text-[11px] tabular-nums text-fg-subtle">
                  Target {lesson.targetWpm} WPM · {lesson.targetAccuracy}%
                </span>
                <Button size="sm" variant="secondary" onClick={() => onStart(lesson)}>
                  <Play size={14} /> Practice
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

