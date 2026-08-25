import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, LoaderCircle, Sparkles } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { buildCoachInput } from '@/core/coach/input';
import type { CoachFeedback } from '@/core/coach/types';
import { currentAiSettings, useAiSettingsStore } from '@/store/aiSettingsStore';
import type { FinishedExam } from '@/store/examStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; feedback: CoachFeedback }
  | { status: 'error'; message: string };

export function CoachPanel({ finished }: { finished: FinishedExam }) {
  const { coach } = usePlatform();
  const ai = useAiSettingsStore();
  const [state, setState] = useState<State>({ status: 'idle' });

  if (!coach.available()) return null;

  async function generate() {
    setState({ status: 'loading' });
    try {
      const input = buildCoachInput(finished.result, finished.mistakes, {
        durationSec: finished.payload.durationSec,
        lang: finished.payload.lang,
        board: finished.payload.examBoard,
      });
      const feedback = await coach.analyze(input, currentAiSettings(ai));
      setState({ status: 'done', feedback });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-accent-text" />
        <h2 className="font-semibold">AI coach</h2>
        {state.status !== 'done' && (
          <Button
            className="ml-auto"
            onClick={() => void generate()}
            disabled={state.status === 'loading'}
          >
            {state.status === 'loading' ? (
              <>
                <LoaderCircle size={15} className="animate-spin" /> Analyzing…
              </>
            ) : (
              'Get AI feedback'
            )}
          </Button>
        )}
      </div>

      {state.status === 'idle' && (
        <p className="text-sm text-fg-muted">
          Get a personalized breakdown of your weaknesses and a targeted practice plan.
          {!ai.configured && (
            <>
              {' '}
              Add an API key in{' '}
              <Link to="/app/settings" className="font-medium text-accent-text hover:underline">
                Settings
              </Link>{' '}
              first.
            </>
          )}
        </p>
      )}

      {state.status === 'error' && (
        <div className="flex items-start gap-2 rounded-control bg-danger-soft p-3 text-sm text-danger-soft-fg">
          <CircleAlert size={16} className="mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === 'done' && <Feedback feedback={state.feedback} />}
    </Card>
  );
}

function Feedback({ feedback }: { feedback: CoachFeedback }) {
  return (
    <div className="space-y-4 text-sm">
      {feedback.summary && <p>{feedback.summary}</p>}

      {feedback.mainWeakness && (
        <Section title="Main weakness">
          <p>{feedback.mainWeakness}</p>
        </Section>
      )}

      {feedback.tips.length > 0 && (
        <Section title="Tips">
          <ul className="list-disc space-y-1 pl-5">
            {feedback.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Section>
      )}

      {feedback.focusKeys.length > 0 && (
        <Section title="Keys to practice">
          <div className="flex flex-wrap gap-1.5">
            {feedback.focusKeys.map((key, i) => (
              <kbd
                key={i}
                className="rounded-inner border border-edge bg-surface-2 px-2 py-0.5 font-mono text-xs"
              >
                {key}
              </kbd>
            ))}
          </div>
        </Section>
      )}

      {feedback.exercise && (
        <Section title="Practice exercise">
          <p>{feedback.exercise}</p>
        </Section>
      )}

      {feedback.goal && (
        <Section title="Next goal">
          <p>{feedback.goal}</p>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold tracking-wide text-fg-muted uppercase">{title}</h3>
      {children}
    </div>
  );
}
