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

  // Enum labels. The maps in core/constants stay as the English source for
  // *data* (stored run titles); these are what the interface shows.
  'lang.eng': 'English',
  'lang.hin': 'Hindi',
  'lang.mar': 'Marathi',
  'lang.ben': 'Bengali',
  'lang.tam': 'Tamil',
  'lang.guj': 'Gujarati',

  'difficulty.easy': 'Easy',
  'difficulty.normal': 'Normal',
  'difficulty.hard': 'Hard',

  'examMode.standard': 'Standard',
  'examMode.blind': 'Blind',
  'examMode.error_free': 'Error-free',
  'examMode.accuracy': 'Accuracy',
  'examMode.speed': 'Speed',

  'timing.countdown': 'Countdown',
  'timing.stopwatch': 'Stopwatch',

  'practice.words': 'Common words',
  'practice.capitals': 'Capital letters',
  'practice.numbers': 'Numbers',
  'practice.symbols': 'Special characters',
  'practice.punctuation': 'Punctuation',
  'practice.home_row': 'Home row',
  'practice.top_row': 'Top row',
  'practice.bottom_row': 'Bottom row',
  'practice.all_rows': 'All rows',
  'practice.numpad': 'Numpad',
  'practice.shortcuts': 'Keyboard shortcuts',
  'practice.sentences': 'Sentences',

  'category.missing_char': 'Missing character',
  'category.extra_char': 'Extra character',
  'category.wrong_char': 'Wrong character',
  'category.wrong_word': 'Wrong word',
  'category.missing_word': 'Missing word',
  'category.extra_word': 'Extra word',
  'category.capitalization': 'Capitalization',
  'category.punctuation': 'Punctuation mark',

  'inputMethod.qwerty': 'Standard (QWERTY)',
  'inputMethod.phonetic': 'Phonetic (type in Roman)',
  'inputMethod.inscript': 'InScript (BIS / Unicode)',
  'inputMethod.remington': 'Remington GAIL (typewriter)',

  'hindiFont.system': 'System default',
  'hindiFont.mangal': 'Mangal (Unicode)',
  'hindiFont.krutidev': 'Kruti Dev (legacy)',
  'hindiFont.custom': 'Custom (uploaded)',

  'grammarMode.off': 'Off',
  'grammarMode.offline': 'Mode 1 · On-device (offline)',
  'grammarMode.ai': 'Mode 2 · AI-powered (cloud)',

  'spellEngine.off': 'Off',
  'spellEngine.builtin': 'Built-in (nspell) · recommended',
  'spellEngine.symspell': 'Fuzzy match (low-memory)',

  'sourceType.image': 'Image',
  'sourceType.pdf': 'PDF',
  'sourceType.docx': 'Document',
  'sourceType.text': 'Text',

  // Exam setup
  'setup.source': 'Source: {source}',
  'setup.target': ' · target {wpm} WPM, {accuracy}% accuracy',
  'setup.guestCap':
    'Up to {minutes} minutes — add your email in Settings for full-length mock exams.',
  'setup.fullCap': 'Custom duration up to {minutes} minutes.',
  'setup.allowBackspace': 'Backspace / Delete',
  'setup.allowBackspaceHint': 'Allow correcting mistakes during the test.',
  'setup.allowSpace': 'Space key',
  'setup.allowSpaceHint': 'Allow the space bar (disable for continuous-script drills).',
  'setup.allowEnter': 'Enter key',
  'setup.allowEnterHint': 'Allow new lines / paragraph breaks.',
  'setup.examLock': 'Exam lock',
  'setup.examLockHint': 'Keeps the screen awake; leaving the tab prompts to submit the test.',
  'setup.briefingToggle': 'Instructions before the test',
  'setup.briefingHint': 'Open with the rules and cut-off, the way a real skill test does.',
  'setup.examDayToggle': 'Exam-day mode',
  'setup.examDayHint': 'Hides the app around the test, holds notifications and disables pausing.',
  'setup.readingLabel': 'Reading time',
  'setup.readingHint': 'min before the clock starts (0 = none)',
  'setup.ghostTitle': 'Race a past run',
  'setup.ghostNone': 'No ghost',
  'setup.ghostHint':
    "Shows that run's progress live beside yours, so you can see the gap as you type.",
  'setup.paperTitle': 'Paper test',
  'setup.paperBody':
    'No passage on screen — read from your sheet. Scored on words, speed, corrections and, at the end, spelling and grammar. There is nothing to compare against, so Error-free mode and the ghost race do not apply.',
  'setup.partOf': '{title} · part {index} of {total}',
  'setup.partHint': 'Finishing this part starts the next one automatically.',

  // Progress
  'progress.title': 'Progress',
  'progress.subtitle': 'Personal bests, streaks, and your recent speed trend.',
  'progress.empty': 'No results yet. Finish a test and your progress shows up here.',
  'progress.bestWpm': 'Best net WPM',
  'progress.avgWpm': 'Average net WPM',
  'progress.avgAccuracy': 'Average accuracy',
  'progress.passRate': 'Pass rate',
  'progress.dailyGoal': 'Daily goal',
  'progress.today': 'Today',
  'progress.thisWeek': 'This week',
  'progress.thisMonth': 'This month',
  'progress.totalTests': 'Total tests',
  'progress.points': 'Reward points',
  'progress.streakDays': '{count}-day streak',
  'progress.recentTrend': 'Recent speed trend',
  'progress.topRuns': 'Your best runs',
  'progress.badges': 'Achievements',
  'progress.locked': 'Locked',

  // Library
  'library.title': 'Library',
  'library.subtitle': 'Every paragraph you have saved, and how you have done on each.',
  'library.empty': 'No paragraphs yet. Create one to build your library.',
  'library.newTest': 'New Test',
  'library.series': 'Practice series',
  'library.seriesPick': 'Tick paragraphs to pick, or run all {count} back-to-back.',
  'library.seriesSelected': '{count} selected · runs in this order, auto-advancing',
  'library.order': 'Series order',
  'library.serial': 'Serial',
  'library.serialHint': 'In the order shown',
  'library.preference': 'Preference',
  'library.preferenceHint': 'Shortest first',
  'library.clear': 'Clear',
  'library.startAll': 'Start all',
  'library.startN': 'Start {count}',
  'library.colTitle': 'Paragraph',
  'library.colLang': 'Language',
  'library.colChars': 'Chars',
  'library.colTries': 'Tries',
  'library.colBest': 'Best',
  'library.long': 'Long',
  'library.longHint': 'Long enough to split into shorter sittings — open the row to cut it up',
  'library.partsDone': '{done}% of the parts finished',
  'library.retest': 'Retest',
  'library.start': 'Start',
  'library.runAgain': 'Run again',
  'library.useForTest': 'Use for a test',
  'library.deleteOne': 'Delete {title}',
  'library.deleteHint': 'Delete this paragraph',
  'library.deleteTitle': 'Delete "{title}"?',
  'library.deleteBody':
    'The paragraph is removed from your library. Past results keep their scores, but can no longer be retested or replayed.',
  'library.leaderboard': 'Leaderboard',
  'library.noAttempts': 'No attempts yet — be the first to set a score.',
  'library.moveUp': 'Move up',
  'library.moveDown': 'Move down',
  'library.remove': 'Remove',

  // History
  'history.title': 'History',
  'history.progressHeading': 'Progress — how much you improved',
  'history.empty': 'No tests yet. Take your first test!',
  'history.colDate': 'Date',
  'history.colExam': 'Exam',
  'history.colNetWpm': 'Net WPM',
  'history.colAccuracy': 'Accuracy',
  'history.colErrors': 'Errors',
  'history.colStatus': 'Status',
  'history.replayHint': 'Watch this attempt play back',

  // Lessons
  'lessons.title': 'Lessons',
  'lessons.subtitle': 'Work through the curriculum. Each lesson unlocks when you hit its targets.',
  'lessons.locked': 'Finish the previous lesson to unlock this one',
  'lessons.done': 'Done',
  'lessons.start': 'Start',
  'lessons.target': 'Target {wpm} WPM · {accuracy}%',
  'lessons.custom': 'Your own lessons',
  'lessons.customHint': 'Turn any text into a lesson with its own targets.',
  'lessons.addCustom': 'Add a lesson',
  'lessons.noCustom': 'No custom lessons yet.',
  'lessons.deleteCustom': 'Delete lesson',

  // Practice
  'practice.title': 'Practice drills',
  'practice.subtitle':
    'Targeted exercises for weak areas. Each generates a fresh passage using your current settings.',

  // Trainer
  'trainer.title': 'Trainer',
  'trainer.subtitle':
    'Targeted practice generated from your own results — what you get wrong, and what slows you down.',
  'trainer.focus': 'Drill focus',
  'trainer.accuracy': 'Accuracy',
  'trainer.accuracyHint': 'Keys and words you get wrong',
  'trainer.speed': 'Speed',
  'trainer.speedHint': 'Keys and transitions that cost you time',
  'trainer.startTargeted': 'Start targeted drill',
  'trainer.startRhythm': 'Start rhythm drill',
  'trainer.noMistakes':
    'No mistakes recorded yet. Take a few tests and your weak spots will show up here.',
  'trainer.heatmap': 'Weak-key heatmap',
  'trainer.confused': 'Most-confused keys',
  'trainer.missedWords': 'Most-missed words',
  'trainer.rhythm': 'Rhythm',
  'trainer.consistency': 'Consistency',
  'trainer.consistencyHint':
    'How even your keystroke timing is. Bursts followed by stalls read low here — steady beats fast-then-stuck at the same average speed.',
  'trainer.beat': '{ms} ms between keys · {cpm} CPM at full flow',
  'trainer.slowestKeys': 'Slowest keys',
  'trainer.perFinger': 'Time per finger',
  'trainer.perFingerHint':
    'Mean time-to-press by finger. A slow pinky or ring finger usually means the hand is leaving the home row to reach.',
  'trainer.slowestPairs': 'Slowest transitions',
  'trainer.slowestPairsHint':
    'Pairs of characters your hands hesitate between. These are what a rhythm drill fixes.',
  'trainer.noTiming': 'No timing data yet. Finish a test and your per-key speed shows up here.',
  'trainer.msToPress': '{ms} ms to press',
  'trainer.errorCount': '{count} errors',
  'trainer.errorCountOne': '1 error',
  'trainer.noErrors': 'no errors',
  'trainer.notMeasured': 'not measured',

  'practiceDesc.home_row': 'Anchor the a-s-d-f / j-k-l-; keys.',
  'practiceDesc.top_row': 'Reach up to q-w-e-r-t / y-u-i-o-p.',
  'practiceDesc.bottom_row': 'Reach down to z-x-c-v-b / n-m keys.',
  'practiceDesc.all_rows': 'Finger ladders across all three rows.',
  'practiceDesc.words': 'Frequent English words to build flow.',
  'practiceDesc.sentences': 'Full sentences with real rhythm.',
  'practiceDesc.capitals': 'Shift for Title, ALL CAPS and CamelCase.',
  'practiceDesc.numbers': 'Number-row and numeric accuracy.',
  'practiceDesc.numpad': 'Digits, decimals and + - * / operators.',
  'practiceDesc.symbols': 'Special characters and symbols.',
  'practiceDesc.punctuation': 'Commas, periods, and marks.',
  'practiceDesc.shortcuts': 'Real editor shortcuts for your OS.',

  'progress.emptyLong': 'No tests yet. Take a test to start tracking progress.',
  'progress.dayStreak': 'Day streak',
  'progress.testsTaken': 'Tests taken',
  'progress.recentSpeed': 'Recent speed (Net WPM)',
  'progress.goalCount': '{done} / {goal} tests',
  'progress.goalDone': 'Goal reached today — nice work! 🎉',
  'progress.goalLeft': "{count} more to hit today's goal.",
  'progress.challenges': 'Challenges',
  'progress.badgesTitle': 'Achievements',
  'progress.topRunsTitle': 'Top runs',

  // Achievements. Copy lives here so core only decides what is earned.
  'badge.first': 'First steps',
  'badge.first.desc': 'Complete your first test',
  'badge.ten': 'Getting warm',
  'badge.ten.desc': 'Complete 10 tests',
  'badge.fifty': 'Dedicated',
  'badge.fifty.desc': 'Complete 50 tests',
  'badge.pass': 'Qualified',
  'badge.pass.desc': 'Pass a test',
  'badge.wpm30': '30 WPM',
  'badge.wpm30.desc': 'Reach 30 net WPM',
  'badge.wpm50': '50 WPM',
  'badge.wpm50.desc': 'Reach 50 net WPM',
  'badge.wpm70': 'Speedster',
  'badge.wpm70.desc': 'Reach 70 net WPM',
  'badge.perfect': 'Flawless',
  'badge.perfect.desc': 'Finish with 100% accuracy',
  'badge.streak3': 'On a roll',
  'badge.streak3.desc': '3-day practice streak',
  'badge.streak7': 'Unstoppable',
  'badge.streak7.desc': '7-day practice streak',
  'badge.newOne': '🏅 New achievement:',
  'badge.newMany': '🏅 New achievements:',
  'badge.goalHit': '🎯 Daily goal reached — great consistency!',

  'setup.partsApply': 'These settings apply to every part.',
  'setup.partsRemaining':
    'The {count} remaining passages run back-to-back, and each one you finish is remembered.',
  'setup.partsLast': 'This is the last passage in the document.',

  // Lessons
  'lessons.subtitleLong':
    "A beginner-to-advanced path. Hit each lesson's speed and accuracy target to unlock the next.",
  'lessons.addNew': 'Add new lesson',
  'lessons.curriculumProgress': 'Curriculum progress',
  'lessons.countOf': '{done} / {total} lessons',
  'lessons.yourLessons': 'Your lessons',
  'lessons.authorHint':
    'Author your own drill from any text — your own passage, a syllabus paragraph, or exam material. Pick a category and targets, then practice it like any lesson.',
  'lessons.namePlaceholder': 'Lesson name',
  'lessons.passagePlaceholder': 'Paste or type the passage to practice…',
  'lessons.category': 'Category',
  'lessons.targetWpm': 'Target WPM',
  'lessons.targetAccuracy': 'Target accuracy %',
  'lessons.addLesson': 'Add lesson',
  'lessons.targetLine': 'Target {wpm} WPM · {accuracy}%',

  'skill.beginner': 'Beginner',
  'skill.intermediate': 'Intermediate',
  'skill.advanced': 'Advanced',

  // Result summary
  'summary.originalSpeed': 'Original speed',
  'summary.netSpeed': 'Net speed',
  'summary.grossWpm': 'Gross WPM',
  'summary.time': 'Time',
  'summary.characters': 'Characters',
  'summary.correctWords': 'Correct words',
  'summary.wrongWords': 'Wrong words',
  'summary.correctChars': 'Correct chars',
  'summary.incorrectChars': 'Incorrect chars',
  'summary.backspaces': 'Backspaces',
  'summary.deletes': 'Deletes',
  'summary.readResult': 'Read result',

  // Mistake list
  'mistakes.none': 'No mistakes — perfect run! 🎉',
  'mistakes.youTyped': 'You typed',
  'mistakes.expected': 'Expected',
  'mistakes.type': 'Type',

  // Charts
  'chart.noTimeline': 'No timeline data for this test.',
  'chart.perMinute': 'Per-minute WPM and accuracy',
  'chart.title': 'Speed & accuracy over time',

  // Settings
  'settings.title': 'Settings',
  'settings.interfaceLanguage': 'Interface language',
  'settings.interfaceHint': 'The language of the app itself. Passage language is chosen per test.',
  'settings.defaultLanguage': 'Default language',
  'settings.defaultProfile': 'Default exam profile',
  'settings.defaultDifficulty': 'Default difficulty',
  'settings.inputMethod': 'Devanagari input method',
  'settings.inputMethodHint':
    'Phonetic lets you type in Roman (e.g. namaste → नमस्ते). InScript remaps the keyboard to the government-standard Devanagari layout, Remington GAIL to the typewriter layout. All apply to Hindi and Marathi tests.',
  'settings.layoutMissing': ' — layout data not installed',
  'settings.font': 'Devanagari font',
  'settings.uploadFont': 'Upload font (.ttf/.otf)',
  'settings.fontHint':
    'Pick a font above, then upload its .ttf/.otf if it isn’t installed. Kruti Dev also relabels the on-screen keyboard. Fonts persist in the app store and travel with backups.',
  'settings.behaviour': 'Default test behavior',
  'settings.onScreenKeyboard': 'On-screen keyboard',
  'settings.onScreenKeyboardHint':
    'Show a color-coded keyboard that highlights the next key and finger.',
  'settings.dailyGoal': 'Daily goal',
  'settings.dailyGoalHint': 'Tests to complete each day.',
  'settings.dailyGoalAria': 'Daily goal in tests',
  'settings.feedback': 'Notifications & feedback',
  'settings.notifications': 'Desktop notifications',
  'settings.notificationsHint': 'Alert when a test finishes, time runs out, or you go idle/away.',
  'settings.noNotifications': 'This browser does not support notifications.',
  'settings.sounds': 'Typing sounds',
  'settings.soundsHint': 'Subtle key clicks, an error tone, and a chime when a test ends.',
  'settings.reminder': 'Practice reminder',
  'settings.reminderHint': "A daily nudge at a set time if you haven't practiced yet.",
  'settings.reminderTime': 'Reminder time',
  'settings.reminderTimeHint': 'When to nudge you each day.',
  'settings.reminderBlocked':
    'Notifications are blocked for Typly, so the reminder cannot pop up.',
  'settings.reminderUnsupported': 'This browser has no notification support.',
  'settings.reminderNotYet': 'Notifications are not allowed yet.',
  'settings.reminderFallbackTray':
    'The reminder still works: the tray icon shows practice as pending until you finish a test.',
  'settings.reminderFallbackTab':
    'The reminder still works: the browser tab shows practice as pending until you finish a test.',
  'settings.reminderHowToAllow':
    'To get pop-ups too, allow notifications for this app in your browser or system settings.',
  'settings.reminderMissedTray':
    'Miss it and Typly keeps asking: {minutes} minutes later you get a second notification, and the tray icon shows practice as pending until you finish a test.',
  'settings.reminderMissedTab':
    'Miss it and Typly keeps asking: {minutes} minutes later you get a second notification, and the browser tab shows practice as pending until you finish a test.',
  'settings.backup': 'Backup & restore',
  'settings.backupHint':
    'Export your history and library to a JSON file, or restore from one. Restoring merges into your current data.',
  'settings.export': 'Export backup',
  'settings.exporting': 'Exporting…',
  'settings.restore': 'Restore backup',
  'settings.restoring': 'Restoring…',
  'settings.nothingToExport': 'Nothing to export yet — take a test first.',

  // Profile card
  'profile.title': 'Your profile',
  'profile.hint': 'Stored on this device only. Nothing is uploaded.',
  'profile.name': 'Name',
  'profile.namePlaceholder': 'Your name',
  'profile.email': 'Email',
  'profile.emailPlaceholder': 'you@example.com',
  'profile.unlocked': 'Unlocked with your email',
  'profile.locked': 'Add an email to unlock',
  'profile.perkSessions': 'Sessions longer than {short} minutes — up to {long}',
  'profile.perkCertificate': 'Saving your certificate as an image',
  'profile.perkExport': 'Exporting your progress report',
  'profile.save': 'Save profile',
  'profile.saved': 'Saved',

  'settings.fontLoaded': 'Loaded {file} for {slot}',
  'settings.fontFailed': 'Could not load that font file.',

  // Detected-text panel
  'text.detected': 'Text detected',
  'text.words': 'Words',
  'text.characters': 'Characters',
  'text.noSpaces': 'No spaces',
  'text.spaces': 'Spaces',
  'text.fullStops': 'Full stops',
  'text.sentences': 'Sentences',
  'text.lines': 'Lines',
  'text.paragraphs': 'Paragraphs',
  'text.digits': 'Digits',
  'text.punctuation': 'Punctuation',
  'text.capitals': 'Capitals',
  'text.avgWord': 'Avg word',
  'text.replace': 'Replace',

  // Paper mode entry
  'paperCard.title': 'Typing from paper?',
  'paperCard.body':
    'Read from a printed sheet or a book and type here. Nothing to upload — you get speed, word count, corrections, and spelling and grammar checked at the end.',
  'paperCard.start': 'Start a paper test',
  'paperCard.dashTitle': 'Typing from paper?',
  'paperCard.dashDesc': 'Read from a printed sheet and type here — nothing to upload.',

  // Sample + resume cards
  'sample.title': 'Try it with the sample paragraph',
  'sample.body':
    '{title} · {chars} characters. Nothing to import — pick an exam profile and start typing.',
  'sample.start': 'Start demo test',
  'resume.title': 'Unfinished test',
  'resume.left': '{title} · left {ago}',
  'resume.resume': 'Resume',
  'resume.discard': 'Discard',
  'resume.typedOf': '{typed} of {total} characters typed',

  // Ghost race
  'ghost.title': 'Ghost race',
  'ghost.you': 'You',
  'ghost.best': 'Best · {wpm} WPM',
  'ghost.chars': '{value} chars',

  // Replay player
  'replay.play': 'Play',
  'replay.pause': 'Pause',
  'replay.again': 'Replay',
  'replay.backToStart': 'Back to start',
  'replay.position': 'Replay position',
  'replay.speed': 'Replay speed',
  'replay.close': 'Close replay',
  'replay.none': 'No keystroke log was recorded for this attempt, so it cannot be replayed.',
  'replay.noPassage':
    'The paragraph for this attempt is no longer in your library, so it cannot be replayed.',
  'replay.summary': '{wpm} net WPM · {accuracy}% accuracy',

  // Paper report
  'paperReport.title': 'Spelling & grammar',
  'paperReport.wordsTyped': '{words} words typed from your paper',
  'paperReport.notChecked':
    'No dictionary was available for this language, so spelling was not checked. Speed, words and corrections above are unaffected.',
  'paperReport.clean':
    'Nothing flagged — every word was in the dictionary and the grammar check found no issues.',
  'paperReport.notInDictionary': 'Words not in the dictionary ({count})',
  'paperReport.properNouns':
    'Proper nouns and technical terms show up here too — the dictionary does not know everything on your sheet.',
  'paperReport.grammar': 'Grammar ({count})',
  'paperReport.andMore': '…and {count} more.',
  'paperReport.whatYouTyped': 'What you typed',

  // Tour
  'tour.step': 'Step {current} of {total}',
  'tour.skip': 'Skip',
  'tour.skipAria': 'Skip the tour',
  'tour.back': 'Back',
  'tour.next': 'Next',
  'tour.gotIt': 'Got it',
  'tour.newTitle': 'Start with a passage',
  'tour.newBody':
    'Paste text, or drop in an image, PDF or document — OCR runs on your machine. That becomes your typing test.',
  'tour.trainerTitle': 'Drill your weak spots',
  'tour.trainerBody':
    'After a few tests, the Trainer builds drills from your own results: the keys you get wrong, and the transitions that cost you time.',
  'tour.historyTitle': 'Watch it improve',
  'tour.historyBody':
    'Every attempt is saved with its mistakes and a full replay, so you can see exactly where the time went.',

  // Confirm dialog
  'confirm.confirm': 'Confirm',
  'confirm.armed': 'Yes, {action}',
  'confirm.armedHint': 'This can’t be undone — press again to confirm.',

  // Uploader
  'upload.paste': 'Paste a paragraph',
  'upload.pastePlaceholder': 'Paste text here…',
  'upload.usePasted': 'Use pasted text',
  'upload.wordsChars': '{words} words · {chars} characters',
  'upload.orUpload': 'or upload a file',
  'upload.dropHere': 'Drag & drop a file here, or choose one:',
  'upload.formats': 'PNG · JPG · WebP · PDF · DOCX · TXT',
  'upload.image': 'Image',
  'upload.readingImage': 'Reading image (OCR)',
  'upload.readingPdf': 'Reading PDF',
  'upload.readingDoc': 'Reading document',
  'upload.verifyingAi': 'Verifying with AI…',
  'upload.rereading': 'Re-reading the image…',
  'upload.aiSkipped': 'AI verification skipped',
  'upload.onDeviceReady': 'The on-device (Tesseract) text is ready to use.',
  'upload.continueOnDevice': 'Continue with on-device text',
  'upload.retryAi': 'Retry AI',
  'upload.elapsed': 'Elapsed {time}',
  'upload.eta': 'ETA ~{time}',
  'upload.preparing': 'Preparing…',
  'upload.aiSlow': 'AI reading can take a minute or two — please keep this open. {seconds}s elapsed.',
  'upload.secondsElapsed': '{seconds}s elapsed.',
  'upload.dismiss': 'Dismiss',
  'upload.errImage':
    "Couldn't read text from that file. Try a clearer, high-contrast image, switch the OCR language — or just paste the text / upload a PDF instead.",
  'upload.errFile': "Couldn't read that file. Please paste the text, or try a different file.",
  'upload.errText': "Couldn't read that text file. Try pasting the text instead.",
  'upload.errUnsupported': 'Unsupported file. Drop an image, PDF, .docx or .txt — or paste text.',

  // OCR review
  'ocr.verify': 'Verify extracted text',
  'ocr.keepSelected': 'Continuing keeps the selected one; the rest are discarded.',
  'ocr.quickPick': 'Quick pick:',
  'ocr.finalText': 'Final text',
  'ocr.continue': 'Continue',
  'ocr.cancel': 'Cancel',

  // AI settings
  'ai.title': 'AI features',
  'ai.enable': 'Enable AI features',
  'ai.enableHint':
    'When off, the app uses only the built-in offline pipeline — on-device OCR and grammar, and the AI coach is hidden.',
  'ai.provider': 'Provider',
  'ai.model': 'Coach & grammar model',
  'ai.visionModel': 'Vision model (image OCR)',
  'ai.apiKey': 'API key',
  'ai.baseUrl': 'Base URL (optional)',
  'ai.providerDefault': 'Provider default',
  'ai.custom': 'Custom…',

  // Language tools
  'tools.title': 'Language tools',
  'tools.grammar': 'Grammar checker',
  'tools.spell': 'Spell check engine',

  // Appearance
  'theme.title': 'Appearance',
  'theme.colourTheme': 'Colour theme',
  'theme.accent': 'Accent colour',

  // Storage
  'storage.title': 'Storage & language data',

  // Grammar panel
  'grammar.title': 'Grammar & spelling',

  // Progress chart
  'chart.needTwo': 'Take at least two tests to compare your progress.',
  'chart.firstTest': 'First test',
  'chart.latestTest': 'Latest test',
  'chart.testsTaken': 'Tests taken',
  'chart.bestWpm': 'Best WPM',
  'chart.averageWpm': 'Average WPM',
  'chart.latestAccuracy': 'Latest accuracy',
  'chart.acrossTests': 'Net WPM and accuracy across tests',

  // Coach
  'coach.title': 'AI coach',
  'coach.weakness': 'Main weakness',
  'coach.keys': 'Keys to practice',
  'coach.exercise': 'Practice exercise',
  'coach.goal': 'Next goal',

  // Certificate
  'certificate.title': 'Certificate',
  'certificate.ready': 'You passed — here is a shareable certificate.',
  'certificate.locked': 'You passed. Add your email in Settings to download it as an image.',
  'certificate.nameAria': 'Name on the certificate',
  'certificate.download': 'Download certificate',

  // Dashboard action cards + how-it-works
  'dashboard.howItWorks': 'How it works',
  'dashboard.step1': 'Add a passage',
  'dashboard.step1Desc': 'Paste text, or drop an image, PDF or .docx.',
  'dashboard.step2': 'Pick the exam',
  'dashboard.step2Desc': 'Choose the board, duration and language.',
  'dashboard.step3': 'Type & review',
  'dashboard.step3Desc': 'WPM, accuracy, and every mistake categorised.',
  'dashboard.newTestTitle': 'Start a new test',
  'dashboard.newTestDesc': 'Paste text or upload an image / PDF / document.',
  'dashboard.practiceTitle': 'Practice drills',
  'dashboard.practiceDesc': 'Rows, numbers, symbols and shortcuts, generated fresh.',

  // Landing extras
  'landing.subtitle':
    'No sign-up, no setup. Just your name, so the app knows who it is coaching — your results stay on this device.',
  'landing.nameHint': 'Shown on your dashboard and printed on certificates.',
  'landing.emailHint':
    'Unlocks long sessions, certificate downloads and progress exports. Stored on this device only — nothing is sent.',
  'landing.nameError': 'Please enter at least two characters.',
  'landing.emailError': 'That does not look like an email address.',
  'landing.signInEmail': 'Sign in with email',
  'landing.soon': 'Soon',
  'landing.privacy':
    'Accounts, cloud sync and subscriptions arrive with the backend. Nothing is uploaded today.',

  // Results extras
  'result.nextIn': 'Next test starts in {seconds}s…',
  'result.startNow': 'Start now',
  'result.stopSeries': 'Stop series',
  'result.printHeading': 'Typly — Typing Result',
  'result.seriesOf': 'Series · test {current} of {total}',
  'result.shareText': 'I scored {wpm} net WPM at {accuracy}% accuracy on Typly.',
  'result.copied': 'Copied to clipboard',

  // Split panel
  'split.title': 'Split into passages',
  'split.length': 'Passage length',
  'split.split': 'Split',
  'split.recut': 'Re-cut at a different length:',
  'split.undo': 'Undo split',
  'split.partsCount': '{count} passages',
  'split.nextPart': 'Next: part {index}',

  // New Test
  'newTest.title': 'New Test',
  'newTest.subtitleEmpty':
    'Paste or upload a paragraph, then choose the exam type and language next. Emoji are removed automatically.',
  'newTest.subtitleReady': 'Review what was detected, then choose the exam type and language next.',
  'newTest.paragraphName': 'Paragraph name',
  'newTest.paragraphTitle': 'Paragraph title',
  'newTest.listen': 'Listen',
  'newTest.showText': 'Show & edit text',
  'newTest.hideText': 'Hide text',
  'newTest.required': 'Paragraph text is required to continue.',
  'newTest.saveContinue': 'Save & continue',
  'newTest.saving': 'Saving…',

  // Small controls
  'zoom.out': 'Zoom out',
  'zoom.in': 'Zoom in',
  'zoom.reset': 'Reset text size',
  'exam.layoutAria': 'Exam layout',
  'exam.split': 'Split',
  'exam.stacked': 'Stacked',
  'exam.blockedHint': 'Keys the exam rules refused',
  'exam.resumedHint': 'Restored from where you left off',
  'setup.durationAria': 'Custom duration in minutes',
  'setup.readingAria': 'Reading time in minutes',
  'coach.analyzing': 'Analyzing…',
  'coach.tips': 'Tips',
  'grammar.noIssues': 'No issues found.',
  'grammar.firstRun':
    'The on-device grammar model downloads once (a few MB) — the first check can take a moment.',
  'ocr.scanAgain': 'Scan again',
  'ocr.useThis': 'Use this text',
  'about.builtBy': 'Built by',
  'about.close': 'Close about',
  'storage.clearAll': 'Clear all app data',
  'progress.challengeDone': 'Challenge complete 🎉',
  'library.subtitleShort': 'Your saved paragraphs. Run, retest, and compare attempts on a leaderboard.',
  'common.loadingPage': 'Loading page',
  'common.restoringSession': 'Restoring session',
  'common.restoringTest': 'Restoring your test',
  'chart.netWpm': 'Net WPM',
  'chart.accuracyPct': 'Accuracy %',

  'storage.clearTitle': 'Clear all app data?',
  'storage.clearBody':
    'Deletes your history, library, settings and downloaded language data. This cannot be undone.',
  'storage.clearConfirm': 'Clear everything',
  'newTest.saveSplit': 'Save & split into {count}',

  'result.fasterThanOne': 'Faster than {percent}% of your 1 earlier attempt.',
  'result.replayHint':
    'Watch the attempt back to see where the time went, not just where the errors were.',
  'ai.visionHint':
    "Reads text from uploaded images. NVIDIA's Llama-3.2 vision models are free.",
  'lessons.practice': 'Practice',
  'coach.settingsLink': 'Settings',
  'chart.speed': 'speed',
  'chart.accuracyWord': 'accuracy',
  'landing.headline1': 'Practice the exam,',
  'landing.headline2': 'not just typing.',
  'landing.blurb':
    'Turn any image, PDF or paragraph into a realistic government-exam typing test — then see exactly which mistakes cost you the cut-off.',
  'landing.liveScoring': 'Live scoring',
  'chart.peak': 'peak {value}',

  'ai.keyHint':
    'Bring your own key — stored locally on this device and sent only to the AI provider. Optional: without a key the app runs normally, just with the AI extras (coach, AI grammar, image OCR) turned off.',
  'ai.show': 'Show',
  'ai.hide': 'Hide',
  'brand.tagline': 'Exam practice',

  'setup.modeAria': 'Exam mode',
  'setup.timingAria': 'Timing mode',
  'setup.difficultyAria': 'Difficulty',

  // New drills
  'practice.bigrams': 'Tricky letter pairs',
  'practice.alternating': 'Alternating hands',
  'practice.same_finger': 'Same-finger jumps',
  'practice.long_words': 'Long words',
  'practice.mixed': 'Everything at once',
  'practiceDesc.bigrams': 'The pairs English typists stumble on: th, qu, ck, str.',
  'practiceDesc.alternating': 'Words that switch hands every keystroke — where speed comes from.',
  'practiceDesc.same_finger': 'The slowest motion on a keyboard: the same finger, twice.',
  'practiceDesc.long_words': 'Long words, where one wrong letter costs the whole word.',
  'practiceDesc.mixed': 'Words, figures, marks and symbols in one stream, like a real passage.',

  // Drill difficulty chip
  'drill.easy': 'Easy',
  'drill.medium': 'Medium',
  'drill.hard': 'Hard',
  'drill.veryHard': 'Very hard',

  // Release notes
  'whatsNew.title': "What's new",
  'whatsNew.lead': 'Everything added since you were last here.',
  'whatsNew.version': 'Version {version}',
  'whatsNew.dontShow': "Don't show this again",
  'whatsNew.close': 'Close',

  // Changelog lines, newest release first (see i18n/changelog.ts)
  'changelog.countdown':
    'Set your exam date and see whether your current rate of improvement clears the cut-off in time — the daily reminder now says so too.',
  'changelog.deviceSync':
    'Sync to another device over your own Wi-Fi by scanning a code — no account, no server.',
  'changelog.splash':
    'A launch screen with a progress bar, so the app says something the moment you open it.',
  'changelog.trayReminder':
    'The tray menu shows when the daily reminder is due, and lets you skip just today.',
  'changelog.loginItem': 'Open at login, so the reminder can reach you without opening the app first.',
  'changelog.dnd': 'Do not disturb: hold every notification, from Settings or the tray.',
  'changelog.sidebarLanguage': 'Switch the interface language straight from the sidebar.',
  'changelog.icons':
    'Proper icons everywhere: the installer, the uninstaller, the full Linux icon set, and the tray in brand colour on every platform.',
  'changelog.whatsNew': 'This panel — what changed in each release, reachable from About.',
  'changelog.hindi': 'The whole interface in Hindi, chosen in Settings.',
  'changelog.paperMode':
    'Paper mode: type from a printed passage and still get words, errors and spelling checked.',
  'changelog.examDay': 'Exam-day mode: no sidebar, no notifications, no pausing.',
  'changelog.profile': 'Your name on the dashboard, with a greeting that follows the clock.',
  'changelog.splitter':
    'Long documents split into parts, and every attempt picks up where you left off.',
  'changelog.lessons': '31 lessons, from the home row to the 55 WPM court standard.',
  'changelog.drills': '17 practice drills, each marked easy through very hard.',
  'changelog.timestamps': 'Every date and time reads the same way, with am/pm and seconds.',
  'changelog.accessibility': 'A keyboard, screen-reader and reduced-motion pass over every screen.',
  'changelog.openWith': 'Open any text file, PDF or document with Typly and type it straight away.',
  'changelog.firstRelease': 'The first release: turn any image, PDF or paragraph into a typing test.',
  'changelog.examScoring': 'Scoring that matches the exam you are sitting, including its cut-off.',
  'changelog.mistakes': 'Every mistake listed, by word and by key.',
  'changelog.replay': 'Replays, to watch an attempt back keystroke by keystroke.',
  'changelog.offline': 'Works with no internet connection, and keeps your data on your device.',

  // Local-network device sync
  'sync.title': 'Sync to another device',
  'sync.lead':
    'Move your tests, paragraphs and settings to another device over the Wi-Fi you are both on. Nothing is uploaded — the two devices talk to each other directly.',
  'sync.start': 'Show pairing code',
  'sync.starting': 'Starting…',
  'sync.stop': 'Close pairing',
  'sync.scan': 'Scan this with the other device, or type the address into its browser.',
  'sync.qrLabel': 'QR code for the pairing link',
  'sync.closesIn': 'Closes in {minutes} min',
  'sync.closed': 'Pairing closed.',
  'sync.warning':
    'While pairing is open, anyone on this network who has the link can read this copy of your data.',
  'sync.desktopOnly': 'Pairing needs the desktop app — a browser tab cannot be connected to.',
  'sync.offline': 'No network was found. Join a Wi-Fi network and try again.',
  'sync.unavailable': 'Pairing could not be started.',
  'sync.received': 'Received {tests} tests and {documents} paragraphs from the other device.',
  'sync.receiveFailed': 'A backup arrived but could not be restored.',

  // Storage card
  'storage.using': 'Using ~{size}',
  'storage.hint':
    'Grammar and the spelling dictionaries download once and are kept on your device for offline use. Remove them any time to free space.',
  'storage.download': 'Download for offline',
  'storage.downloading': 'Downloading…',
  'storage.downloaded': 'Language data downloaded — grammar and spelling now work offline.',
  'storage.removeLang': 'Remove language data',
  'storage.removing': 'Removing…',
  'storage.removeTitle': 'Remove language data?',
  'storage.removeBody':
    'Deletes the downloaded grammar model and dictionaries. They will download again when needed.',
  'storage.removeConfirm': 'Remove',
  'storage.removed': 'Downloaded language data removed.',

  // Backup results
  'settings.exportedCount': 'Exported {tests} tests and {documents} paragraphs.',
  'settings.restoredCount': 'Restored {tests} tests and {documents} paragraphs.',
  'settings.restoreFailed': 'Could not restore: {error}',
  'settings.notABackup': 'not a Typly backup file',

  // Notifications
  'notify.timeUp': "Time's up",
  'notify.submitted': 'Exam submitted',
  'notify.complete': 'Test complete',
  'notify.result': 'Net WPM {wpm} · Accuracy {accuracy}%',
  'notify.idleTitle': 'Still there?',
  'notify.idleBody': 'You have been idle during the test.',
  'notify.awayTitle': 'You left the test',
  'notify.awayBody': 'Return to the tab to keep going.',
  'notify.badgeTitle': 'Achievement unlocked 🏅',
  'notify.goalTitle': 'Daily goal reached 🎯',
  'notify.goalBody': 'You completed {count} tests today.',

  // Leaving a locked exam
  'exam.leaveTitle': 'Leave the exam?',
  'exam.leaveBody': 'You left the exam window. Leaving will submit your test now.',
  'exam.leaveConfirm': 'Submit now',
  'exam.leaveCancel': 'Keep going',

  // Do not disturb
  'settings.dnd': 'Do not disturb',
  'settings.dndHint': 'Hold every notification, including the practice reminder, until you turn this off.',
  'settings.dndOn': 'Notifications are being held. The reminder is remembered and resumes when you turn this off.',

  'nav.language': 'Language',

  // Exam countdown and readiness forecast
  'countdown.setTitle': 'When is your exam?',
  'countdown.setLead':
    'Set the date and Typly counts down to it — and works out whether your current rate of improvement gets you past the cut-off in time.',
  'countdown.exam': 'Exam',
  'countdown.date': 'Exam date',
  'countdown.lang': 'Typing language',
  'countdown.save': 'Set date',
  'countdown.cancel': 'Cancel',
  'countdown.change': 'Change',
  'countdown.clear': 'Remove',
  'countdown.badDate': 'Pick a date within the next few years.',
  'countdown.daysLeft': '{days} days left',
  'countdown.tomorrow': 'Tomorrow',
  'countdown.today': 'Today',
  'countdown.gone': 'Exam day has passed',
  'countdown.yourSpeed': 'Your speed',
  'countdown.yourAccuracy': 'Your accuracy',
  'countdown.trend': 'Trend',
  'countdown.perDay': 'WPM per day',
  'countdown.needed': '{value} needed',
  'countdown.verdictReady': 'You are already past the cut-off. Keep it steady — one test a day holds it.',
  'countdown.verdictOnTrack':
    'On this trend you clear the cut-off around {date} — about {days} days from now, and before exam day.',
  'countdown.verdictBehind':
    'This trend does not reach the cut-off in time. You are {wpm} WPM short, which is about +{perDay} WPM a day from here.',
  'countdown.verdictNoData':
    'Take a test in this exam’s language to see where you stand against its cut-off.',
  'countdown.verdictPassed': 'That date has gone. Set the next one to start a new countdown.',
  'countdown.habit': 'About {minutes} minutes a day, on {days} of the last 14.',
  'countdown.habitNone': 'No practice in the last two weeks — the forecast assumes you start again.',

  // Exam mode / drill additions
  'examMode.strict': 'Strict',
  'practice.data_entry': 'Data entry (tables)',
  'practiceDesc.data_entry':
    'A register of roll numbers, names, dates and amounts, Tab-separated — the work a DEST or DEO post is actually for.',

  // Dictation (Stenographer skill test)
  'dictation.heading': 'Stenographer skill test',
  'dictation.title': 'Dictation at {wpm} words a minute',
  'dictation.subtitle':
    'The passage is read aloud at {wpm} WPM. Nothing is shown on screen. When it ends you have {minutes} minutes to transcribe it.',
  'dictation.progress': 'Dictation',
  'dictation.chunkOf': 'Passage {current} of {total}',
  'dictation.words': '{words} words in total.',
  'dictation.ready': 'Press play when you are ready to listen.',
  'dictation.listening': 'Listening — the passage is being read.',
  'dictation.finished': 'Dictation complete. Begin transcribing.',
  'dictation.start': 'Start dictation',
  'dictation.resume': 'Resume',
  'dictation.pause': 'Pause',
  'dictation.repeat': 'Repeat that',
  'dictation.skip': 'Skip to typing',
  'dictation.skipToTyping': 'Type it instead',
  'dictation.beginTranscription': 'Begin transcription',
  'dictation.unsupportedTitle': 'No speech voice available',
  'dictation.unsupportedBody':
    'This device has no text-to-speech voice, so the passage cannot be dictated. You can still run the transcription as an ordinary typing test.',
  'dictation.badge': 'Dictated at {wpm} WPM',

  // Cut-off pacer
  'pacer.title': 'Cut-off pace · {wpm} WPM',
  'pacer.you': 'You',
  'pacer.cutoff': 'Pass line ({wpm} WPM)',
  'pacer.ahead': '{seconds}s of cushion',
  'pacer.behind': '{seconds}s behind',
  'pacer.hintAhead': 'You are above the pass line. Hold this and you clear it.',
  'pacer.hintBehind': 'At this pace you would not pass. The marker is the cut-off, not a rival.',
  'pacer.toggle': 'Pace against the cut-off',
  'pacer.toggleHint':
    'A marker moves at exactly the exam’s minimum speed. Fall behind it and you would have failed — no past attempt needed.',

  // Pressure mode
  'pressure.rank': 'Rank {rank} of {of}',
  'pressure.hint': 'Exam-hall conditions',
  'pressure.warning': '{seconds}s left',
  'pressure.urgent': 'Only {seconds}s left',
  'pressure.toggle': 'Pressure mode',
  'pressure.toggleHint':
    'A flashing clock near the end, a live rank and hall noise. People lose 5–8 WPM to nerves on the day and cannot otherwise practise it.',

  // Exam software skin
  'skin.section': 'Typing Skill Test',
  'skin.candidate': 'Candidate',
  'skin.timeLeft': 'Time left',
  'skin.footer': 'Do not refresh or close this window. Your response is saved automatically.',
  'skin.label': 'Exam screen',
  'skin.modern': 'Typly',
  'skin.examClient': 'Exam software',
  'skin.hint':
    'The exam-software skin imitates the real test client — candidate header, boxed passage, plain input, the clock in the corner. The rules are identical either way.',

  // Pre-flight checks
  'preflight.title': 'Ready to start',
  'preflight.titleBlocked': 'Fix these before you start',
  'preflight.capsLock.ok': 'Caps Lock is off',
  'preflight.capsLock.bad': 'Caps Lock — press any key to check, or turn it off',
  'preflight.inputMethod.ok': 'System input method will not interfere',
  'preflight.inputMethod.bad':
    'Your system is set to a Devanagari input method — switch it to English or the layout will fight it',
  'preflight.font.ok': 'Selected Hindi font is loaded',
  'preflight.font.bad': 'No font uploaded for the selected Hindi font — the passage will not render',
  'preflight.layoutData.ok': 'Keyboard layout data installed',
  'preflight.layoutData.bad': 'Layout data for this input method is missing',
  'preflight.keyboardLayout.ok': 'Keyboard layout matches the passage',
  'preflight.keyboardLayout.bad': 'A Devanagari layout looks active for an English test',
  'preflight.fullscreen.ok': 'Fullscreen',
  'preflight.fullscreen.bad': 'Not fullscreen — the real client fills the screen',

  // Data-entry (KDPH)
  'dataEntry.title': 'Source register',
  'dataEntry.kdph': 'KDPH',
  'dataEntry.hint': 'Enter each field, then Tab. A new line starts the next record.',

  // Breaks
  'breaks.done': 'Done',
  'breaks.toggle': 'Break reminders',
  'breaks.toggleHint':
    'A 20-20-20 eye break every 20 minutes and a wrist prompt every 30. Never during a run. Months of daily drilling is where typing injuries come from.',

  'briefing.kdphCutoff': '{value} key depressions/hour',
  'briefing.dictationTitle': 'This test begins with dictation at {wpm} WPM',
  'briefing.dictationBody':
    'The passage is read aloud at {wpm} words a minute and is not shown on screen. You then have {minutes} minutes to transcribe it.',

  // Multi-section mock papers
  'paper.title': 'Multi-section paper',
  'paper.hint':
    'CPCT and several state exams test two languages in one sitting. A paper chains the sections into one run with a single combined report — including the language switch, which is where candidates actually lose marks.',
  'paper.start': 'Start paper',
  'paper.missing': 'Needs a passage',
  'paper.needPassage':
    'Save a paragraph in each of this paper’s languages to your library first.',
  'paper.reportTitle': 'Paper report',
  'paper.section': 'Section',
  'paper.average': 'Average',
  'paper.cleared': 'Every section cleared its cut-off.',
  'paper.notCleared': 'A paper is only cleared when every section is — {section} fell short.',
  'paper.incomplete': 'This paper is not finished yet.',

  'setup.targetKdph': ' · Target {kdph} key depressions/hour at {accuracy}% accuracy',
  'setup.dictationLabel': 'Dictation',
  'setup.dictationToggle': 'Dictate the passage at {wpm} WPM first',
  'setup.dictationHint':
    'The real skill test reads the passage aloud at {wpm} words a minute, then gives you {minutes} minutes to transcribe it. Switch this off to run it as a plain typing test.',
  'setup.pacing': 'Pacing & pressure',

  // Mistake taxonomy
  'taxonomy.title': 'How you erred',
  'taxonomy.verdict': 'Most of your mistakes ({share}%) were {kind}. That has a specific fix.',
  'mistakeKind.transposition': 'Transpositions',
  'mistakeKind.doubling': 'Doubled keys',
  'mistakeKind.omission': 'Dropped letters',
  'mistakeKind.substitution': 'Wrong letters',
  'mistakeKind.shift': 'Shift & case',
  'mistakeKind.spacing': 'Spacing',
  'mistakeKind.other': 'Other',
  'mistakeFix.transposition':
    'Two letters swapped — your hands are ahead of your eyes. Slow to 80% of your top speed for one drill; transpositions vanish before accuracy does.',
  'mistakeFix.doubling':
    'A key fired twice. Usually a light, lingering touch — or a sticky key. Run the keyboard check if it is always the same letter.',
  'mistakeFix.omission':
    'A letter never landed. This is a pressure problem, not a knowledge one: the finger moved but did not complete the press.',
  'mistakeFix.substitution':
    'A neighbouring or same-finger key instead of the right one. The Trainer’s confused-pairs drill is built for exactly this.',
  'mistakeFix.shift':
    'Right letter, wrong case. Release Shift only after the letter, and check Caps Lock before you start.',
  'mistakeFix.spacing':
    'A space missing or misplaced. Thumbs get lazy on long passages — the space bar is a keystroke, not a pause.',
  'mistakeFix.other': 'No single pattern here. The mistake list below has the individual words.',

  // Cost of backspace
  'backspace.title': 'What corrections cost you',
  'backspace.none': 'No corrections at all — nothing was retyped. That is the habit to keep.',
  'backspace.verdict': 'Corrections cost you about {seconds} seconds — roughly {wpm} WPM.',
  'backspace.corrections': 'Corrections',
  'backspace.share': '{share}% of keystrokes',
  'backspace.timeLost': 'Time lost',
  'backspace.each': '~{ms}ms each',
  'backspace.wpmCost': 'WPM cost',
  'backspace.wpmHint': 'recoverable',
  'backspace.retyped': 'Retyped',
  'backspace.retypedHint': 'characters done twice',
  'backspace.adviceHabit':
    'This is the fix-later habit, and it is the most common reason a 35 WPM typist scores 30. Type through a mistake and correct nothing until the passage ends — your net speed almost always goes up.',
  'backspace.adviceFine':
    'A light touch of correction is fine. Watch it only if the share climbs above about 5% of your keystrokes.',

  // Key depressions per hour
  'kdph.title': 'Key depressions per hour',
  'kdph.verdictMet': 'You are {value} depressions/hour above the {target} required.',
  'kdph.verdictShort': 'You are {value} depressions/hour short of the {target} required.',
  'kdph.achieved': 'Achieved',
  'kdph.required': 'Required',
  'kdph.perHour': 'per hour',
  'kdph.depressions': 'Depressions',
  'kdph.depressionsHint': 'keys pressed in total',
  'kdph.asWpm': 'Same as',
  'kdph.asWpmHint': 'WPM · cut-off is {value}',
  'kdph.explainCounted': 'Every key counts — corrections included',
  'kdph.explainAccuracy': 'Accuracy must still reach {accuracy}%',

  // Shareable result card
  'share.title': 'Share your result',
  'share.hint':
    'A square card sized for WhatsApp and Instagram — your speed, accuracy and streak, nothing else.',
  'share.share': 'Share',
  'share.download': 'Save image',
  'share.nameAria': 'Name to print on the card',
  'share.downloadedInstead': 'This device cannot share images directly, so the card was saved instead.',

  // Finger load and travel
  'fingers.title': 'Finger load and travel',
  'fingers.verdictOverload':
    'Your {hand} {finger} is doing {share}% of the work. That is the mechanics behind a plateau, and it will not improve by typing more.',
  'fingers.verdictSkew':
    'Your {hand} hand is carrying {share}% of the keystrokes. Some imbalance is normal in English; this much usually means a home position that has drifted.',
  'fingers.verdictBalanced': 'The load is spread evenly across both hands. Nothing to fix here.',
  'fingers.finger': 'Finger',
  'fingers.presses': 'Presses',
  'fingers.travel': 'Travel',
  'fingers.errorRate': 'Errors',
  'fingers.travelNote':
    'Travel is measured in key widths, so the numbers compare fingers rather than measure centimetres. A high figure with a low press count means a finger reaching for keys another one should take.',
  'finger.pinky': 'pinky',
  'finger.ring': 'ring',
  'finger.middle': 'middle',
  'finger.index': 'index',
  'finger.thumb': 'thumb',
  'hand.left': 'Left',
  'hand.right': 'Right',

  // Challenge files
  'challenge.title': 'Challenge a friend',
  'challenge.hint':
    'Saves this passage and your score as a small .typly file. Whoever opens it types the same passage under the same rules and gets a head-to-head — no accounts, no server.',
  'challenge.export': 'Save challenge file',
  'challenge.youWon': 'You won this challenge',
  'challenge.youLost': 'Not this time',
  'challenge.you': 'You',
  'challenge.challenger': 'Challenger',
  'challenge.margin': '{wpm} WPM and {accuracy} percentage points between you.',
  'challenge.sendBack': 'Challenge them back',
  'challenge.incomingTitle': 'A challenge is waiting',
  'challenge.incomingBody':
    '{name} typed this passage at {wpm} WPM with {accuracy}% accuracy. Same passage, same rules, same clock.',
  'challenge.accept': 'Accept challenge',
  'challenge.decline': 'Not now',

  // Longitudinal heatmap
  'longitudinal.title': 'Weak keys over {days} days',
  'longitudinal.subtitle':
    '{runs} runs in the last {days} days, compared against the {days} days before them — so a key you have been drilling shows whether it is actually healing.',
  'longitudinal.empty':
    'No attempts in the last {days} days yet. This chart needs history to compare against, so it fills in as you practise.',
  'longitudinal.keyErrors': '{count} errors in this window',
  'longitudinal.noErrors': 'no errors',
  'longitudinal.healing': 'Healing',
  'longitudinal.healingHint': 'Fewer errors than the previous window.',
  'longitudinal.worsening': 'Getting worse',
  'longitudinal.worseningHint': 'More errors than the previous window — worth a targeted drill.',
  'longitudinal.noneHealing': 'Nothing has improved measurably yet.',
  'longitudinal.noneWorsening': 'Nothing is getting worse. Good.',

  // Fatigue curve
  'fatigue.title': 'Do you fade?',
  'fatigue.empty':
    'Needs a few runs of three minutes or more. Short drills have no late minute to compare against.',
  'fatigue.verdictFading':
    'You lose about {drop} WPM ({pct}%) between your first and last minute, across {runs} runs. That — not peak speed — is what fails a 10-minute test.',
  'fatigue.verdictSteady':
    'Your speed holds up to the end across {runs} runs. Stamina is not what is limiting you.',
  'fatigue.firstMinute': 'First minute',
  'fatigue.lastMinute': 'Last minute',
  'fatigue.change': 'Change',
  'fatigue.minute': 'min {minute}',
  'fatigue.samples': '{count} runs',
  'fatigue.advice':
    'If you fade, practise longer than the exam rather than faster than it: one 15-minute run builds more stamina than three 5-minute ones.',

  // Retroactive eligibility
  'eligibility.title': 'Which post could you clear?',
  'eligibility.subtitle':
    'Every one of your {attempts} attempts, re-scored against all 13 exam profiles. You already clear {cleared}.',
  'eligibility.empty':
    'Take a test and this re-scores your whole history against every exam profile — including the ones you have never selected.',
  'eligibility.cleared': 'You clear these',
  'eligibility.clearedHint': 'Your best attempt in this exam’s language met both its cut-offs.',
  'eligibility.close': 'Within reach',
  'eligibility.closeHint': 'A few WPM away. These are the ones worth targeting next.',
  'eligibility.far': 'Not yet',
  'eligibility.farHint': 'Further off, or you have no attempt in this exam’s language yet.',
  'eligibility.noneCleared': 'None yet — the list above shows what is closest.',
  'eligibility.noneClose': 'Nothing is borderline right now.',
  'eligibility.noneFar': 'Nothing is out of reach.',
  'eligibility.met': 'Cleared',
  'eligibility.wpmShort': '{value} WPM short',
  'eligibility.kdphShort': '{value} KDPH short',
  'eligibility.accuracyShort': '{value}% accuracy short',
  'eligibility.repeatable': 'Cleared on {runs} separate attempts — repeatable, not luck.',
  'eligibility.onceOnly': 'Cleared {runs} time(s). Do it twice more before you count on it.',
  'eligibility.bestSoFar': 'Best so far: {wpm} WPM at {accuracy}%.',

  // Monthly recap
  'recap.title': 'Your {month}',
  'recap.empty': 'No practice recorded that month.',
  'recap.subtitleFirst': '{tests} tests and {hours} hours at the keyboard. This is your first full month.',
  'recap.subtitleUp': '{tests} tests, {hours} hours, and {gained} WPM faster than last month.',
  'recap.subtitleDown': '{tests} tests and {hours} hours. Your average was {gained} WPM below last month.',
  'recap.hours': 'Hours',
  'recap.hoursHint': 'at the keyboard',
  'recap.tests': 'Tests',
  'recap.passed': '{count} passed',
  'recap.best': 'Best WPM',
  'recap.average': 'avg {value}',
  'recap.activeDays': 'Active days',
  'recap.bestStreak': 'best streak {count}',
  'recap.bestDay': 'Best day',
  'recap.bestDayValue': '{date} — {tests} tests, best {wpm} WPM',
  'recap.gained': 'Against last month',
  'recap.gainedUp': '{value} WPM faster on average',
  'recap.gainedDown': '{value} WPM slower on average',
  'recap.keysFixed': 'Keys you fixed',

  // Tools page
  'nav.tools': 'Tools',
  'toolbox.title': 'Tools',
  'toolbox.subtitle':
    'A Kruti Dev converter and a keyboard check — both offline, because both are needed on machines you do not own.',

  // Kruti Dev converter
  'krutidev.title': 'Kruti Dev ⇄ Unicode',
  'krutidev.hint':
    'Convert legacy Kruti Dev text to Unicode Devanagari and back. Runs entirely on this device — nothing is uploaded, which matters when the text is an official document.',
  'krutidev.toUnicode': 'Kruti Dev → Unicode',
  'krutidev.toKrutiDev': 'Unicode → Kruti Dev',
  'krutidev.directionAria': 'Conversion direction',
  'krutidev.detect': 'Detect',
  'krutidev.detectHint': 'Pick the direction from what you pasted.',
  'krutidev.clear': 'Clear',
  'krutidev.input': 'Input',
  'krutidev.output': 'Result',
  'krutidev.outputEmpty': 'The converted text appears here.',
  'krutidev.copy': 'Copy',
  'krutidev.copied': 'Copied',
  'krutidev.placeholderLegacy': 'Paste Kruti Dev text (it will look like Roman gibberish)…',
  'krutidev.placeholderUnicode': 'यहाँ यूनिकोड हिंदी पाठ चिपकाएँ…',
  'krutidev.coverage':
    'Covers the standard layer — consonants, vowels, matras, the single-key conjuncts and punctuation — and corrects the visual-to-logical reordering of ि and reph. Decorative variants pass through unchanged rather than being guessed at.',

  // Keyboard health check
  'health.title': 'Keyboard health check',
  'health.hint':
    'Press every key once. Dead, sticky and ghosting keys are all detectable — and finding a half-dead key two minutes into a mock is a wasted session.',
  'health.start': 'Start check',
  'health.restart': 'Start again',
  'health.regionAria': 'Keyboard test area — press keys here',
  'health.tested': 'Keys tested',
  'health.notStarted': 'Press Start, click the keyboard above, then work across every key.',
  'health.pressKeys': 'Now press every key once. Escape ends the check.',
  'health.remaining': '{count} keys still untested — press them to rule them out.',
  'health.allGood': 'Every key responded once and only once. This keyboard is fine.',
  'health.stickyFound':
    'Sticky or chattering: {keys}. These fire more than once from a single press, which shows up as doubled letters.',
  'health.ghostingFound':
    'Ghosting: {keys}. These register while a different key is held — the classic membrane fault, and the one that silently corrupts a run.',
  'health.untested': 'Not tested yet',
  'health.ok': 'Responds correctly',
  'health.sticky': 'Sticky — fires more than once',
  'health.ghosting': 'Ghosting — fires when another key is held',

  // Passage difficulty rating
  'passageBand.veryEasy': 'Very easy',
  'passageBand.easy': 'Easy',
  'passageBand.moderate': 'Moderate',
  'passageBand.hard': 'Hard',
  'passageBand.veryHard': 'Very hard',
  'difficultyRating.tooltip': 'Difficulty {score}/100 · suits a typist around {wpm} WPM',
  'difficultyRating.matched': 'About right for your level (suits around {wpm} WPM).',
  'difficultyRating.tooEasy':
    'Easier than your level — you are {gap} WPM past what this passage asks. Fine for a warm-up, but it will not move your speed.',
  'difficultyRating.tooHard':
    'Harder than your level by about {gap} WPM. Worth returning to; practising above your level mostly builds frustration.',
  'difficultyRating.factorWordLength': 'Long words',
  'difficultyRating.factorPunctuation': 'Punctuation',
  'difficultyRating.factorCapitals': 'Capitals',
  'difficultyRating.factorDigits': 'Digits',
  'difficultyRating.factorRareLetters': 'Rare letters',
  'difficultyRating.factors': 'What makes it hard',
  'difficultyRating.recommend': 'Better suited to you right now',

  // Passage packs
  'packs.title': 'Passage packs',
  'packs.hint':
    'Polity, economy, an editorial and a real office-memorandum format. You are preparing for a general-knowledge paper too, so an hour of typing may as well be an hour of reading what you need. Bundled with the app — no network required.',
  'packs.import': 'Add to library',
  'packs.importing': 'Adding…',
  'packs.again': 'Add again',

  // Institute branding
  'institute.title': 'Institute branding',
  'institute.hint':
    'Put your centre’s name and logo on every certificate, then generate a whole batch from the History page. Stored on this device and included in backups.',
  'institute.name': 'Institute name',
  'institute.namePlaceholder': 'e.g. Sharma Computer Institute',
  'institute.subtitle': 'Second line',
  'institute.subtitlePlaceholder': 'City, affiliation or registration',
  'institute.signatory': 'Signed by',
  'institute.signatoryPlaceholder': 'Name of the signatory',
  'institute.signatoryTitle': 'Designation',
  'institute.signatoryTitlePlaceholder': 'e.g. Centre Director',
  'institute.uploadLogo': 'Upload logo',
  'institute.removeLogo': 'Remove logo',
  'institute.logoTooBig': 'That logo is too large — keep it under {kb} KB.',
  'institute.save': 'Save branding',
  'institute.cancel': 'Discard changes',
  'certificate.branded': 'Issued as {institute}',

  // Batch certificates
  'batch.title': 'Batch certificates',
  'batch.hintBranded':
    '{count} passing attempts, ready to issue as {institute}. Type each candidate’s name, then download the batch in one go.',
  'batch.hintUnbranded':
    '{count} passing attempts. Set your institute name in Settings first, or these print under Typly’s own name.',
  'batch.empty': 'No passing attempts to certify yet.',
  'batch.downloadAll': 'Download {count} certificates',
  'batch.print': 'Print list',
  'batch.candidate': 'Candidate',
  'batch.exam': 'Exam',
  'batch.wpm': 'Net WPM',
  'batch.accuracy': 'Accuracy',
  'batch.date': 'Date',
  'batch.namePlaceholder': 'Candidate name',
  'batch.nameAria': 'Candidate name for attempt {id}',

  // Endless / adaptive run
  'endless.cardTitle': 'Endless run',
  'endless.cardHint':
    'Passages keep coming. Difficulty climbs while you hold {wpm} WPM and eases when you drop, and the run ends once you have missed the cut-off three times in a row. The answer is one number: how long you can hold {exam} pace.',
  'endless.start': 'Start endless run',
  'endless.starting': 'Starting…',
  'endless.needLibrary':
    'Needs paragraphs at two or more difficulty levels in your library, or the difficulty has nothing to adapt to. Add a passage pack from the Library page.',
  'endless.couldNotStart': 'No passage was available to start with. Add something to your library first.',
  'endless.title': 'Endless run',
  'endless.continuing':
    '{minutes} minutes at pace across {laps} passages so far. The next one is loading — it will be harder if you held, easier if you did not.',
  'endless.finished':
    'Run over: you held exam pace for {minutes} minutes across {laps} passages. That is the number a fixed-length test cannot give you.',
  'endless.stop': 'End the run',
  'endless.atPace': 'At pace',
  'endless.atPaceHint': 'held above the cut-off',
  'endless.laps': 'Passages',
  'endless.lapsHint': 'completed',
  'endless.peak': 'Hardest held',
  'endless.peakHint': 'difficulty band',
  'endless.misses': 'Misses in a row',
  'endless.missesHint': 'three ends the run',
  'endless.held': 'held',
  'endless.missed': 'missed',

  // Quick drill (tray / global hotkey overlay)
  'quick.title': 'Quick drill · 60 seconds',
  'quick.close': 'Close',
  'quick.placeholder': 'Start typing — the clock starts with your first key.',
  'quick.inputLabel': 'Quick drill input',
  'quick.netWpm': 'Net WPM',
  'quick.accuracy': '{value}% accuracy',
  'quick.counted': 'Saved — it counts towards your streak and daily goal.',
  'quick.again': 'Again',
  'quick.done': 'Done',

  'trainer.taxonomy': 'The kind of mistake you make',
  'trainer.taxonomyHint':
    'Across every attempt, {share}% of your mistakes are {kind}. A pattern that survives your whole history is the one worth changing technique for.',

  // Release notes — 0.4.0
  'changelog.dictation':
    'Stenographer mode: the passage is dictated at 80 or 100 WPM, then you transcribe it against the clock.',
  'changelog.kdph':
    'Key depressions per hour, the way DEST and DEO posts are really scored — with a tabular data-entry drill to match.',
  'changelog.examSkin':
    'An exam-software skin that imitates the real test client, so the mock feels like the exam.',
  'changelog.pacer':
    'A cut-off pacer: a marker moving at exactly the exam’s minimum speed. Fall behind it and you would have failed.',
  'changelog.pressure':
    'Pressure mode — a flashing clock, a live rank and hall noise, so exam-day nerves can be rehearsed.',
  'changelog.strict': 'Strict mode blocks progress until the current word is correct.',
  'changelog.endless':
    'Endless run: passages keep coming and difficulty adapts, until you cannot hold exam pace any longer.',
  'changelog.eligibility':
    'Your whole history re-scored against every exam profile — which posts you already clear, and which are two WPM away.',
  'changelog.taxonomy':
    'Mistakes classified by kind — transposition, doubling, omission, substitution, shift — each with its own fix.',
  'changelog.longitudinal':
    'A 30-day weak-key heatmap and a fatigue curve, so you can see whether a key is healing and whether you fade.',
  'changelog.backspaceCost': 'What corrections cost you, in seconds and in WPM.',
  'changelog.fingerLoad': 'Finger load and travel — the mechanics behind a plateau.',
  'changelog.difficulty':
    'Every passage rated for difficulty, with a recommendation when one sits above or below your level.',
  'changelog.packs':
    'Bundled GK, economy, editorial and official-letter passage packs, so typing practice doubles as revision.',
  'changelog.shareCard': 'A square shareable result card, sized for WhatsApp.',
  'changelog.challenge':
    'Challenge files: export a passage and your score as a .typly file for a head-to-head with no server.',
  'changelog.recap': 'A monthly recap — hours practised, WPM gained, keys fixed, best day.',
  'changelog.krutidev': 'An offline Kruti Dev ⇄ Unicode converter.',
  'changelog.keyboardHealth': 'A keyboard health check that flags dead, sticky and ghosting keys.',
  'changelog.preflight': 'Pre-flight checks before the clock starts — Caps Lock, input method, fonts.',
  'changelog.multiSection': 'Multi-section mock papers for CPCT and state exams, with one combined report.',
  'changelog.institute': 'Institute branding and batch certificates for coaching centres.',
  'changelog.quickDrill':
    'A 60-second drill from the tray or a global hotkey, in a small always-on-top window.',
  'changelog.breaks': '20-20-20 eye breaks and a wrist prompt during long sessions.',
  'changelog.portable': 'A portable build that keeps its data beside the executable — run it from a USB stick.',

  // Recovering a table from an imported form
  'tabulate.title': 'This looks like a form or register',
  'tabulate.hint':
    '{rows} rows of about {columns} columns. Convert the column gaps to Tabs and it runs as a data-entry test, scored in key depressions per hour.',
  'tabulate.apply': 'Convert to fields',
} as const;

export type TKey = keyof typeof en;
