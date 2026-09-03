/**
 * The interface copy, in English. This is the source of truth for both the
 * strings and the *keys*: `hi.ts` is typed as a complete record of these, so a
 * key can never be added without its Hindi translation.
 *
 * Keys are dotted and grouped by screen. Placeholders are `{named}` and are
 * substituted by `translate()`.
 */
export const en = {
  // Navigation and the app shell
  'nav.label': 'Main',
  'nav.dashboard': 'Dashboard',
  'nav.new': 'New Test',
  'nav.lessons': 'Lessons',
  'nav.practice': 'Practice',
  'nav.trainer': 'Trainer',
  'nav.library': 'Library',
  'nav.history': 'History',
  'nav.progress': 'Progress',
  'nav.settings': 'Settings',
  'nav.about': 'About',
  'nav.logout': 'Log out',
  'nav.guest': 'Guest',
  'nav.skipToContent': 'Skip to main content',
  'nav.collapse': 'Collapse sidebar',
  'nav.expand': 'Expand sidebar',

  // Time-of-day greetings
  'greeting.lateNight': 'Still up',
  'greeting.morning': 'Good morning',
  'greeting.afternoon': 'Good afternoon',
  'greeting.evening': 'Good evening',
  'greeting.night': 'Winding down',
  'greeting.returning': 'Welcome back',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.tagline': 'Turn any image, PDF, or paragraph into a typing exam.',
  'dashboard.wpmAverages': 'WPM averages',
  'dashboard.averageNet': 'Average net',
  'dashboard.averageGross': 'Average gross',
  'dashboard.lastN': 'Last {count}',
  'dashboard.today': 'Today',
  'dashboard.vsAverage': '{value} vs. average',
  'dashboard.netGrossNote':
    'Net is after error penalties, gross is raw speed — the gap between them is what accuracy costs you. Personal best {best} WPM.',
  'dashboard.bestWpm': 'Best WPM',
  'dashboard.avgAccuracy': 'Avg accuracy',
  'dashboard.tests': 'Tests',
  'dashboard.points': 'Points',
  'dashboard.lastTest': 'Last test',
  'dashboard.allResults': 'All results',
  'dashboard.netWpm': 'Net WPM',
  'dashboard.accuracy': 'Accuracy',
  'dashboard.errors': 'Errors',
  'dashboard.weakestKeys': 'Weakest keys',
  'dashboard.noMistakes': 'No mistakes recorded yet — nothing to drill. Keep it that way.',
  'dashboard.trainerNote':
    'The Trainer builds a drill from these, and from the transitions that cost you the most time.',
  'dashboard.openTrainer': 'Open Trainer',
  'dashboard.streak': 'Streak',
  'dashboard.goalReached': 'Daily goal reached — the streak is safe.',
  'dashboard.goalRemaining': "{count} more to hit today's goal.",
  'dashboard.passed': 'Passed',
  'dashboard.failed': 'Failed',

  // Exam screen
  'exam.endSubmit': 'End & submit',
  'exam.pause': 'Pause',
  'exam.resume': 'Resume',
  'exam.paused': 'Paused',
  'exam.nonStop': 'Non-stop mode · pausing disabled',
  'exam.examDay': 'Exam day',
  'exam.resumed': 'Resumed',
  'exam.testOf': 'Test {current} of {total}',
  'exam.showKeyboard': 'Show keyboard',
  'exam.hideKeyboard': 'Hide keyboard',
  'exam.showKeys': 'Show keys',
  'exam.showStats': 'Show stats',
  'exam.hideStats': 'Hide stats',
  'exam.typeHere': 'Start typing here…',
  'exam.typeHereRoman': 'Type in Roman — e.g. namaste',
  'exam.typeHereLayout': 'Type using the {layout} layout',
  'exam.inputLabel': 'Type the passage here',
  'exam.passageRegion': 'Passage to type',

  // Live stats
  'stats.liveWpm': 'Live WPM',
  'stats.accuracy': 'Accuracy',
  'stats.errors': 'Errors',
  'stats.progress': 'Progress',
  'stats.words': 'Words',
  'stats.blocked': 'Blocked keys',
  'stats.target': 'target {value}',
  'stats.corrections': 'Corrections',
  'stats.characters': 'Characters',

  // Briefing and reading time
  'briefing.heading': 'Instructions',
  'briefing.duration': 'Duration',
  'briefing.readingTime': 'Reading time',
  'briefing.speedCutoff': 'Speed cut-off',
  'briefing.accuracyCutoff': 'Accuracy cut-off',
  'briefing.allowed': 'Allowed during the test',
  'briefing.notGraded': 'Not graded',
  'briefing.none': 'None',
  'briefing.beginReading': 'Begin reading time',
  'briefing.beginTest': 'Begin test',
  'briefing.backspace': 'Backspace / Delete',
  'briefing.space': 'Space bar',
  'briefing.enter': 'Enter / new line',
  'briefing.paste': 'Paste',
  'reading.banner': 'Reading time — the clock starts when you begin typing.',
  'reading.startNow': 'Start now',

  // Paper mode
  'paper.heading': 'Type from your paper',
  'paper.body':
    'There is no passage on screen — read from the sheet in front of you and type it below. The clock started with your first keystroke.',
  'paper.scoredOn': 'Scored on',
  'paper.checkedLater':
    'Spelling and grammar are checked when you submit — there is no passage to compare against as you type.',

  // Results
  'result.title': 'Result',
  'result.mistakes': 'Mistakes',
  'result.replay': 'Replay',
  'result.newTest': 'New test',
  'result.viewHistory': 'View history',
  'result.print': 'Print',
  'result.share': 'Share',
  'result.cutoff': 'Cut-off',
  'result.speed': 'Speed',
  'result.needs': 'needs {value}',
  'result.fasterThan':
    'Faster than {percent}% of your {count} earlier attempts.',

  // Setup
  'setup.title': 'Exam Setup',
  'setup.examProfile': 'Exam profile',
  'setup.language': 'Language',
  'setup.difficulty': 'Difficulty',
  'setup.mode': 'Mode',
  'setup.timing': 'Timing',
  'setup.countdown': 'Countdown',
  'setup.stopwatch': 'Stopwatch',
  'setup.duration': 'Duration (minutes)',
  'setup.behaviour': 'Behavior',
  'setup.mockExam': 'Mock exam',
  'setup.startExam': 'Start exam',
  'setup.or': 'or',
  'setup.minutes': 'min',

  // Landing
  'landing.getStarted': 'Get started',
  'landing.yourName': 'Your name',
  'landing.email': 'Email',
  'landing.optional': 'Optional',
  'landing.startPractising': 'Start practising',
  'landing.worksOffline': 'Works offline',

  // Shared
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.loading': 'Loading…',
} as const;

export type TKey = keyof typeof en;
