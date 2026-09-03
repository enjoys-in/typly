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
} as const;

export type TKey = keyof typeof en;
