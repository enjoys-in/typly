import type { TKey } from './en';

/**
 * Hindi interface copy.
 *
 * Typed as a *complete* record of the English keys, so TypeScript refuses a new
 * key that has not been translated. Exam and typing vocabulary keeps the terms
 * candidates actually see on their exam notices (WPM, net/gross) rather than
 * inventing Hindi equivalents nobody would recognise.
 */
export const hi: Record<TKey, string> = {
  // Navigation and the app shell
  'nav.label': 'मुख्य',
  'nav.dashboard': 'डैशबोर्ड',
  'nav.new': 'नया टेस्ट',
  'nav.lessons': 'पाठ',
  'nav.practice': 'अभ्यास',
  'nav.trainer': 'ट्रेनर',
  'nav.library': 'लाइब्रेरी',
  'nav.history': 'इतिहास',
  'nav.progress': 'प्रगति',
  'nav.settings': 'सेटिंग्स',
  'nav.about': 'ऐप के बारे में',
  'nav.logout': 'लॉग आउट',
  'nav.guest': 'अतिथि',
  'nav.skipToContent': 'मुख्य सामग्री पर जाएँ',
  'nav.collapse': 'साइडबार छोटा करें',
  'nav.expand': 'साइडबार बड़ा करें',

  // Time-of-day greetings
  'greeting.lateNight': 'अभी भी जाग रहे हैं',
  'greeting.morning': 'सुप्रभात',
  'greeting.afternoon': 'नमस्कार',
  'greeting.evening': 'शुभ संध्या',
  'greeting.night': 'दिन समाप्ति की ओर',
  'greeting.returning': 'वापसी पर स्वागत है',

  // Dashboard
  'dashboard.title': 'डैशबोर्ड',
  'dashboard.tagline': 'किसी भी चित्र, PDF या अनुच्छेद को टाइपिंग परीक्षा बनाएँ।',
  'dashboard.wpmAverages': 'WPM औसत',
  'dashboard.averageNet': 'औसत नेट',
  'dashboard.averageGross': 'औसत ग्रॉस',
  'dashboard.lastN': 'पिछले {count}',
  'dashboard.today': 'आज',
  'dashboard.vsAverage': 'औसत से {value}',
  'dashboard.netGrossNote':
    'नेट गति दंड घटाने के बाद है, ग्रॉस कच्ची गति — दोनों का अंतर वही है जो अशुद्धि आपसे वसूलती है। सर्वश्रेष्ठ {best} WPM.',
  'dashboard.bestWpm': 'सर्वश्रेष्ठ WPM',
  'dashboard.avgAccuracy': 'औसत शुद्धता',
  'dashboard.tests': 'टेस्ट',
  'dashboard.points': 'अंक',
  'dashboard.lastTest': 'पिछला टेस्ट',
  'dashboard.allResults': 'सभी परिणाम',
  'dashboard.netWpm': 'नेट WPM',
  'dashboard.accuracy': 'शुद्धता',
  'dashboard.errors': 'त्रुटियाँ',
  'dashboard.weakestKeys': 'सबसे कमज़ोर कुंजियाँ',
  'dashboard.noMistakes': 'अभी कोई ग़लती दर्ज नहीं — अभ्यास के लिए कुछ नहीं। ऐसा ही बनाए रखें।',
  'dashboard.trainerNote':
    'ट्रेनर इन्हीं से, और जिन अक्षर-जोड़ों में सबसे ज़्यादा समय लगता है उनसे, अभ्यास तैयार करता है।',
  'dashboard.openTrainer': 'ट्रेनर खोलें',
  'dashboard.streak': 'लगातार दिन',
  'dashboard.goalReached': 'आज का लक्ष्य पूरा — क्रम सुरक्षित है।',
  'dashboard.goalRemaining': 'आज का लक्ष्य पूरा करने के लिए {count} और।',
  'dashboard.passed': 'उत्तीर्ण',
  'dashboard.failed': 'अनुत्तीर्ण',

  // Exam screen
  'exam.endSubmit': 'समाप्त करें और जमा करें',
  'exam.pause': 'रोकें',
  'exam.resume': 'जारी रखें',
  'exam.paused': 'रुका हुआ',
  'exam.nonStop': 'नॉन-स्टॉप मोड · रोकना बंद है',
  'exam.examDay': 'परीक्षा दिवस',
  'exam.resumed': 'पुनः आरंभ',
  'exam.testOf': 'टेस्ट {current} / {total}',
  'exam.showKeyboard': 'कीबोर्ड दिखाएँ',
  'exam.hideKeyboard': 'कीबोर्ड छिपाएँ',
  'exam.showKeys': 'कुंजियाँ दिखाएँ',
  'exam.showStats': 'आँकड़े दिखाएँ',
  'exam.hideStats': 'आँकड़े छिपाएँ',
  'exam.typeHere': 'यहाँ टाइप करना शुरू करें…',
  'exam.typeHereRoman': 'रोमन में लिखें — जैसे namaste',
  'exam.typeHereLayout': '{layout} लेआउट से टाइप करें',
  'exam.inputLabel': 'अनुच्छेद यहाँ टाइप करें',
  'exam.passageRegion': 'टाइप करने का अनुच्छेद',

  // Live stats
  'stats.liveWpm': 'वर्तमान WPM',
  'stats.accuracy': 'शुद्धता',
  'stats.errors': 'त्रुटियाँ',
  'stats.progress': 'प्रगति',
  'stats.words': 'शब्द',
  'stats.blocked': 'रोकी गई कुंजियाँ',
  'stats.target': 'लक्ष्य {value}',
  'stats.corrections': 'सुधार',
  'stats.characters': 'अक्षर',

  // Briefing and reading time
  'briefing.heading': 'निर्देश',
  'briefing.duration': 'अवधि',
  'briefing.readingTime': 'पढ़ने का समय',
  'briefing.speedCutoff': 'गति कट-ऑफ',
  'briefing.accuracyCutoff': 'शुद्धता कट-ऑफ',
  'briefing.allowed': 'परीक्षा के दौरान अनुमति',
  'briefing.notGraded': 'मूल्यांकन नहीं',
  'briefing.none': 'कोई नहीं',
  'briefing.beginReading': 'पढ़ने का समय शुरू करें',
  'briefing.beginTest': 'टेस्ट शुरू करें',
  'briefing.backspace': 'बैकस्पेस / डिलीट',
  'briefing.space': 'स्पेस बार',
  'briefing.enter': 'एंटर / नई पंक्ति',
  'briefing.paste': 'पेस्ट',
  'reading.banner': 'पढ़ने का समय — टाइप करना शुरू करते ही घड़ी चलेगी।',
  'reading.startNow': 'अभी शुरू करें',

  // Paper mode
  'paper.heading': 'अपने काग़ज़ से टाइप करें',
  'paper.body':
    'स्क्रीन पर कोई अनुच्छेद नहीं है — सामने रखे काग़ज़ से पढ़ें और नीचे टाइप करें। पहली कुंजी के साथ घड़ी शुरू हो गई।',
  'paper.scoredOn': 'मूल्यांकन का आधार',
  'paper.checkedLater':
    'वर्तनी और व्याकरण जमा करने पर जाँचे जाते हैं — टाइप करते समय तुलना के लिए कोई अनुच्छेद नहीं है।',

  // Results
  'result.title': 'परिणाम',
  'result.mistakes': 'ग़लतियाँ',
  'result.replay': 'रीप्ले',
  'result.newTest': 'नया टेस्ट',
  'result.viewHistory': 'इतिहास देखें',
  'result.print': 'प्रिंट',
  'result.share': 'साझा करें',
  'result.cutoff': 'कट-ऑफ',
  'result.speed': 'गति',
  'result.needs': '{value} आवश्यक',
  'result.fasterThan': 'आपके पिछले {count} प्रयासों में से {percent}% से तेज़।',

  // Setup
  'setup.title': 'परीक्षा सेटअप',
  'setup.examProfile': 'परीक्षा प्रोफ़ाइल',
  'setup.language': 'भाषा',
  'setup.difficulty': 'कठिनाई',
  'setup.mode': 'मोड',
  'setup.timing': 'समय',
  'setup.countdown': 'उल्टी गिनती',
  'setup.stopwatch': 'स्टॉपवॉच',
  'setup.duration': 'अवधि (मिनट)',
  'setup.behaviour': 'व्यवहार',
  'setup.mockExam': 'मॉक परीक्षा',
  'setup.startExam': 'परीक्षा शुरू करें',
  'setup.or': 'या',
  'setup.minutes': 'मिनट',

  // Landing
  'landing.getStarted': 'शुरू करें',
  'landing.yourName': 'आपका नाम',
  'landing.email': 'ईमेल',
  'landing.optional': 'वैकल्पिक',
  'landing.startPractising': 'अभ्यास शुरू करें',
  'landing.worksOffline': 'ऑफ़लाइन चलता है',

  // Shared
  'common.cancel': 'रद्द करें',
  'common.save': 'सहेजें',
  'common.delete': 'हटाएँ',
  'common.close': 'बंद करें',
  'common.loading': 'लोड हो रहा है…',

  // Enum labels
  'lang.eng': 'अंग्रेज़ी',
  'lang.hin': 'हिन्दी',
  'lang.mar': 'मराठी',
  'lang.ben': 'बांग्ला',
  'lang.tam': 'तमिल',
  'lang.guj': 'गुजराती',

  'difficulty.easy': 'आसान',
  'difficulty.normal': 'सामान्य',
  'difficulty.hard': 'कठिन',

  'examMode.standard': 'सामान्य',
  'examMode.blind': 'बिना संकेत',
  'examMode.error_free': 'त्रुटिरहित',
  'examMode.accuracy': 'शुद्धता',
  'examMode.speed': 'गति',

  'timing.countdown': 'उल्टी गिनती',
  'timing.stopwatch': 'स्टॉपवॉच',

  'practice.words': 'सामान्य शब्द',
  'practice.capitals': 'बड़े अक्षर',
  'practice.numbers': 'अंक',
  'practice.symbols': 'विशेष चिह्न',
  'practice.punctuation': 'विराम चिह्न',
  'practice.home_row': 'होम रो',
  'practice.top_row': 'ऊपरी पंक्ति',
  'practice.bottom_row': 'निचली पंक्ति',
  'practice.all_rows': 'सभी पंक्तियाँ',
  'practice.numpad': 'नमपैड',
  'practice.shortcuts': 'कीबोर्ड शॉर्टकट',
  'practice.sentences': 'वाक्य',

  'category.missing_char': 'छूटा अक्षर',
  'category.extra_char': 'अतिरिक्त अक्षर',
  'category.wrong_char': 'ग़लत अक्षर',
  'category.wrong_word': 'ग़लत शब्द',
  'category.missing_word': 'छूटा शब्द',
  'category.extra_word': 'अतिरिक्त शब्द',
  'category.capitalization': 'बड़े-छोटे अक्षर',
  'category.punctuation': 'विराम चिह्न',

  'inputMethod.qwerty': 'सामान्य (QWERTY)',
  'inputMethod.phonetic': 'फ़ोनेटिक (रोमन में लिखें)',
  'inputMethod.inscript': 'इनस्क्रिप्ट (BIS / यूनिकोड)',
  'inputMethod.remington': 'रेमिंगटन GAIL (टाइपराइटर)',

  'hindiFont.system': 'सिस्टम डिफ़ॉल्ट',
  'hindiFont.mangal': 'मंगल (यूनिकोड)',
  'hindiFont.krutidev': 'कृतिदेव (पुरानी शैली)',
  'hindiFont.custom': 'कस्टम (अपलोड किया)',

  'grammarMode.off': 'बंद',
  'grammarMode.offline': 'मोड 1 · डिवाइस पर (ऑफ़लाइन)',
  'grammarMode.ai': 'मोड 2 · AI आधारित (क्लाउड)',

  'spellEngine.off': 'बंद',
  'spellEngine.builtin': 'अंतर्निहित (nspell) · अनुशंसित',
  'spellEngine.symspell': 'मिलान आधारित (कम मेमोरी)',

  'sourceType.image': 'चित्र',
  'sourceType.pdf': 'PDF',
  'sourceType.docx': 'दस्तावेज़',
  'sourceType.text': 'पाठ',

  // Exam setup
  'setup.source': 'स्रोत: {source}',
  'setup.target': ' · लक्ष्य {wpm} WPM, {accuracy}% शुद्धता',
  'setup.guestCap':
    '{minutes} मिनट तक — पूरी लंबाई की मॉक परीक्षा के लिए सेटिंग्स में अपना ईमेल जोड़ें।',
  'setup.fullCap': '{minutes} मिनट तक की मनचाही अवधि।',
  'setup.allowBackspace': 'बैकस्पेस / डिलीट',
  'setup.allowBackspaceHint': 'परीक्षा के दौरान ग़लती सुधारने की अनुमति।',
  'setup.allowSpace': 'स्पेस कुंजी',
  'setup.allowSpaceHint': 'स्पेस बार की अनुमति (लगातार लिपि के अभ्यास में बंद करें)।',
  'setup.allowEnter': 'एंटर कुंजी',
  'setup.allowEnterHint': 'नई पंक्ति / अनुच्छेद विराम की अनुमति।',
  'setup.examLock': 'परीक्षा लॉक',
  'setup.examLockHint': 'स्क्रीन जगी रहती है; टैब छोड़ने पर टेस्ट जमा करने के लिए पूछा जाता है।',
  'setup.briefingToggle': 'परीक्षा से पहले निर्देश',
  'setup.briefingHint': 'वास्तविक कौशल परीक्षा की तरह नियम और कट-ऑफ के साथ शुरुआत।',
  'setup.examDayToggle': 'परीक्षा-दिवस मोड',
  'setup.examDayHint': 'परीक्षा के दौरान ऐप छिपाता है, सूचनाएँ रोकता है और रोकना बंद कर देता है।',
  'setup.readingLabel': 'पढ़ने का समय',
  'setup.readingHint': 'मिनट, घड़ी शुरू होने से पहले (0 = कोई नहीं)',
  'setup.ghostTitle': 'पिछले प्रयास से मुक़ाबला',
  'setup.ghostNone': 'कोई मुक़ाबला नहीं',
  'setup.ghostHint':
    'उस प्रयास की प्रगति आपके साथ-साथ दिखती है, जिससे टाइप करते समय अंतर दिखता रहे।',
  'setup.paperTitle': 'काग़ज़ से टेस्ट',
  'setup.paperBody':
    'स्क्रीन पर कोई अनुच्छेद नहीं — अपने काग़ज़ से पढ़ें। मूल्यांकन शब्दों, गति, सुधारों और अंत में वर्तनी व व्याकरण पर होता है। तुलना के लिए कुछ नहीं है, इसलिए त्रुटिरहित मोड और मुक़ाबला लागू नहीं होते।',
  'setup.partOf': '{title} · भाग {index} / {total}',
  'setup.partHint': 'यह भाग पूरा होने पर अगला भाग स्वयं शुरू हो जाएगा।',

  // Progress
  'progress.title': 'प्रगति',
  'progress.subtitle': 'सर्वश्रेष्ठ प्रदर्शन, लगातार दिन, और हाल की गति का रुझान।',
  'progress.empty': 'अभी कोई परिणाम नहीं। एक टेस्ट पूरा करें और प्रगति यहाँ दिखेगी।',
  'progress.bestWpm': 'सर्वश्रेष्ठ नेट WPM',
  'progress.avgWpm': 'औसत नेट WPM',
  'progress.avgAccuracy': 'औसत शुद्धता',
  'progress.passRate': 'उत्तीर्ण दर',
  'progress.dailyGoal': 'दैनिक लक्ष्य',
  'progress.today': 'आज',
  'progress.thisWeek': 'इस सप्ताह',
  'progress.thisMonth': 'इस महीने',
  'progress.totalTests': 'कुल टेस्ट',
  'progress.points': 'पुरस्कार अंक',
  'progress.streakDays': '{count} दिन लगातार',
  'progress.recentTrend': 'हाल की गति का रुझान',
  'progress.topRuns': 'आपके सर्वश्रेष्ठ प्रयास',
  'progress.badges': 'उपलब्धियाँ',
  'progress.locked': 'बंद',

  // Library
  'library.title': 'लाइब्रेरी',
  'library.subtitle': 'आपके सहेजे सभी अनुच्छेद, और हर एक पर आपका प्रदर्शन।',
  'library.empty': 'अभी कोई अनुच्छेद नहीं। लाइब्रेरी बनाने के लिए एक जोड़ें।',
  'library.newTest': 'नया टेस्ट',
  'library.series': 'अभ्यास श्रृंखला',
  'library.seriesPick': 'अनुच्छेद चुनें, या सभी {count} एक के बाद एक चलाएँ।',
  'library.seriesSelected': '{count} चुने गए · इसी क्रम में, स्वयं आगे बढ़ते हुए',
  'library.order': 'श्रृंखला क्रम',
  'library.serial': 'क्रमवार',
  'library.serialHint': 'जैसे दिखाया गया है',
  'library.preference': 'वरीयता',
  'library.preferenceHint': 'सबसे छोटा पहले',
  'library.clear': 'हटाएँ',
  'library.startAll': 'सभी शुरू करें',
  'library.startN': '{count} शुरू करें',
  'library.colTitle': 'अनुच्छेद',
  'library.colLang': 'भाषा',
  'library.colChars': 'अक्षर',
  'library.colTries': 'प्रयास',
  'library.colBest': 'सर्वश्रेष्ठ',
  'library.long': 'लंबा',
  'library.longHint': 'छोटे-छोटे भागों में बाँटने लायक लंबा — बाँटने के लिए पंक्ति खोलें',
  'library.partsDone': '{done}% भाग पूरे',
  'library.retest': 'दोबारा टेस्ट',
  'library.start': 'शुरू करें',
  'library.runAgain': 'फिर चलाएँ',
  'library.useForTest': 'टेस्ट के लिए इस्तेमाल करें',
  'library.deleteOne': '{title} हटाएँ',
  'library.deleteHint': 'यह अनुच्छेद हटाएँ',
  'library.deleteTitle': '"{title}" हटाएँ?',
  'library.deleteBody':
    'अनुच्छेद लाइब्रेरी से हट जाएगा। पिछले परिणाम अपने अंकों के साथ रहेंगे, पर उन्हें दोबारा टेस्ट या रीप्ले नहीं किया जा सकेगा।',
  'library.leaderboard': 'शीर्ष सूची',
  'library.noAttempts': 'अभी कोई प्रयास नहीं — पहला स्कोर आपका हो।',
  'library.moveUp': 'ऊपर ले जाएँ',
  'library.moveDown': 'नीचे ले जाएँ',
  'library.remove': 'हटाएँ',

  // History
  'history.title': 'इतिहास',
  'history.progressHeading': 'प्रगति — आपने कितना सुधार किया',
  'history.empty': 'अभी कोई टेस्ट नहीं। अपना पहला टेस्ट दें!',
  'history.colDate': 'दिनांक',
  'history.colExam': 'परीक्षा',
  'history.colNetWpm': 'नेट WPM',
  'history.colAccuracy': 'शुद्धता',
  'history.colErrors': 'त्रुटियाँ',
  'history.colStatus': 'स्थिति',
  'history.replayHint': 'इस प्रयास को चलता हुआ देखें',

  // Lessons
  'lessons.title': 'पाठ',
  'lessons.subtitle': 'पाठ्यक्रम पूरा करें। हर पाठ अपने लक्ष्य पूरे करने पर खुलता है।',
  'lessons.locked': 'इसे खोलने के लिए पिछला पाठ पूरा करें',
  'lessons.done': 'पूरा',
  'lessons.start': 'शुरू करें',
  'lessons.target': 'लक्ष्य {wpm} WPM · {accuracy}%',
  'lessons.custom': 'आपके अपने पाठ',
  'lessons.customHint': 'किसी भी पाठ को अपने लक्ष्यों के साथ पाठ बनाएँ।',
  'lessons.addCustom': 'पाठ जोड़ें',
  'lessons.noCustom': 'अभी कोई कस्टम पाठ नहीं।',
  'lessons.deleteCustom': 'पाठ हटाएँ',

  // Practice
  'practice.title': 'अभ्यास',
  'practice.subtitle':
    'कमज़ोर हिस्सों के लिए लक्षित अभ्यास। हर बार आपकी वर्तमान सेटिंग्स से नया अनुच्छेद बनता है।',

  // Trainer
  'trainer.title': 'ट्रेनर',
  'trainer.subtitle':
    'आपके ही परिणामों से बना लक्षित अभ्यास — जो ग़लत होता है, और जो आपको धीमा करता है।',
  'trainer.focus': 'अभ्यास का केंद्र',
  'trainer.accuracy': 'शुद्धता',
  'trainer.accuracyHint': 'जो कुंजियाँ और शब्द ग़लत होते हैं',
  'trainer.speed': 'गति',
  'trainer.speedHint': 'जो कुंजियाँ और जोड़ आपका समय लेते हैं',
  'trainer.startTargeted': 'लक्षित अभ्यास शुरू करें',
  'trainer.startRhythm': 'लय अभ्यास शुरू करें',
  'trainer.noMistakes':
    'अभी कोई ग़लती दर्ज नहीं। कुछ टेस्ट दें और आपके कमज़ोर हिस्से यहाँ दिखने लगेंगे।',
  'trainer.heatmap': 'कमज़ोर कुंजी हीटमैप',
  'trainer.confused': 'सबसे भ्रमित करने वाली कुंजियाँ',
  'trainer.missedWords': 'सबसे ज़्यादा छूटे शब्द',
  'trainer.rhythm': 'लय',
  'trainer.consistency': 'एकरूपता',
  'trainer.consistencyHint':
    'आपकी कुंजियों का समय कितना एक-सा है। तेज़ झोंके और फिर रुकावट यहाँ कम अंक पाते हैं — एक ही औसत गति पर लगातार लय, रुक-रुक कर चलने से बेहतर है।',
  'trainer.beat': 'कुंजियों के बीच {ms} ms · पूरी लय में {cpm} CPM',
  'trainer.slowestKeys': 'सबसे धीमी कुंजियाँ',
  'trainer.perFinger': 'प्रति उँगली समय',
  'trainer.perFingerHint':
    'प्रति उँगली दबाने का औसत समय। धीमी कनिष्ठा या अनामिका का अर्थ आम तौर पर यह है कि हाथ होम रो छोड़ रहा है।',
  'trainer.slowestPairs': 'सबसे धीमे जोड़',
  'trainer.slowestPairsHint':
    'जिन अक्षर-जोड़ों पर हाथ हिचकता है। लय अभ्यास इन्हें ही सुधारता है।',
  'trainer.noTiming': 'अभी समय का डेटा नहीं। एक टेस्ट पूरा करें और प्रति-कुंजी गति यहाँ दिखेगी।',
  'trainer.msToPress': 'दबाने में {ms} ms',
  'trainer.errorCount': '{count} त्रुटियाँ',
  'trainer.errorCountOne': '1 त्रुटि',
  'trainer.noErrors': 'कोई त्रुटि नहीं',
  'trainer.notMeasured': 'मापा नहीं गया',

  'practiceDesc.home_row': 'a-s-d-f / j-k-l-; कुंजियों पर उँगलियाँ जमाएँ।',
  'practiceDesc.top_row': 'ऊपर q-w-e-r-t / y-u-i-o-p तक पहुँच।',
  'practiceDesc.bottom_row': 'नीचे z-x-c-v-b / n-m कुंजियों तक पहुँच।',
  'practiceDesc.all_rows': 'तीनों पंक्तियों में उँगलियों की सीढ़ियाँ।',
  'practiceDesc.words': 'प्रवाह बनाने के लिए बार-बार आने वाले अंग्रेज़ी शब्द।',
  'practiceDesc.sentences': 'वास्तविक लय वाले पूरे वाक्य।',
  'practiceDesc.capitals': 'Title, ALL CAPS और CamelCase के लिए शिफ़्ट।',
  'practiceDesc.numbers': 'अंक-पंक्ति और संख्याओं की शुद्धता।',
  'practiceDesc.numpad': 'अंक, दशमलव और + - * / चिह्न।',
  'practiceDesc.symbols': 'विशेष चिह्न और प्रतीक।',
  'practiceDesc.punctuation': 'अल्पविराम, पूर्णविराम और अन्य चिह्न।',
  'practiceDesc.shortcuts': 'आपके सिस्टम के वास्तविक एडिटर शॉर्टकट।',

  'progress.emptyLong': 'अभी कोई टेस्ट नहीं। प्रगति दर्ज करने के लिए एक टेस्ट दें।',
  'progress.dayStreak': 'लगातार दिन',
  'progress.testsTaken': 'दिए गए टेस्ट',
  'progress.recentSpeed': 'हाल की गति (नेट WPM)',
  'progress.goalCount': '{done} / {goal} टेस्ट',
  'progress.goalDone': 'आज का लक्ष्य पूरा — शाबाश! 🎉',
  'progress.goalLeft': 'आज का लक्ष्य पूरा करने के लिए {count} और।',
  'progress.challenges': 'चुनौतियाँ',
  'progress.badgesTitle': 'उपलब्धियाँ',
  'progress.topRunsTitle': 'सर्वश्रेष्ठ प्रयास',

  // Achievements
  'badge.first': 'पहला क़दम',
  'badge.first.desc': 'अपना पहला टेस्ट पूरा करें',
  'badge.ten': 'रफ़्तार पकड़ी',
  'badge.ten.desc': '10 टेस्ट पूरे करें',
  'badge.fifty': 'लगनशील',
  'badge.fifty.desc': '50 टेस्ट पूरे करें',
  'badge.pass': 'उत्तीर्ण',
  'badge.pass.desc': 'एक टेस्ट उत्तीर्ण करें',
  'badge.wpm30': '30 WPM',
  'badge.wpm30.desc': '30 नेट WPM तक पहुँचें',
  'badge.wpm50': '50 WPM',
  'badge.wpm50.desc': '50 नेट WPM तक पहुँचें',
  'badge.wpm70': 'तेज़ रफ़्तार',
  'badge.wpm70.desc': '70 नेट WPM तक पहुँचें',
  'badge.perfect': 'निर्दोष',
  'badge.perfect.desc': '100% शुद्धता के साथ पूरा करें',
  'badge.streak3': 'क्रम बना',
  'badge.streak3.desc': '3 दिन लगातार अभ्यास',
  'badge.streak7': 'अजेय',
  'badge.streak7.desc': '7 दिन लगातार अभ्यास',
  'badge.newOne': '🏅 नई उपलब्धि:',
  'badge.newMany': '🏅 नई उपलब्धियाँ:',
  'badge.goalHit': '🎯 आज का लक्ष्य पूरा — शानदार निरंतरता!',

  'setup.partsApply': 'ये सेटिंग्स हर भाग पर लागू होती हैं।',
  'setup.partsRemaining':
    'शेष {count} अनुच्छेद एक के बाद एक चलेंगे, और जो भाग आप पूरा करेंगे वह याद रखा जाएगा।',
  'setup.partsLast': 'दस्तावेज़ का यह अंतिम अनुच्छेद है।',

  // Lessons
  'lessons.subtitleLong':
    'शुरुआत से उन्नत स्तर तक का रास्ता। अगला पाठ खोलने के लिए हर पाठ का गति और शुद्धता लक्ष्य पूरा करें।',
  'lessons.addNew': 'नया पाठ जोड़ें',
  'lessons.curriculumProgress': 'पाठ्यक्रम की प्रगति',
  'lessons.countOf': '{done} / {total} पाठ',
  'lessons.yourLessons': 'आपके पाठ',
  'lessons.authorHint':
    'किसी भी पाठ से अपना अभ्यास बनाएँ — अपना अनुच्छेद, पाठ्यक्रम का हिस्सा, या परीक्षा सामग्री। श्रेणी और लक्ष्य चुनें, फिर किसी भी पाठ की तरह अभ्यास करें।',
  'lessons.namePlaceholder': 'पाठ का नाम',
  'lessons.passagePlaceholder': 'अभ्यास के लिए अनुच्छेद चिपकाएँ या लिखें…',
  'lessons.category': 'श्रेणी',
  'lessons.targetWpm': 'लक्ष्य WPM',
  'lessons.targetAccuracy': 'लक्ष्य शुद्धता %',
  'lessons.addLesson': 'पाठ जोड़ें',
  'lessons.targetLine': 'लक्ष्य {wpm} WPM · {accuracy}%',

  'skill.beginner': 'शुरुआती',
  'skill.intermediate': 'मध्यम',
  'skill.advanced': 'उन्नत',

  // Result summary
  'summary.originalSpeed': 'कच्ची गति',
  'summary.netSpeed': 'नेट गति',
  'summary.grossWpm': 'ग्रॉस WPM',
  'summary.time': 'समय',
  'summary.characters': 'अक्षर',
  'summary.correctWords': 'सही शब्द',
  'summary.wrongWords': 'ग़लत शब्द',
  'summary.correctChars': 'सही अक्षर',
  'summary.incorrectChars': 'ग़लत अक्षर',
  'summary.backspaces': 'बैकस्पेस',
  'summary.deletes': 'डिलीट',
  'summary.readResult': 'परिणाम सुनें',

  // Mistake list
  'mistakes.none': 'कोई ग़लती नहीं — निर्दोष प्रयास! 🎉',
  'mistakes.youTyped': 'आपने लिखा',
  'mistakes.expected': 'अपेक्षित',
  'mistakes.type': 'प्रकार',

  // Charts
  'chart.noTimeline': 'इस टेस्ट के लिए समय-रेखा का डेटा नहीं।',
  'chart.perMinute': 'प्रति मिनट WPM और शुद्धता',
  'chart.title': 'समय के साथ गति और शुद्धता',

  // Settings
  'settings.title': 'सेटिंग्स',
  'settings.interfaceLanguage': 'ऐप की भाषा',
  'settings.interfaceHint': 'ऐप की अपनी भाषा। अनुच्छेद की भाषा हर टेस्ट में अलग चुनी जाती है।',
  'settings.defaultLanguage': 'डिफ़ॉल्ट भाषा',
  'settings.defaultProfile': 'डिफ़ॉल्ट परीक्षा प्रोफ़ाइल',
  'settings.defaultDifficulty': 'डिफ़ॉल्ट कठिनाई',
  'settings.inputMethod': 'देवनागरी इनपुट पद्धति',
  'settings.inputMethodHint':
    'फ़ोनेटिक में आप रोमन में लिखते हैं (जैसे namaste → नमस्ते)। इनस्क्रिप्ट कीबोर्ड को सरकारी मानक देवनागरी लेआउट में बदलता है, और रेमिंगटन GAIL टाइपराइटर लेआउट में। ये सभी हिन्दी और मराठी टेस्ट पर लागू होते हैं।',
  'settings.layoutMissing': ' — लेआउट डेटा स्थापित नहीं',
  'settings.font': 'देवनागरी फ़ॉन्ट',
  'settings.uploadFont': 'फ़ॉन्ट अपलोड करें (.ttf/.otf)',
  'settings.fontHint':
    'ऊपर फ़ॉन्ट चुनें, और यदि वह इंस्टॉल नहीं है तो उसकी .ttf/.otf फ़ाइल अपलोड करें। कृतिदेव ऑन-स्क्रीन कीबोर्ड के लेबल भी बदल देता है। फ़ॉन्ट ऐप में सुरक्षित रहते हैं और बैकअप के साथ जाते हैं।',
  'settings.behaviour': 'डिफ़ॉल्ट टेस्ट व्यवहार',
  'settings.onScreenKeyboard': 'ऑन-स्क्रीन कीबोर्ड',
  'settings.onScreenKeyboardHint':
    'रंगों से चिह्नित कीबोर्ड दिखाएँ जो अगली कुंजी और उँगली बताता है।',
  'settings.dailyGoal': 'दैनिक लक्ष्य',
  'settings.dailyGoalHint': 'रोज़ पूरे करने वाले टेस्ट।',
  'settings.dailyGoalAria': 'दैनिक लक्ष्य (टेस्ट में)',
  'settings.feedback': 'सूचनाएँ और प्रतिक्रिया',
  'settings.notifications': 'डेस्कटॉप सूचनाएँ',
  'settings.notificationsHint':
    'टेस्ट पूरा होने, समय समाप्त होने, या निष्क्रिय रहने पर सूचना दें।',
  'settings.noNotifications': 'यह ब्राउज़र सूचनाओं का समर्थन नहीं करता।',
  'settings.sounds': 'टाइपिंग ध्वनियाँ',
  'settings.soundsHint': 'हल्की कुंजी ध्वनि, त्रुटि का स्वर, और टेस्ट पूरा होने पर घंटी।',
  'settings.reminder': 'अभ्यास अनुस्मारक',
  'settings.reminderHint': 'तय समय पर रोज़ याद दिलाना, यदि आपने अभ्यास न किया हो।',
  'settings.reminderTime': 'अनुस्मारक का समय',
  'settings.reminderTimeHint': 'रोज़ किस समय याद दिलाया जाए।',
  'settings.reminderBlocked': 'Typly के लिए सूचनाएँ अवरुद्ध हैं, इसलिए अनुस्मारक दिख नहीं सकता।',
  'settings.reminderUnsupported': 'इस ब्राउज़र में सूचना समर्थन नहीं है।',
  'settings.reminderNotYet': 'सूचनाओं की अनुमति अभी नहीं है।',
  'settings.reminderFallbackTray':
    'अनुस्मारक फिर भी काम करता है: टेस्ट पूरा होने तक ट्रे आइकन अभ्यास को शेष दिखाता रहेगा।',
  'settings.reminderFallbackTab':
    'अनुस्मारक फिर भी काम करता है: टेस्ट पूरा होने तक ब्राउज़र टैब अभ्यास को शेष दिखाता रहेगा।',
  'settings.reminderHowToAllow':
    'पॉप-अप भी पाने के लिए अपने ब्राउज़र या सिस्टम सेटिंग्स में इस ऐप के लिए सूचनाओं की अनुमति दें।',
  'settings.reminderMissedTray':
    'चूक जाने पर Typly पूछता रहता है: {minutes} मिनट बाद दूसरी सूचना मिलती है, और टेस्ट पूरा होने तक ट्रे आइकन अभ्यास को शेष दिखाता है।',
  'settings.reminderMissedTab':
    'चूक जाने पर Typly पूछता रहता है: {minutes} मिनट बाद दूसरी सूचना मिलती है, और टेस्ट पूरा होने तक ब्राउज़र टैब अभ्यास को शेष दिखाता है।',
  'settings.backup': 'बैकअप और पुनर्स्थापना',
  'settings.backupHint':
    'अपना इतिहास और लाइब्रेरी JSON फ़ाइल में निर्यात करें, या किसी फ़ाइल से पुनर्स्थापित करें। पुनर्स्थापना आपके वर्तमान डेटा में जुड़ जाती है।',
  'settings.export': 'बैकअप निर्यात करें',
  'settings.exporting': 'निर्यात हो रहा है…',
  'settings.restore': 'बैकअप से पुनर्स्थापित करें',
  'settings.restoring': 'पुनर्स्थापित हो रहा है…',
  'settings.nothingToExport': 'अभी निर्यात करने योग्य कुछ नहीं — पहले एक टेस्ट दें।',

  // Profile card
  'profile.title': 'आपकी प्रोफ़ाइल',
  'profile.hint': 'केवल इस डिवाइस पर सहेजा जाता है। कुछ भी अपलोड नहीं होता।',
  'profile.name': 'नाम',
  'profile.namePlaceholder': 'आपका नाम',
  'profile.email': 'ईमेल',
  'profile.emailPlaceholder': 'you@example.com',
  'profile.unlocked': 'आपके ईमेल से खुल गया',
  'profile.locked': 'खोलने के लिए ईमेल जोड़ें',
  'profile.perkSessions': '{short} मिनट से लंबे सत्र — {long} मिनट तक',
  'profile.perkCertificate': 'प्रमाणपत्र को चित्र के रूप में सहेजना',
  'profile.perkExport': 'प्रगति रिपोर्ट निर्यात करना',
  'profile.save': 'प्रोफ़ाइल सहेजें',
  'profile.saved': 'सहेजा गया',

  'settings.fontLoaded': '{slot} के लिए {file} लोड हो गया',
  'settings.fontFailed': 'वह फ़ॉन्ट फ़ाइल लोड नहीं हो सकी।',

  // Detected-text panel
  'text.detected': 'पाठ मिल गया',
  'text.words': 'शब्द',
  'text.characters': 'अक्षर',
  'text.noSpaces': 'बिना स्पेस',
  'text.spaces': 'स्पेस',
  'text.fullStops': 'पूर्णविराम',
  'text.sentences': 'वाक्य',
  'text.lines': 'पंक्तियाँ',
  'text.paragraphs': 'अनुच्छेद',
  'text.digits': 'अंक',
  'text.punctuation': 'विराम चिह्न',
  'text.capitals': 'बड़े अक्षर',
  'text.avgWord': 'औसत शब्द',
  'text.replace': 'बदलें',

  // Paper mode entry
  'paperCard.title': 'काग़ज़ से टाइप कर रहे हैं?',
  'paperCard.body':
    'छपे काग़ज़ या किताब से पढ़ें और यहाँ टाइप करें। कुछ अपलोड करने की ज़रूरत नहीं — गति, शब्द-गणना, सुधार, और अंत में वर्तनी व व्याकरण की जाँच मिलती है।',
  'paperCard.start': 'काग़ज़ से टेस्ट शुरू करें',
  'paperCard.dashTitle': 'काग़ज़ से टाइप कर रहे हैं?',
  'paperCard.dashDesc': 'छपे काग़ज़ से पढ़ें और यहाँ टाइप करें — कुछ अपलोड नहीं करना।',

  // Sample + resume cards
  'sample.title': 'नमूना अनुच्छेद से आज़माएँ',
  'sample.body':
    '{title} · {chars} अक्षर। कुछ आयात करने की ज़रूरत नहीं — परीक्षा प्रोफ़ाइल चुनें और टाइप करना शुरू करें।',
  'sample.start': 'डेमो टेस्ट शुरू करें',
  'resume.title': 'अपूर्ण टेस्ट',
  'resume.left': '{title} · {ago} छोड़ा गया',
  'resume.resume': 'जारी रखें',
  'resume.discard': 'छोड़ दें',
  'resume.typedOf': '{total} में से {typed} अक्षर टाइप किए',

  // Ghost race
  'ghost.title': 'मुक़ाबला',
  'ghost.you': 'आप',
  'ghost.best': 'सर्वश्रेष्ठ · {wpm} WPM',
  'ghost.chars': '{value} अक्षर',

  // Replay player
  'replay.play': 'चलाएँ',
  'replay.pause': 'रोकें',
  'replay.again': 'फिर चलाएँ',
  'replay.backToStart': 'शुरुआत पर जाएँ',
  'replay.position': 'रीप्ले की स्थिति',
  'replay.speed': 'रीप्ले गति',
  'replay.close': 'रीप्ले बंद करें',
  'replay.none': 'इस प्रयास का कुंजी-लॉग दर्ज नहीं हुआ, इसलिए इसे चलाया नहीं जा सकता।',
  'replay.noPassage':
    'इस प्रयास का अनुच्छेद अब आपकी लाइब्रेरी में नहीं है, इसलिए इसे चलाया नहीं जा सकता।',
  'replay.summary': '{wpm} नेट WPM · {accuracy}% शुद्धता',

  // Paper report
  'paperReport.title': 'वर्तनी और व्याकरण',
  'paperReport.wordsTyped': 'आपके काग़ज़ से {words} शब्द टाइप किए',
  'paperReport.notChecked':
    'इस भाषा के लिए कोई शब्दकोश उपलब्ध नहीं था, इसलिए वर्तनी जाँची नहीं गई। ऊपर दी गई गति, शब्द और सुधार इससे अप्रभावित हैं।',
  'paperReport.clean':
    'कुछ भी चिह्नित नहीं — हर शब्द शब्दकोश में था और व्याकरण जाँच में कोई समस्या नहीं मिली।',
  'paperReport.notInDictionary': 'शब्दकोश में न मिले शब्द ({count})',
  'paperReport.properNouns':
    'नाम और तकनीकी शब्द भी यहाँ दिख सकते हैं — शब्दकोश को आपके काग़ज़ का सब कुछ नहीं पता।',
  'paperReport.grammar': 'व्याकरण ({count})',
  'paperReport.andMore': '…और {count} अन्य।',
  'paperReport.whatYouTyped': 'आपने क्या टाइप किया',

  // Tour
  'tour.step': 'चरण {current} / {total}',
  'tour.skip': 'छोड़ें',
  'tour.skipAria': 'परिचय छोड़ें',
  'tour.back': 'पीछे',
  'tour.next': 'आगे',
  'tour.gotIt': 'समझ गया',
  'tour.newTitle': 'अनुच्छेद से शुरू करें',
  'tour.newBody':
    'पाठ चिपकाएँ, या चित्र, PDF या दस्तावेज़ डालें — OCR आपकी मशीन पर चलता है। वही आपका टाइपिंग टेस्ट बन जाता है।',
  'tour.trainerTitle': 'कमज़ोरियों पर अभ्यास',
  'tour.trainerBody':
    'कुछ टेस्ट के बाद ट्रेनर आपके ही परिणामों से अभ्यास बनाता है: जो कुंजियाँ ग़लत होती हैं, और जो जोड़ आपका समय लेते हैं।',
  'tour.historyTitle': 'सुधार देखें',
  'tour.historyBody':
    'हर प्रयास अपनी ग़लतियों और पूरे रीप्ले के साथ सहेजा जाता है, जिससे आप देख सकें कि समय कहाँ गया।',

  // Confirm dialog
  'confirm.confirm': 'पुष्टि करें',
  'confirm.armed': 'हाँ, {action}',
  'confirm.armedHint': 'इसे पलटा नहीं जा सकता — पुष्टि के लिए दोबारा दबाएँ।',

  // Uploader
  'upload.paste': 'अनुच्छेद चिपकाएँ',
  'upload.pastePlaceholder': 'यहाँ पाठ चिपकाएँ…',
  'upload.usePasted': 'चिपकाया पाठ इस्तेमाल करें',
  'upload.wordsChars': '{words} शब्द · {chars} अक्षर',
  'upload.orUpload': 'या फ़ाइल अपलोड करें',
  'upload.dropHere': 'फ़ाइल यहाँ खींचकर छोड़ें, या एक चुनें:',
  'upload.formats': 'PNG · JPG · WebP · PDF · DOCX · TXT',
  'upload.image': 'चित्र',
  'upload.readingImage': 'चित्र पढ़ा जा रहा है (OCR)',
  'upload.readingPdf': 'PDF पढ़ा जा रहा है',
  'upload.readingDoc': 'दस्तावेज़ पढ़ा जा रहा है',
  'upload.verifyingAi': 'AI से जाँच हो रही है…',
  'upload.rereading': 'चित्र दोबारा पढ़ा जा रहा है…',
  'upload.aiSkipped': 'AI जाँच छोड़ी गई',
  'upload.onDeviceReady': 'डिवाइस पर निकाला गया (Tesseract) पाठ तैयार है।',
  'upload.continueOnDevice': 'डिवाइस के पाठ के साथ आगे बढ़ें',
  'upload.retryAi': 'AI फिर आज़माएँ',
  'upload.elapsed': 'बीता समय {time}',
  'upload.eta': 'अनुमानित ~{time}',
  'upload.preparing': 'तैयार हो रहा है…',
  'upload.aiSlow': 'AI पढ़ने में एक-दो मिनट लग सकते हैं — इसे खुला रखें। {seconds}s बीते।',
  'upload.secondsElapsed': '{seconds}s बीते।',
  'upload.dismiss': 'हटाएँ',
  'upload.errImage':
    'उस फ़ाइल से पाठ नहीं पढ़ा जा सका। ज़्यादा साफ़, गहरे अंतर वाला चित्र आज़माएँ, OCR भाषा बदलें — या सीधे पाठ चिपकाएँ / PDF अपलोड करें।',
  'upload.errFile': 'वह फ़ाइल नहीं पढ़ी जा सकी। कृपया पाठ चिपकाएँ, या दूसरी फ़ाइल आज़माएँ।',
  'upload.errText': 'वह पाठ फ़ाइल नहीं पढ़ी जा सकी। इसके बजाय पाठ चिपकाकर देखें।',
  'upload.errUnsupported':
    'यह फ़ाइल समर्थित नहीं। चित्र, PDF, .docx या .txt छोड़ें — या पाठ चिपकाएँ।',

  // OCR review
  'ocr.verify': 'निकाले गए पाठ की जाँच करें',
  'ocr.keepSelected': 'आगे बढ़ने पर चुना हुआ रहेगा; बाक़ी हटा दिए जाएँगे।',
  'ocr.quickPick': 'तुरंत चुनें:',
  'ocr.finalText': 'अंतिम पाठ',
  'ocr.continue': 'आगे बढ़ें',
  'ocr.cancel': 'रद्द करें',

  // AI settings
  'ai.title': 'AI सुविधाएँ',
  'ai.enable': 'AI सुविधाएँ चालू करें',
  'ai.enableHint':
    'बंद होने पर ऐप केवल अंतर्निहित ऑफ़लाइन प्रक्रिया इस्तेमाल करता है — डिवाइस पर OCR और व्याकरण, और AI कोच छिपा रहता है।',
  'ai.provider': 'प्रदाता',
  'ai.model': 'कोच और व्याकरण मॉडल',
  'ai.visionModel': 'विज़न मॉडल (चित्र OCR)',
  'ai.apiKey': 'API कुंजी',
  'ai.baseUrl': 'बेस URL (वैकल्पिक)',
  'ai.providerDefault': 'प्रदाता का डिफ़ॉल्ट',
  'ai.custom': 'कस्टम…',

  // Language tools
  'tools.title': 'भाषा उपकरण',
  'tools.grammar': 'व्याकरण जाँच',
  'tools.spell': 'वर्तनी जाँच इंजन',

  // Appearance
  'theme.title': 'रूप-रंग',
  'theme.colourTheme': 'रंग योजना',
  'theme.accent': 'उभार रंग',

  // Storage
  'storage.title': 'भंडारण और भाषा डेटा',

  // Grammar panel
  'grammar.title': 'व्याकरण और वर्तनी',

  // Progress chart
  'chart.needTwo': 'प्रगति की तुलना के लिए कम से कम दो टेस्ट दें।',
  'chart.firstTest': 'पहला टेस्ट',
  'chart.latestTest': 'नवीनतम टेस्ट',
  'chart.testsTaken': 'दिए गए टेस्ट',
  'chart.bestWpm': 'सर्वश्रेष्ठ WPM',
  'chart.averageWpm': 'औसत WPM',
  'chart.latestAccuracy': 'नवीनतम शुद्धता',
  'chart.acrossTests': 'सभी टेस्ट में नेट WPM और शुद्धता',

  // Coach
  'coach.title': 'AI कोच',
  'coach.weakness': 'मुख्य कमज़ोरी',
  'coach.keys': 'अभ्यास के लिए कुंजियाँ',
  'coach.exercise': 'अभ्यास',
  'coach.goal': 'अगला लक्ष्य',

  // Certificate
  'certificate.title': 'प्रमाणपत्र',
  'certificate.ready': 'आप उत्तीर्ण हुए — यह साझा करने योग्य प्रमाणपत्र है।',
  'certificate.locked':
    'आप उत्तीर्ण हुए। इसे चित्र के रूप में डाउनलोड करने के लिए सेटिंग्स में अपना ईमेल जोड़ें।',
  'certificate.nameAria': 'प्रमाणपत्र पर नाम',
  'certificate.download': 'प्रमाणपत्र डाउनलोड करें',

  // Dashboard action cards + how-it-works
  'dashboard.howItWorks': 'यह कैसे काम करता है',
  'dashboard.step1': 'अनुच्छेद जोड़ें',
  'dashboard.step1Desc': 'पाठ चिपकाएँ, या चित्र, PDF या .docx डालें।',
  'dashboard.step2': 'परीक्षा चुनें',
  'dashboard.step2Desc': 'बोर्ड, अवधि और भाषा चुनें।',
  'dashboard.step3': 'टाइप करें और समीक्षा करें',
  'dashboard.step3Desc': 'WPM, शुद्धता, और हर ग़लती श्रेणीबद्ध।',
  'dashboard.newTestTitle': 'नया टेस्ट शुरू करें',
  'dashboard.newTestDesc': 'पाठ चिपकाएँ या चित्र / PDF / दस्तावेज़ अपलोड करें।',
  'dashboard.practiceTitle': 'अभ्यास',
  'dashboard.practiceDesc': 'पंक्तियाँ, अंक, चिह्न और शॉर्टकट — हर बार नया।',

  // Landing extras
  'landing.subtitle':
    'कोई साइन-अप नहीं, कोई सेटअप नहीं। बस आपका नाम, ताकि ऐप जान सके किसे सिखा रहा है — आपके परिणाम इसी डिवाइस पर रहते हैं।',
  'landing.nameHint': 'आपके डैशबोर्ड पर दिखता है और प्रमाणपत्र पर छपता है।',
  'landing.emailHint':
    'लंबे सत्र, प्रमाणपत्र डाउनलोड और प्रगति निर्यात खोलता है। केवल इस डिवाइस पर सहेजा जाता है — कुछ भी भेजा नहीं जाता।',
  'landing.nameError': 'कृपया कम से कम दो अक्षर लिखें।',
  'landing.emailError': 'यह ईमेल पता नहीं लगता।',
  'landing.signInEmail': 'ईमेल से साइन इन करें',
  'landing.soon': 'जल्द',
  'landing.privacy':
    'खाते, क्लाउड सिंक और सदस्यता बैकएंड के साथ आएँगे। आज कुछ भी अपलोड नहीं होता।',

  // Results extras
  'result.nextIn': 'अगला टेस्ट {seconds}s में शुरू होगा…',
  'result.startNow': 'अभी शुरू करें',
  'result.stopSeries': 'श्रृंखला रोकें',
  'result.printHeading': 'Typly — टाइपिंग परिणाम',
  'result.seriesOf': 'श्रृंखला · टेस्ट {current} / {total}',
  'result.shareText': 'मैंने Typly पर {accuracy}% शुद्धता के साथ {wpm} नेट WPM हासिल किए।',
  'result.copied': 'क्लिपबोर्ड पर कॉपी हो गया',

  // Split panel
  'split.title': 'अनुच्छेदों में बाँटें',
  'split.length': 'अनुच्छेद की लंबाई',
  'split.split': 'बाँटें',
  'split.recut': 'दूसरी लंबाई पर फिर बाँटें:',
  'split.undo': 'बाँटना पूर्ववत करें',
  'split.partsCount': '{count} अनुच्छेद',
  'split.nextPart': 'अगला: भाग {index}',

  // New Test
  'newTest.title': 'नया टेस्ट',
  'newTest.subtitleEmpty':
    'अनुच्छेद चिपकाएँ या अपलोड करें, फिर आगे परीक्षा का प्रकार और भाषा चुनें। इमोजी स्वयं हट जाते हैं।',
  'newTest.subtitleReady': 'जो मिला उसकी समीक्षा करें, फिर आगे परीक्षा का प्रकार और भाषा चुनें।',
  'newTest.paragraphName': 'अनुच्छेद का नाम',
  'newTest.paragraphTitle': 'अनुच्छेद शीर्षक',
  'newTest.listen': 'सुनें',
  'newTest.showText': 'पाठ दिखाएँ और संपादित करें',
  'newTest.hideText': 'पाठ छिपाएँ',
  'newTest.required': 'आगे बढ़ने के लिए अनुच्छेद का पाठ आवश्यक है।',
  'newTest.saveContinue': 'सहेजें और आगे बढ़ें',
  'newTest.saving': 'सहेजा जा रहा है…',

  // Small controls
  'zoom.out': 'छोटा करें',
  'zoom.in': 'बड़ा करें',
  'zoom.reset': 'पाठ का आकार रीसेट करें',
  'exam.layoutAria': 'परीक्षा लेआउट',
  'exam.split': 'बँटा हुआ',
  'exam.stacked': 'एक के नीचे एक',
  'exam.blockedHint': 'जिन कुंजियों को परीक्षा नियमों ने रोका',
  'exam.resumedHint': 'जहाँ छोड़ा था वहीं से बहाल',
  'setup.durationAria': 'मनचाही अवधि (मिनट में)',
  'setup.readingAria': 'पढ़ने का समय (मिनट में)',
  'coach.analyzing': 'विश्लेषण हो रहा है…',
  'coach.tips': 'सुझाव',
  'grammar.noIssues': 'कोई समस्या नहीं मिली।',
  'grammar.firstRun':
    'डिवाइस पर चलने वाला व्याकरण मॉडल एक बार डाउनलोड होता है (कुछ MB) — पहली जाँच में थोड़ा समय लग सकता है।',
  'ocr.scanAgain': 'फिर स्कैन करें',
  'ocr.useThis': 'यही पाठ इस्तेमाल करें',
  'about.builtBy': 'निर्माता',
  'about.close': 'बंद करें',
  'storage.clearAll': 'ऐप का सारा डेटा मिटाएँ',
  'progress.challengeDone': 'चुनौती पूरी 🎉',
  'library.subtitleShort':
    'आपके सहेजे अनुच्छेद। चलाएँ, दोबारा टेस्ट दें, और प्रयासों की तुलना करें।',
  'common.loadingPage': 'पृष्ठ लोड हो रहा है',
  'common.restoringSession': 'सत्र बहाल हो रहा है',
  'common.restoringTest': 'आपका टेस्ट बहाल हो रहा है',
  'chart.netWpm': 'नेट WPM',
  'chart.accuracyPct': 'शुद्धता %',

  'storage.clearTitle': 'ऐप का सारा डेटा मिटाएँ?',
  'storage.clearBody':
    'आपका इतिहास, लाइब्रेरी, सेटिंग्स और डाउनलोड किया भाषा डेटा मिट जाएगा। इसे पलटा नहीं जा सकता।',
  'storage.clearConfirm': 'सब कुछ मिटाएँ',
  'newTest.saveSplit': 'सहेजें और {count} भागों में बाँटें',

  'result.fasterThanOne': 'आपके 1 पिछले प्रयास से {percent}% तेज़।',
  'result.replayHint':
    'प्रयास को दोबारा देखें और जानें कि समय कहाँ गया, न केवल ग़लतियाँ कहाँ हुईं।',
  'ai.visionHint':
    'अपलोड किए चित्रों से पाठ पढ़ता है। NVIDIA के Llama-3.2 विज़न मॉडल निःशुल्क हैं।',
  'lessons.practice': 'अभ्यास',
  'coach.settingsLink': 'सेटिंग्स',
  'chart.speed': 'गति',
  'chart.accuracyWord': 'शुद्धता',
  'landing.headline1': 'परीक्षा का अभ्यास करें,',
  'landing.headline2': 'केवल टाइपिंग का नहीं।',
  'landing.blurb':
    'किसी भी चित्र, PDF या अनुच्छेद को वास्तविक सरकारी परीक्षा जैसा टाइपिंग टेस्ट बनाएँ — फिर देखें कि कौन-सी ग़लतियाँ आपको कट-ऑफ से दूर रखती हैं।',
  'landing.liveScoring': 'लाइव स्कोरिंग',
  'chart.peak': 'शिखर {value}',

  'ai.keyHint':
    'अपनी कुंजी लाएँ — यह इसी डिवाइस पर सहेजी जाती है और केवल AI प्रदाता को भेजी जाती है। वैकल्पिक: कुंजी के बिना ऐप सामान्य रूप से चलता है, बस AI सुविधाएँ (कोच, AI व्याकरण, चित्र OCR) बंद रहती हैं।',
  'ai.show': 'दिखाएँ',
  'ai.hide': 'छिपाएँ',
  'brand.tagline': 'परीक्षा अभ्यास',

  'setup.modeAria': 'परीक्षा मोड',
  'setup.timingAria': 'समय पद्धति',
  'setup.difficultyAria': 'कठिनाई',

  // New drills
  'practice.bigrams': 'कठिन अक्षर-जोड़',
  'practice.alternating': 'बदलते हाथ',
  'practice.same_finger': 'एक ही उँगली की छलांग',
  'practice.long_words': 'लंबे शब्द',
  'practice.mixed': 'सब कुछ एक साथ',
  'practiceDesc.bigrams': 'जिन जोड़ों पर हाथ अटकता है: th, qu, ck, str।',
  'practiceDesc.alternating': 'हर कुंजी पर हाथ बदलने वाले शब्द — गति यहीं से आती है।',
  'practiceDesc.same_finger': 'कीबोर्ड की सबसे धीमी गति: एक ही उँगली, दो बार।',
  'practiceDesc.long_words': 'लंबे शब्द, जहाँ एक ग़लत अक्षर पूरा शब्द बिगाड़ देता है।',
  'practiceDesc.mixed': 'शब्द, अंक, चिह्न और प्रतीक एक ही प्रवाह में — असली अनुच्छेद जैसा।',

  // Drill difficulty chip
  'drill.easy': 'आसान',
  'drill.medium': 'मध्यम',
  'drill.hard': 'कठिन',
  'drill.veryHard': 'बहुत कठिन',

  // Release notes
  'whatsNew.title': 'नया क्या है',
  'whatsNew.lead': 'पिछली बार के बाद जो कुछ जुड़ा।',
  'whatsNew.version': 'संस्करण {version}',
  'whatsNew.dontShow': 'यह दोबारा न दिखाएँ',
  'whatsNew.close': 'बंद करें',

  // Changelog lines, newest release first (see i18n/changelog.ts)
  'changelog.countdown':
    'अपनी परीक्षा की तारीख़ डालें और देखें कि सुधार की मौजूदा रफ़्तार समय रहते कट-ऑफ़ पार कराती है या नहीं — रोज़ का रिमाइंडर भी अब यही बताता है।',
  'changelog.deviceSync':
    'अपने ही Wi-Fi पर कोड स्कैन करके दूसरे डिवाइस से सिंक करें — कोई खाता नहीं, कोई सर्वर नहीं।',
  'changelog.splash':
    'प्रगति पट्टी वाली शुरुआती स्क्रीन, ताकि ऐप खोलते ही कुछ दिखे।',
  'changelog.trayReminder':
    'ट्रे मेन्यू बताता है कि रोज़ का रिमाइंडर कब आना है, और आज भर के लिए छोड़ने भी देता है।',
  'changelog.loginItem': 'लॉगिन पर खुलें, ताकि रिमाइंडर आपको ऐप खोले बिना भी मिल जाए।',
  'changelog.dnd': 'बाधा न डालें: सेटिंग्स या ट्रे से हर सूचना रोक दें।',
  'changelog.sidebarLanguage': 'इंटरफ़ेस की भाषा सीधे साइडबार से बदलें।',
  'changelog.icons':
    'हर जगह सही आइकन: इंस्टॉलर, अनइंस्टॉलर, पूरा Linux आइकन सेट, और हर प्लैटफ़ॉर्म पर ब्रांड रंग वाली ट्रे।',
  'changelog.whatsNew': 'यही पैनल — हर रिलीज़ में क्या बदला, About से कभी भी खोलें।',
  'changelog.hindi': 'पूरा इंटरफ़ेस हिन्दी में, सेटिंग्स से चुनें।',
  'changelog.paperMode':
    'पेपर मोड: छपे अनुच्छेद से टाइप करें और फिर भी शब्द, त्रुटियाँ और वर्तनी जाँची जाएँ।',
  'changelog.examDay': 'परीक्षा-दिवस मोड: कोई साइडबार नहीं, कोई सूचना नहीं, कोई विराम नहीं।',
  'changelog.profile': 'डैशबोर्ड पर आपका नाम, और घड़ी के हिसाब से अभिवादन।',
  'changelog.splitter':
    'लंबे दस्तावेज़ हिस्सों में बँटते हैं, और हर प्रयास वहीं से चलता है जहाँ छोड़ा था।',
  'changelog.lessons': '31 पाठ, होम रो से 55 WPM न्यायालय मानक तक।',
  'changelog.drills': '17 अभ्यास ड्रिल, हर एक आसान से बहुत कठिन तक अंकित।',
  'changelog.timestamps': 'हर तारीख़ और समय एक ही तरह पढ़ा जाता है — पूर्वाह्न/अपराह्न और सेकंड सहित।',
  'changelog.accessibility': 'हर स्क्रीन पर कीबोर्ड, स्क्रीन-रीडर और कम-गति जाँच।',
  'changelog.openWith': 'कोई भी टेक्स्ट फ़ाइल, PDF या दस्तावेज़ Typly से खोलें और सीधे टाइप करें।',
  'changelog.firstRelease': 'पहली रिलीज़: किसी भी चित्र, PDF या अनुच्छेद को टाइपिंग टेस्ट बनाएँ।',
  'changelog.examScoring': 'आपकी परीक्षा के अनुसार अंकन, कट-ऑफ़ सहित।',
  'changelog.mistakes': 'हर ग़लती सूचीबद्ध — शब्द और कुंजी दोनों के हिसाब से।',
  'changelog.replay': 'रीप्ले, ताकि प्रयास को कुंजी-दर-कुंजी देखा जा सके।',
  'changelog.offline': 'बिना इंटरनेट चलता है, और आपका डेटा आपके डिवाइस पर ही रखता है।',

  // Local-network device sync
  'sync.title': 'दूसरे डिवाइस से सिंक करें',
  'sync.lead':
    'अपने टेस्ट, अनुच्छेद और सेटिंग्स उसी Wi-Fi पर दूसरे डिवाइस पर ले जाएँ जिस पर आप दोनों हैं। कुछ अपलोड नहीं होता — दोनों डिवाइस सीधे आपस में बात करते हैं।',
  'sync.start': 'पेयरिंग कोड दिखाएँ',
  'sync.starting': 'शुरू हो रहा है…',
  'sync.stop': 'पेयरिंग बंद करें',
  'sync.scan': 'दूसरे डिवाइस से इसे स्कैन करें, या उसके ब्राउज़र में यह पता लिखें।',
  'sync.qrLabel': 'पेयरिंग लिंक का QR कोड',
  'sync.closesIn': '{minutes} मिनट में बंद',
  'sync.closed': 'पेयरिंग बंद हो गई।',
  'sync.warning':
    'पेयरिंग खुली रहने तक, इस नेटवर्क पर जिसके पास लिंक है वह आपके डेटा की यह प्रति पढ़ सकता है।',
  'sync.desktopOnly': 'पेयरिंग के लिए डेस्कटॉप ऐप चाहिए — ब्राउज़र टैब से जुड़ा नहीं जा सकता।',
  'sync.offline': 'कोई नेटवर्क नहीं मिला। किसी Wi-Fi से जुड़कर दोबारा कोशिश करें।',
  'sync.unavailable': 'पेयरिंग शुरू नहीं हो सकी।',
  'sync.received': 'दूसरे डिवाइस से {tests} टेस्ट और {documents} अनुच्छेद मिले।',
  'sync.receiveFailed': 'बैकअप आया लेकिन पुनर्स्थापित नहीं हो सका।',

  // Storage card
  'storage.using': 'लगभग {size} उपयोग में',
  'storage.hint':
    'व्याकरण और वर्तनी शब्दकोश एक बार डाउनलोड होकर आपके डिवाइस पर रह जाते हैं, ताकि ऑफ़लाइन काम करें। जगह ख़ाली करने के लिए इन्हें कभी भी हटाएँ।',
  'storage.download': 'ऑफ़लाइन के लिए डाउनलोड करें',
  'storage.downloading': 'डाउनलोड हो रहा है…',
  'storage.downloaded': 'भाषा डेटा डाउनलोड हो गया — व्याकरण और वर्तनी अब ऑफ़लाइन काम करेंगे।',
  'storage.removeLang': 'भाषा डेटा हटाएँ',
  'storage.removing': 'हटाया जा रहा है…',
  'storage.removeTitle': 'भाषा डेटा हटाएँ?',
  'storage.removeBody':
    'डाउनलोड किया गया व्याकरण मॉडल और शब्दकोश हटा देता है। ज़रूरत पड़ने पर ये दोबारा डाउनलोड हो जाएँगे।',
  'storage.removeConfirm': 'हटाएँ',
  'storage.removed': 'डाउनलोड किया गया भाषा डेटा हटा दिया गया।',

  // Backup results
  'settings.exportedCount': '{tests} टेस्ट और {documents} अनुच्छेद निर्यात किए।',
  'settings.restoredCount': '{tests} टेस्ट और {documents} अनुच्छेद पुनर्स्थापित किए।',
  'settings.restoreFailed': 'पुनर्स्थापित नहीं हो सका: {error}',
  'settings.notABackup': 'यह Typly बैकअप फ़ाइल नहीं है',

  // Notifications
  'notify.timeUp': 'समय समाप्त',
  'notify.submitted': 'परीक्षा जमा हो गई',
  'notify.complete': 'टेस्ट पूरा',
  'notify.result': 'नेट WPM {wpm} · सटीकता {accuracy}%',
  'notify.idleTitle': 'आप हैं?',
  'notify.idleBody': 'टेस्ट के दौरान आपने कुछ देर कुछ नहीं टाइप किया।',
  'notify.awayTitle': 'आपने टेस्ट छोड़ दिया',
  'notify.awayBody': 'जारी रखने के लिए टैब पर लौटें।',
  'notify.badgeTitle': 'उपलब्धि मिली 🏅',
  'notify.goalTitle': 'आज का लक्ष्य पूरा 🎯',
  'notify.goalBody': 'आपने आज {count} टेस्ट पूरे किए।',

  // Leaving a locked exam
  'exam.leaveTitle': 'परीक्षा छोड़ें?',
  'exam.leaveBody': 'आपने परीक्षा विंडो छोड़ दी। छोड़ने पर आपका टेस्ट अभी जमा हो जाएगा।',
  'exam.leaveConfirm': 'अभी जमा करें',
  'exam.leaveCancel': 'जारी रखें',

  // Do not disturb
  'settings.dnd': 'बाधा न डालें',
  'settings.dndHint': 'जब तक आप इसे बंद न करें, हर सूचना — अभ्यास रिमाइंडर सहित — रोक दी जाएगी।',
  'settings.dndOn': 'सूचनाएँ रोकी जा रही हैं। रिमाइंडर याद है और इसे बंद करने पर फिर चालू हो जाएगा।',

  'nav.language': 'भाषा',

  // Exam countdown and readiness forecast
  'countdown.setTitle': 'आपकी परीक्षा कब है?',
  'countdown.setLead':
    'तारीख़ डालें और Typly उसकी उलटी गिनती करेगा — और बताएगा कि सुधार की आपकी मौजूदा रफ़्तार समय रहते कट-ऑफ़ पार कराती है या नहीं।',
  'countdown.exam': 'परीक्षा',
  'countdown.date': 'परीक्षा की तारीख़',
  'countdown.lang': 'टाइपिंग भाषा',
  'countdown.save': 'तारीख़ सेट करें',
  'countdown.cancel': 'रद्द करें',
  'countdown.change': 'बदलें',
  'countdown.clear': 'हटाएँ',
  'countdown.badDate': 'अगले कुछ वर्षों के भीतर की तारीख़ चुनें।',
  'countdown.daysLeft': '{days} दिन बचे',
  'countdown.tomorrow': 'कल',
  'countdown.today': 'आज',
  'countdown.gone': 'परीक्षा का दिन बीत चुका',
  'countdown.yourSpeed': 'आपकी गति',
  'countdown.yourAccuracy': 'आपकी सटीकता',
  'countdown.trend': 'रुझान',
  'countdown.perDay': 'WPM प्रतिदिन',
  'countdown.needed': '{value} चाहिए',
  'countdown.verdictReady': 'आप कट-ऑफ़ पार कर चुके हैं। इसे बनाए रखें — रोज़ एक टेस्ट काफ़ी है।',
  'countdown.verdictOnTrack':
    'इस रुझान पर आप {date} के आसपास कट-ऑफ़ पार कर लेंगे — यानी लगभग {days} दिन में, परीक्षा से पहले।',
  'countdown.verdictBehind':
    'यह रुझान समय रहते कट-ऑफ़ तक नहीं पहुँचता। आप {wpm} WPM पीछे हैं, यानी यहाँ से लगभग +{perDay} WPM प्रतिदिन चाहिए।',
  'countdown.verdictNoData':
    'इस परीक्षा की भाषा में एक टेस्ट दें, तभी कट-ऑफ़ के मुक़ाबले आपकी स्थिति दिखेगी।',
  'countdown.verdictPassed': 'वह तारीख़ बीत गई। नई उलटी गिनती शुरू करने के लिए अगली तारीख़ डालें।',
  'countdown.habit': 'रोज़ लगभग {minutes} मिनट, पिछले 14 में से {days} दिन।',
  'countdown.habitNone': 'पिछले दो हफ़्तों में कोई अभ्यास नहीं — पूर्वानुमान मानता है कि आप फिर शुरू करेंगे।',

  // Exam mode / drill additions
  'examMode.strict': 'सख़्त',
  'practice.data_entry': 'डेटा एंट्री (तालिका)',
  'practiceDesc.data_entry':
    'रोल नंबर, नाम, तारीख़ और राशि की एक रजिस्टर — Tab से अलग किए फ़ील्ड। DEST या DEO पद का असली काम यही है।',

  // Dictation (Stenographer skill test)
  'dictation.heading': 'स्टेनोग्राफ़र कौशल परीक्षा',
  'dictation.title': '{wpm} शब्द प्रति मिनट की श्रुतलेख',
  'dictation.subtitle':
    'गद्यांश {wpm} WPM की गति से बोला जाएगा। स्क्रीन पर कुछ नहीं दिखेगा। समाप्त होने पर उसे टाइप करने के लिए {minutes} मिनट मिलेंगे।',
  'dictation.progress': 'श्रुतलेख',
  'dictation.chunkOf': 'अंश {current} / {total}',
  'dictation.words': 'कुल {words} शब्द।',
  'dictation.ready': 'सुनने के लिए तैयार हों तो प्ले दबाएँ।',
  'dictation.listening': 'सुन रहे हैं — गद्यांश बोला जा रहा है।',
  'dictation.finished': 'श्रुतलेख पूरा। अब टाइप करना शुरू करें।',
  'dictation.start': 'श्रुतलेख शुरू करें',
  'dictation.resume': 'जारी रखें',
  'dictation.pause': 'रोकें',
  'dictation.repeat': 'फिर बोलें',
  'dictation.skip': 'सीधे टाइपिंग पर जाएँ',
  'dictation.skipToTyping': 'इसकी जगह टाइप करें',
  'dictation.beginTranscription': 'टाइप करना शुरू करें',
  'dictation.unsupportedTitle': 'कोई स्पीच वॉइस उपलब्ध नहीं',
  'dictation.unsupportedBody':
    'इस डिवाइस में टेक्स्ट-टू-स्पीच वॉइस नहीं है, इसलिए गद्यांश बोला नहीं जा सकता। आप इसे सामान्य टाइपिंग टेस्ट की तरह चला सकते हैं।',
  'dictation.badge': '{wpm} WPM पर श्रुतलेख',

  // Cut-off pacer
  'pacer.title': 'कट-ऑफ़ गति · {wpm} WPM',
  'pacer.you': 'आप',
  'pacer.cutoff': 'पास लाइन ({wpm} WPM)',
  'pacer.ahead': '{seconds}से. की बढ़त',
  'pacer.behind': '{seconds}से. पीछे',
  'pacer.hintAhead': 'आप पास लाइन से ऊपर हैं। यही गति बनाए रखें तो निकल जाएँगे।',
  'pacer.hintBehind': 'इस गति से आप पास नहीं होते। यह निशान कट-ऑफ़ है, कोई प्रतियोगी नहीं।',
  'pacer.toggle': 'कट-ऑफ़ के मुक़ाबले गति',
  'pacer.toggleHint':
    'एक निशान ठीक परीक्षा की न्यूनतम गति से चलता है। उससे पीछे रह गए तो आप फ़ेल होते — इसके लिए पिछले प्रयास की ज़रूरत नहीं।',

  // Pressure mode
  'pressure.rank': 'रैंक {rank} / {of}',
  'pressure.hint': 'परीक्षा हॉल जैसी स्थिति',
  'pressure.warning': '{seconds}से. बचे',
  'pressure.urgent': 'केवल {seconds}से. बचे',
  'pressure.toggle': 'दबाव मोड',
  'pressure.toggleHint':
    'अंत में चमकती घड़ी, लाइव रैंक और हॉल का शोर। परीक्षा के दिन घबराहट में लोग 5–8 WPM खो देते हैं और उसका अभ्यास कहीं नहीं होता।',

  // Exam software skin
  'skin.section': 'टाइपिंग कौशल परीक्षा',
  'skin.candidate': 'अभ्यर्थी',
  'skin.timeLeft': 'शेष समय',
  'skin.footer': 'इस विंडो को रीफ़्रेश या बंद न करें। आपका उत्तर स्वतः सहेजा जा रहा है।',
  'skin.label': 'परीक्षा स्क्रीन',
  'skin.modern': 'Typly',
  'skin.examClient': 'परीक्षा सॉफ़्टवेयर',
  'skin.hint':
    'परीक्षा-सॉफ़्टवेयर स्किन असली टेस्ट क्लाइंट की नक़ल करती है — अभ्यर्थी हेडर, बॉक्स में गद्यांश, सादा इनपुट, कोने में घड़ी। नियम दोनों में एक जैसे रहते हैं।',

  // Pre-flight checks
  'preflight.title': 'शुरू करने के लिए तैयार',
  'preflight.titleBlocked': 'शुरू करने से पहले इन्हें ठीक करें',
  'preflight.capsLock.ok': 'Caps Lock बंद है',
  'preflight.capsLock.bad': 'Caps Lock — जाँचने के लिए कोई कुंजी दबाएँ, या इसे बंद करें',
  'preflight.inputMethod.ok': 'सिस्टम इनपुट मेथड बाधा नहीं डालेगा',
  'preflight.inputMethod.bad':
    'आपका सिस्टम देवनागरी इनपुट मेथड पर है — उसे अंग्रेज़ी करें, वरना लेआउट टकराएगा',
  'preflight.font.ok': 'चुना गया हिंदी फ़ॉन्ट लोड है',
  'preflight.font.bad': 'चुने गए हिंदी फ़ॉन्ट के लिए कोई फ़ाइल अपलोड नहीं — गद्यांश ठीक नहीं दिखेगा',
  'preflight.layoutData.ok': 'कीबोर्ड लेआउट डेटा स्थापित है',
  'preflight.layoutData.bad': 'इस इनपुट मेथड का लेआउट डेटा मौजूद नहीं है',
  'preflight.keyboardLayout.ok': 'कीबोर्ड लेआउट गद्यांश से मेल खाता है',
  'preflight.keyboardLayout.bad': 'अंग्रेज़ी टेस्ट के लिए देवनागरी लेआउट सक्रिय लगता है',
  'preflight.fullscreen.ok': 'पूर्ण स्क्रीन',
  'preflight.fullscreen.bad': 'पूर्ण स्क्रीन नहीं — असली क्लाइंट पूरी स्क्रीन भरता है',

  // Data-entry (KDPH)
  'dataEntry.title': 'स्रोत रजिस्टर',
  'dataEntry.kdph': 'KDPH',
  'dataEntry.hint': 'हर फ़ील्ड भरें, फिर Tab दबाएँ। नई पंक्ति अगला रिकॉर्ड शुरू करती है।',

  // Breaks
  'breaks.done': 'हो गया',
  'breaks.toggle': 'विराम अनुस्मारक',
  'breaks.toggleHint':
    'हर 20 मिनट पर 20-20-20 आँखों का विराम और हर 30 मिनट पर कलाई की याद। टेस्ट के दौरान कभी नहीं। महीनों के रोज़ अभ्यास से ही टाइपिंग की चोटें आती हैं।',

  'briefing.kdphCutoff': '{value} की-डिप्रेशन/घंटा',
  'briefing.dictationTitle': 'यह टेस्ट {wpm} WPM की श्रुतलेख से शुरू होता है',
  'briefing.dictationBody':
    'गद्यांश {wpm} शब्द प्रति मिनट की गति से बोला जाएगा और स्क्रीन पर नहीं दिखेगा। उसके बाद उसे टाइप करने के लिए {minutes} मिनट मिलेंगे।',

  // Multi-section mock papers
  'paper.title': 'बहु-खंड पेपर',
  'paper.hint':
    'CPCT और कई राज्य परीक्षाएँ एक ही बैठक में दो भाषाओं की परीक्षा लेती हैं। पेपर इन खंडों को एक ही रन में जोड़ देता है और एक संयुक्त रिपोर्ट देता है — भाषा बदलने का वह क्षण भी शामिल, जहाँ अभ्यर्थी असल में अंक खोते हैं।',
  'paper.start': 'पेपर शुरू करें',
  'paper.missing': 'गद्यांश चाहिए',
  'paper.needPassage': 'पहले इस पेपर की प्रत्येक भाषा में एक गद्यांश लाइब्रेरी में सहेजें।',
  'paper.reportTitle': 'पेपर रिपोर्ट',
  'paper.section': 'खंड',
  'paper.average': 'औसत',
  'paper.cleared': 'हर खंड ने अपना कट-ऑफ़ पार किया।',
  'paper.notCleared': 'पेपर तभी पास होता है जब हर खंड पास हो — {section} रह गया।',
  'paper.incomplete': 'यह पेपर अभी पूरा नहीं हुआ।',

  'setup.targetKdph': ' · लक्ष्य {kdph} की-डिप्रेशन/घंटा, {accuracy}% शुद्धता पर',
  'setup.dictationLabel': 'श्रुतलेख',
  'setup.dictationToggle': 'पहले गद्यांश {wpm} WPM पर बोला जाए',
  'setup.dictationHint':
    'असली कौशल परीक्षा में गद्यांश {wpm} शब्द प्रति मिनट की गति से बोला जाता है, फिर उसे टाइप करने के लिए {minutes} मिनट मिलते हैं। इसे बंद करने पर यह सामान्य टाइपिंग टेस्ट बन जाता है।',
  'setup.pacing': 'गति और दबाव',

  // Mistake taxonomy
  'taxonomy.title': 'ग़लती किस तरह हुई',
  'taxonomy.verdict': 'आपकी ज़्यादातर ग़लतियाँ ({share}%) {kind} थीं। इसका इलाज एकदम विशेष है।',
  'mistakeKind.transposition': 'अक्षर उलट जाना',
  'mistakeKind.doubling': 'कुंजी दो बार दबना',
  'mistakeKind.omission': 'अक्षर छूट जाना',
  'mistakeKind.substitution': 'ग़लत अक्षर',
  'mistakeKind.shift': 'Shift और केस',
  'mistakeKind.spacing': 'स्पेस',
  'mistakeKind.other': 'अन्य',
  'mistakeFix.transposition':
    'दो अक्षर आपस में बदल गए — हाथ आँखों से आगे चल रहे हैं। एक ड्रिल अपनी अधिकतम गति के 80% पर करें; शुद्धता से पहले यही ग़लती ख़त्म होती है।',
  'mistakeFix.doubling':
    'कुंजी दो बार चली। आमतौर पर हल्का, टिका हुआ स्पर्श — या अटकती कुंजी। अगर हर बार वही अक्षर हो तो कीबोर्ड जाँच चलाएँ।',
  'mistakeFix.omission':
    'अक्षर पड़ा ही नहीं। यह जानकारी की नहीं, दबाव की समस्या है: उँगली हिली पर कुंजी पूरी नहीं दबी।',
  'mistakeFix.substitution':
    'सही कुंजी के बजाय पड़ोस की या उसी उँगली की कुंजी। ट्रेनर की "भ्रमित जोड़ी" ड्रिल ठीक इसी के लिए है।',
  'mistakeFix.shift':
    'अक्षर सही, केस ग़लत। Shift को अक्षर के बाद ही छोड़ें, और शुरू करने से पहले Caps Lock जाँच लें।',
  'mistakeFix.spacing':
    'स्पेस छूटा या ग़लत जगह पड़ा। लंबे गद्यांश में अंगूठे सुस्त हो जाते हैं — स्पेस बार एक कीस्ट्रोक है, विराम नहीं।',
  'mistakeFix.other': 'यहाँ कोई एक पैटर्न नहीं दिखा। नीचे की सूची में अलग-अलग शब्द हैं।',

  // Cost of backspace
  'backspace.title': 'सुधार की क़ीमत',
  'backspace.none': 'कोई सुधार नहीं — कुछ दोबारा नहीं टाइप हुआ। यही आदत बनाए रखें।',
  'backspace.verdict': 'सुधारों में लगभग {seconds} सेकंड गए — यानी करीब {wpm} WPM।',
  'backspace.corrections': 'सुधार',
  'backspace.share': 'कीस्ट्रोक का {share}%',
  'backspace.timeLost': 'गया समय',
  'backspace.each': 'प्रत्येक ~{ms}मि.से.',
  'backspace.wpmCost': 'WPM का नुक़सान',
  'backspace.wpmHint': 'वापस पाया जा सकता',
  'backspace.retyped': 'दोबारा टाइप',
  'backspace.retypedHint': 'अक्षर जो दो बार पड़े',
  'backspace.adviceHabit':
    'यह "बाद में ठीक कर लेंगे" की आदत है, और 35 WPM वाला टाइपिस्ट 30 क्यों पाता है — इसका सबसे आम कारण यही है। ग़लती के बावजूद आगे टाइप करें और गद्यांश ख़त्म होने तक कुछ न सुधारें; नेट गति लगभग हमेशा बढ़ती है।',
  'backspace.adviceFine':
    'थोड़ा सुधार ठीक है। ध्यान तभी दें जब यह आपके कीस्ट्रोक के लगभग 5% से ऊपर जाए।',

  // Key depressions per hour
  'kdph.title': 'की-डिप्रेशन प्रति घंटा',
  'kdph.verdictMet': 'आप आवश्यक {target} से {value} डिप्रेशन/घंटा ऊपर हैं।',
  'kdph.verdictShort': 'आप आवश्यक {target} से {value} डिप्रेशन/घंटा पीछे हैं।',
  'kdph.achieved': 'प्राप्त',
  'kdph.required': 'आवश्यक',
  'kdph.perHour': 'प्रति घंटा',
  'kdph.depressions': 'डिप्रेशन',
  'kdph.depressionsHint': 'कुल दबाई गई कुंजियाँ',
  'kdph.asWpm': 'बराबर',
  'kdph.asWpmHint': 'WPM · कट-ऑफ़ {value}',
  'kdph.explainCounted': 'हर कुंजी गिनी जाती है — सुधार भी',
  'kdph.explainAccuracy': 'शुद्धता फिर भी {accuracy}% चाहिए',

  // Shareable result card
  'share.title': 'अपना परिणाम साझा करें',
  'share.hint':
    'WhatsApp और Instagram के नाप का वर्गाकार कार्ड — आपकी गति, शुद्धता और स्ट्रीक, और कुछ नहीं।',
  'share.share': 'साझा करें',
  'share.download': 'इमेज सहेजें',
  'share.nameAria': 'कार्ड पर छपने वाला नाम',
  'share.downloadedInstead': 'यह डिवाइस सीधे इमेज साझा नहीं कर सकता, इसलिए कार्ड सहेज दिया गया।',

  // Finger load and travel
  'fingers.title': 'उँगलियों का भार और गति-पथ',
  'fingers.verdictOverload':
    'आपकी {hand} {finger} उँगली {share}% काम कर रही है। पठार (plateau) की असली यांत्रिक वजह यही है, और यह बस ज़्यादा टाइप करने से नहीं सुधरेगी।',
  'fingers.verdictSkew':
    'आपका {hand} हाथ {share}% कीस्ट्रोक उठा रहा है। अंग्रेज़ी में कुछ असंतुलन सामान्य है; इतना असंतुलन आमतौर पर होम पोज़िशन खिसक जाने का संकेत है।',
  'fingers.verdictBalanced': 'भार दोनों हाथों में समान रूप से बँटा है। यहाँ सुधारने को कुछ नहीं।',
  'fingers.finger': 'उँगली',
  'fingers.presses': 'दबाव',
  'fingers.travel': 'गति-पथ',
  'fingers.errorRate': 'ग़लतियाँ',
  'fingers.travelNote':
    'गति-पथ कुंजी-चौड़ाई में मापा गया है, इसलिए ये अंक उँगलियों की तुलना करते हैं, सेंटीमीटर नहीं नापते। कम दबाव के साथ ऊँचा अंक बताता है कि एक उँगली उन कुंजियों तक जा रही है जो दूसरी उँगली की हैं।',
  'finger.pinky': 'कनिष्ठा',
  'finger.ring': 'अनामिका',
  'finger.middle': 'मध्यमा',
  'finger.index': 'तर्जनी',
  'finger.thumb': 'अंगूठा',
  'hand.left': 'बायाँ',
  'hand.right': 'दायाँ',

  // Challenge files
  'challenge.title': 'किसी मित्र को चुनौती दें',
  'challenge.hint':
    'यह गद्यांश और आपका स्कोर एक छोटी .typly फ़ाइल में सहेजता है। जो इसे खोलेगा वही गद्यांश उन्हीं नियमों पर टाइप करेगा और आमने-सामने का परिणाम पाएगा — कोई खाता नहीं, कोई सर्वर नहीं।',
  'challenge.export': 'चुनौती फ़ाइल सहेजें',
  'challenge.youWon': 'यह चुनौती आपने जीती',
  'challenge.youLost': 'इस बार नहीं',
  'challenge.you': 'आप',
  'challenge.challenger': 'चुनौती देने वाला',
  'challenge.margin': 'आप दोनों के बीच {wpm} WPM और {accuracy} प्रतिशत अंक का अंतर।',
  'challenge.sendBack': 'उन्हें वापस चुनौती दें',
  'challenge.incomingTitle': 'एक चुनौती प्रतीक्षा में है',
  'challenge.incomingBody':
    '{name} ने यह गद्यांश {wpm} WPM पर {accuracy}% शुद्धता से टाइप किया। वही गद्यांश, वही नियम, वही घड़ी।',
  'challenge.accept': 'चुनौती स्वीकारें',
  'challenge.decline': 'अभी नहीं',

  // Longitudinal heatmap
  'longitudinal.title': '{days} दिनों में कमज़ोर कुंजियाँ',
  'longitudinal.subtitle':
    'पिछले {days} दिनों के {runs} प्रयास, उससे पहले के {days} दिनों के मुक़ाबले — जिससे पता चले कि जिस कुंजी पर आप काम कर रहे हैं वह सुधर रही है या नहीं।',
  'longitudinal.empty':
    'पिछले {days} दिनों में कोई प्रयास नहीं। इस चार्ट को तुलना के लिए इतिहास चाहिए, जो अभ्यास के साथ बनता जाएगा।',
  'longitudinal.keyErrors': 'इस अवधि में {count} ग़लतियाँ',
  'longitudinal.noErrors': 'कोई ग़लती नहीं',
  'longitudinal.healing': 'सुधर रही हैं',
  'longitudinal.healingHint': 'पिछली अवधि से कम ग़लतियाँ।',
  'longitudinal.worsening': 'बिगड़ रही हैं',
  'longitudinal.worseningHint': 'पिछली अवधि से ज़्यादा ग़लतियाँ — इन पर लक्षित ड्रिल करें।',
  'longitudinal.noneHealing': 'अभी मापने योग्य कोई सुधार नहीं।',
  'longitudinal.noneWorsening': 'कुछ बिगड़ नहीं रहा। अच्छा है।',

  // Fatigue curve
  'fatigue.title': 'क्या आप थक जाते हैं?',
  'fatigue.empty':
    'इसके लिए तीन मिनट या उससे लंबे कुछ प्रयास चाहिए। छोटी ड्रिल में तुलना के लिए अंतिम मिनट ही नहीं होता।',
  'fatigue.verdictFading':
    '{runs} प्रयासों में आप पहले और अंतिम मिनट के बीच लगभग {drop} WPM ({pct}%) खो देते हैं। 10 मिनट का टेस्ट अधिकतम गति से नहीं, इसी से फ़ेल होता है।',
  'fatigue.verdictSteady':
    '{runs} प्रयासों में आपकी गति अंत तक बनी रहती है। सहनशक्ति आपकी सीमा नहीं है।',
  'fatigue.firstMinute': 'पहला मिनट',
  'fatigue.lastMinute': 'अंतिम मिनट',
  'fatigue.change': 'बदलाव',
  'fatigue.minute': 'मिनट {minute}',
  'fatigue.samples': '{count} प्रयास',
  'fatigue.advice':
    'अगर आप थकते हैं तो परीक्षा से तेज़ नहीं, परीक्षा से लंबा अभ्यास करें: एक 15 मिनट का रन तीन 5 मिनट के रन से ज़्यादा सहनशक्ति बनाता है।',

  // Retroactive eligibility
  'eligibility.title': 'आप कौन-सा पद निकाल सकते हैं?',
  'eligibility.subtitle':
    'आपके सभी {attempts} प्रयास, सभी 13 परीक्षा प्रोफ़ाइलों पर फिर से जाँचे गए। {cleared} आप अभी पास करते हैं।',
  'eligibility.empty':
    'एक टेस्ट दें और यह आपके पूरे इतिहास को हर परीक्षा प्रोफ़ाइल पर जाँचेगा — उन पर भी जो आपने कभी चुनी नहीं।',
  'eligibility.cleared': 'ये आप पास करते हैं',
  'eligibility.clearedHint': 'इस परीक्षा की भाषा में आपके सर्वश्रेष्ठ प्रयास ने दोनों कट-ऑफ़ पार किए।',
  'eligibility.close': 'पहुँच में',
  'eligibility.closeHint': 'कुछ ही WPM दूर। अगला निशाना यही होना चाहिए।',
  'eligibility.far': 'अभी नहीं',
  'eligibility.farHint': 'और दूर, या इस परीक्षा की भाषा में अभी कोई प्रयास नहीं।',
  'eligibility.noneCleared': 'अभी कोई नहीं — ऊपर की सूची बताती है कि सबसे नज़दीक क्या है।',
  'eligibility.noneClose': 'इस समय कुछ सीमारेखा पर नहीं है।',
  'eligibility.noneFar': 'कुछ भी पहुँच से बाहर नहीं।',
  'eligibility.met': 'पास',
  'eligibility.wpmShort': '{value} WPM पीछे',
  'eligibility.kdphShort': '{value} KDPH पीछे',
  'eligibility.accuracyShort': '{value}% शुद्धता पीछे',
  'eligibility.repeatable': '{runs} अलग-अलग प्रयासों में पास — यह संयोग नहीं, दोहराने योग्य है।',
  'eligibility.onceOnly': '{runs} बार पास। भरोसा करने से पहले दो बार और कर लें।',
  'eligibility.bestSoFar': 'अब तक सर्वश्रेष्ठ: {wpm} WPM, {accuracy}% पर।',

  // Monthly recap
  'recap.title': 'आपका {month}',
  'recap.empty': 'उस महीने कोई अभ्यास दर्ज नहीं।',
  'recap.subtitleFirst': '{tests} टेस्ट और कीबोर्ड पर {hours} घंटे। यह आपका पहला पूरा महीना है।',
  'recap.subtitleUp': '{tests} टेस्ट, {hours} घंटे, और पिछले महीने से {gained} WPM तेज़।',
  'recap.subtitleDown': '{tests} टेस्ट और {hours} घंटे। आपका औसत पिछले महीने से {gained} WPM कम रहा।',
  'recap.hours': 'घंटे',
  'recap.hoursHint': 'कीबोर्ड पर',
  'recap.tests': 'टेस्ट',
  'recap.passed': '{count} पास',
  'recap.best': 'सर्वश्रेष्ठ WPM',
  'recap.average': 'औसत {value}',
  'recap.activeDays': 'सक्रिय दिन',
  'recap.bestStreak': 'सर्वोत्तम स्ट्रीक {count}',
  'recap.bestDay': 'सर्वश्रेष्ठ दिन',
  'recap.bestDayValue': '{date} — {tests} टेस्ट, सर्वश्रेष्ठ {wpm} WPM',
  'recap.gained': 'पिछले महीने के मुक़ाबले',
  'recap.gainedUp': 'औसतन {value} WPM तेज़',
  'recap.gainedDown': 'औसतन {value} WPM धीमे',
  'recap.keysFixed': 'सुधरी हुई कुंजियाँ',

  // Tools page
  'nav.tools': 'साधन',
  'toolbox.title': 'साधन',
  'toolbox.subtitle':
    'कृति देव कनवर्टर और कीबोर्ड जाँच — दोनों ऑफ़लाइन, क्योंकि दोनों की ज़रूरत उन मशीनों पर पड़ती है जो आपकी नहीं हैं।',

  // Kruti Dev converter
  'krutidev.title': 'कृति देव ⇄ यूनिकोड',
  'krutidev.hint':
    'पुराने कृति देव पाठ को यूनिकोड देवनागरी में और वापस बदलें। पूरी तरह इसी डिवाइस पर चलता है — कुछ अपलोड नहीं होता, जो सरकारी दस्तावेज़ के मामले में अहम है।',
  'krutidev.toUnicode': 'कृति देव → यूनिकोड',
  'krutidev.toKrutiDev': 'यूनिकोड → कृति देव',
  'krutidev.directionAria': 'बदलने की दिशा',
  'krutidev.detect': 'पहचानें',
  'krutidev.detectHint': 'चिपकाए गए पाठ से दिशा चुनें।',
  'krutidev.clear': 'साफ़ करें',
  'krutidev.input': 'इनपुट',
  'krutidev.output': 'परिणाम',
  'krutidev.outputEmpty': 'बदला हुआ पाठ यहाँ दिखेगा।',
  'krutidev.copy': 'कॉपी',
  'krutidev.copied': 'कॉपी हो गया',
  'krutidev.placeholderLegacy': 'कृति देव पाठ चिपकाएँ (वह रोमन अक्षरों जैसा दिखेगा)…',
  'krutidev.placeholderUnicode': 'यहाँ यूनिकोड हिंदी पाठ चिपकाएँ…',
  'krutidev.coverage':
    'मानक परत शामिल है — व्यंजन, स्वर, मात्राएँ, एक-कुंजी संयुक्ताक्षर और विराम चिह्न — और ि तथा रेफ़ के दृश्य-से-तार्किक क्रम का सुधार भी। सजावटी रूप अनुमान लगाए बिना जैसे हैं वैसे ही निकल जाते हैं।',

  // Keyboard health check
  'health.title': 'कीबोर्ड स्वास्थ्य जाँच',
  'health.hint':
    'हर कुंजी एक बार दबाएँ। मरी, अटकती और भूतिया (ghosting) कुंजियाँ पकड़ी जा सकती हैं — और मॉक के दो मिनट बाद आधी मरी कुंजी मिलना पूरा सत्र बरबाद कर देता है।',
  'health.start': 'जाँच शुरू करें',
  'health.restart': 'फिर से शुरू करें',
  'health.regionAria': 'कीबोर्ड परीक्षण क्षेत्र — यहाँ कुंजियाँ दबाएँ',
  'health.tested': 'जाँची गई कुंजियाँ',
  'health.notStarted': 'शुरू करें दबाएँ, ऊपर कीबोर्ड पर क्लिक करें, फिर हर कुंजी दबाते जाएँ।',
  'health.pressKeys': 'अब हर कुंजी एक बार दबाएँ। Escape से जाँच समाप्त होगी।',
  'health.remaining': '{count} कुंजियाँ अभी अनजाँची — उन्हें दबाकर जाँच पूरी करें।',
  'health.allGood': 'हर कुंजी ने ठीक एक बार जवाब दिया। यह कीबोर्ड ठीक है।',
  'health.stickyFound':
    'अटकती या चटकती कुंजियाँ: {keys}। ये एक बार दबाने पर कई बार चलती हैं, जो दोहरे अक्षरों के रूप में दिखता है।',
  'health.ghostingFound':
    'भूतिया कुंजियाँ: {keys}। ये तब दर्ज होती हैं जब कोई दूसरी कुंजी दबी हो — मेम्ब्रेन कीबोर्ड की क्लासिक ख़राबी, और वही जो चुपचाप पूरा रन बिगाड़ती है।',
  'health.untested': 'अभी जाँची नहीं',
  'health.ok': 'ठीक जवाब देती है',
  'health.sticky': 'अटकती — एक से ज़्यादा बार चलती है',
  'health.ghosting': 'भूतिया — दूसरी कुंजी दबी होने पर चलती है',

  // Passage difficulty rating
  'passageBand.veryEasy': 'बहुत आसान',
  'passageBand.easy': 'आसान',
  'passageBand.moderate': 'मध्यम',
  'passageBand.hard': 'कठिन',
  'passageBand.veryHard': 'बहुत कठिन',
  'difficultyRating.tooltip': 'कठिनाई {score}/100 · लगभग {wpm} WPM वाले टाइपिस्ट के लिए उपयुक्त',
  'difficultyRating.matched': 'आपके स्तर के लिए ठीक (लगभग {wpm} WPM के अनुकूल)।',
  'difficultyRating.tooEasy':
    'आपके स्तर से आसान — यह गद्यांश जितना माँगता है, आप उससे {gap} WPM आगे हैं। वार्म-अप के लिए ठीक, पर इससे गति नहीं बढ़ेगी।',
  'difficultyRating.tooHard':
    'आपके स्तर से लगभग {gap} WPM कठिन। बाद में लौटें; अपने स्तर से ऊपर अभ्यास से ज़्यादातर निराशा ही बनती है।',
  'difficultyRating.factorWordLength': 'लंबे शब्द',
  'difficultyRating.factorPunctuation': 'विराम चिह्न',
  'difficultyRating.factorCapitals': 'बड़े अक्षर',
  'difficultyRating.factorDigits': 'अंक',
  'difficultyRating.factorRareLetters': 'दुर्लभ अक्षर',
  'difficultyRating.factors': 'कठिनाई की वजह',
  'difficultyRating.recommend': 'इस समय आपके लिए अधिक उपयुक्त',

  // Passage packs
  'packs.title': 'गद्यांश पैक',
  'packs.hint':
    'राज्यव्यवस्था, अर्थव्यवस्था, एक संपादकीय और असली कार्यालय-ज्ञापन प्रारूप। आप सामान्य ज्ञान का पेपर भी दे रहे हैं, तो टाइपिंग का एक घंटा वही पढ़ने का घंटा भी बन जाए। ऐप के साथ ही आते हैं — नेटवर्क की ज़रूरत नहीं।',
  'packs.import': 'लाइब्रेरी में जोड़ें',
  'packs.importing': 'जोड़ा जा रहा है…',
  'packs.again': 'फिर जोड़ें',

  // Institute branding
  'institute.title': 'संस्थान ब्रांडिंग',
  'institute.hint':
    'हर प्रमाणपत्र पर अपने केंद्र का नाम और लोगो लगाएँ, फिर इतिहास पृष्ठ से पूरे बैच के प्रमाणपत्र बनाएँ। यह इसी डिवाइस पर सहेजा जाता है और बैकअप में शामिल रहता है।',
  'institute.name': 'संस्थान का नाम',
  'institute.namePlaceholder': 'जैसे शर्मा कंप्यूटर इंस्टिट्यूट',
  'institute.subtitle': 'दूसरी पंक्ति',
  'institute.subtitlePlaceholder': 'शहर, संबद्धता या पंजीकरण',
  'institute.signatory': 'हस्ताक्षरकर्ता',
  'institute.signatoryPlaceholder': 'हस्ताक्षरकर्ता का नाम',
  'institute.signatoryTitle': 'पदनाम',
  'institute.signatoryTitlePlaceholder': 'जैसे केंद्र निदेशक',
  'institute.uploadLogo': 'लोगो अपलोड करें',
  'institute.removeLogo': 'लोगो हटाएँ',
  'institute.logoTooBig': 'यह लोगो बहुत बड़ा है — इसे {kb} KB से कम रखें।',
  'institute.save': 'ब्रांडिंग सहेजें',
  'institute.cancel': 'बदलाव छोड़ें',
  'certificate.branded': '{institute} की ओर से जारी',

  // Batch certificates
  'batch.title': 'बैच प्रमाणपत्र',
  'batch.hintBranded':
    '{count} पास प्रयास, {institute} की ओर से जारी करने के लिए तैयार। हर अभ्यर्थी का नाम लिखें, फिर पूरा बैच एक बार में डाउनलोड करें।',
  'batch.hintUnbranded':
    '{count} पास प्रयास। पहले सेटिंग्स में अपने संस्थान का नाम डालें, वरना ये Typly के नाम से छपेंगे।',
  'batch.empty': 'प्रमाणित करने योग्य कोई पास प्रयास अभी नहीं।',
  'batch.downloadAll': '{count} प्रमाणपत्र डाउनलोड करें',
  'batch.print': 'सूची छापें',
  'batch.candidate': 'अभ्यर्थी',
  'batch.exam': 'परीक्षा',
  'batch.wpm': 'नेट WPM',
  'batch.accuracy': 'शुद्धता',
  'batch.date': 'तारीख़',
  'batch.namePlaceholder': 'अभ्यर्थी का नाम',
  'batch.nameAria': 'प्रयास {id} के लिए अभ्यर्थी का नाम',

  // Endless / adaptive run
  'endless.cardTitle': 'अनंत रन',
  'endless.cardHint':
    'गद्यांश आते रहते हैं। जब तक आप {wpm} WPM बनाए रखते हैं कठिनाई बढ़ती है, गिरते ही घटती है, और लगातार तीन बार कट-ऑफ़ चूकने पर रन ख़त्म। उत्तर एक ही संख्या है: आप {exam} की गति कितनी देर बनाए रख सकते हैं।',
  'endless.start': 'अनंत रन शुरू करें',
  'endless.starting': 'शुरू हो रहा है…',
  'endless.needLibrary':
    'इसके लिए लाइब्रेरी में दो या अधिक कठिनाई स्तरों के गद्यांश चाहिए, वरना कठिनाई के बदलने की कोई जगह ही नहीं। लाइब्रेरी पृष्ठ से एक गद्यांश पैक जोड़ें।',
  'endless.couldNotStart': 'शुरू करने के लिए कोई गद्यांश उपलब्ध नहीं। पहले लाइब्रेरी में कुछ जोड़ें।',
  'endless.title': 'अनंत रन',
  'endless.continuing':
    'अब तक {laps} गद्यांशों में {minutes} मिनट गति पर। अगला लोड हो रहा है — गति बनी रही तो कठिन, नहीं तो आसान।',
  'endless.finished':
    'रन समाप्त: आपने {laps} गद्यांशों में {minutes} मिनट तक परीक्षा-गति बनाए रखी। तय लंबाई वाला टेस्ट यह संख्या नहीं दे सकता।',
  'endless.stop': 'रन समाप्त करें',
  'endless.atPace': 'गति पर',
  'endless.atPaceHint': 'कट-ऑफ़ से ऊपर',
  'endless.laps': 'गद्यांश',
  'endless.lapsHint': 'पूरे किए',
  'endless.peak': 'सबसे कठिन',
  'endless.peakHint': 'कठिनाई स्तर',
  'endless.misses': 'लगातार चूक',
  'endless.missesHint': 'तीन पर रन ख़त्म',
  'endless.held': 'बनी रही',
  'endless.missed': 'चूक',

  // Quick drill (tray / global hotkey overlay)
  'quick.title': 'त्वरित ड्रिल · 60 सेकंड',
  'quick.close': 'बंद करें',
  'quick.placeholder': 'टाइप करना शुरू करें — पहली कुंजी से घड़ी चलेगी।',
  'quick.inputLabel': 'त्वरित ड्रिल इनपुट',
  'quick.netWpm': 'नेट WPM',
  'quick.accuracy': '{value}% शुद्धता',
  'quick.counted': 'सहेजा गया — यह आपकी स्ट्रीक और दैनिक लक्ष्य में गिना जाएगा।',
  'quick.again': 'फिर से',
  'quick.done': 'हो गया',

  'trainer.taxonomy': 'आपकी ग़लती का प्रकार',
  'trainer.taxonomyHint':
    'सभी प्रयासों को मिलाकर आपकी {share}% ग़लतियाँ {kind} हैं। जो पैटर्न पूरे इतिहास में टिका रहे, तकनीक बदलने लायक वही है।',

  // Release notes — 0.4.0
  'changelog.dictation':
    'स्टेनोग्राफ़र मोड: गद्यांश 80 या 100 WPM पर बोला जाता है, फिर आप घड़ी के साथ उसे टाइप करते हैं।',
  'changelog.kdph':
    'की-डिप्रेशन प्रति घंटा — जैसे DEST और DEO पदों में असल में अंक मिलते हैं — साथ में तालिका वाली डेटा-एंट्री ड्रिल।',
  'changelog.examSkin':
    'परीक्षा-सॉफ़्टवेयर स्किन जो असली टेस्ट क्लाइंट की नक़ल करती है, जिससे मॉक परीक्षा जैसा लगे।',
  'changelog.pacer':
    'कट-ऑफ़ पेसर: एक निशान ठीक परीक्षा की न्यूनतम गति से चलता है। उससे पीछे रह गए तो आप फ़ेल होते।',
  'changelog.pressure':
    'दबाव मोड — चमकती घड़ी, लाइव रैंक और हॉल का शोर, ताकि परीक्षा-दिन की घबराहट का अभ्यास हो सके।',
  'changelog.strict': 'सख़्त मोड में मौजूदा शब्द सही होने तक आगे नहीं बढ़ने देता।',
  'changelog.endless':
    'अनंत रन: गद्यांश आते रहते हैं और कठिनाई बदलती रहती है, जब तक आप परीक्षा-गति बनाए रख सकें।',
  'changelog.eligibility':
    'आपका पूरा इतिहास हर परीक्षा प्रोफ़ाइल पर फिर से जाँचा गया — कौन-से पद आप अभी पास करते हैं, और कौन दो WPM दूर हैं।',
  'changelog.taxonomy':
    'ग़लतियाँ प्रकार से वर्गीकृत — उलटाव, दोहराव, छूटना, बदलना, Shift — हर एक का अपना इलाज।',
  'changelog.longitudinal':
    '30 दिनों का कमज़ोर-कुंजी हीटमैप और थकान वक्र, जिससे दिखे कि कुंजी सुधर रही है या नहीं और आप थकते हैं या नहीं।',
  'changelog.backspaceCost': 'सुधारों की क़ीमत, सेकंड और WPM दोनों में।',
  'changelog.fingerLoad': 'उँगलियों का भार और गति-पथ — पठार की असली यांत्रिक वजह।',
  'changelog.difficulty':
    'हर गद्यांश की कठिनाई रेटिंग, और जब कोई आपके स्तर से ऊपर या नीचे हो तो सुझाव भी।',
  'changelog.packs':
    'साथ आने वाले सामान्य ज्ञान, अर्थव्यवस्था, संपादकीय और सरकारी-पत्र गद्यांश पैक, ताकि टाइपिंग अभ्यास पढ़ाई भी बने।',
  'changelog.shareCard': 'WhatsApp के नाप का वर्गाकार साझा-योग्य परिणाम कार्ड।',
  'changelog.challenge':
    'चुनौती फ़ाइलें: गद्यांश और अपना स्कोर .typly फ़ाइल में सहेजें और बिना सर्वर आमने-सामने मुक़ाबला करें।',
  'changelog.recap': 'मासिक सारांश — अभ्यास के घंटे, बढ़ी WPM, सुधरी कुंजियाँ, सर्वश्रेष्ठ दिन।',
  'changelog.krutidev': 'ऑफ़लाइन कृति देव ⇄ यूनिकोड कनवर्टर।',
  'changelog.keyboardHealth': 'कीबोर्ड स्वास्थ्य जाँच, जो मरी, अटकती और भूतिया कुंजियाँ पकड़ती है।',
  'changelog.preflight': 'घड़ी शुरू होने से पहले जाँच — Caps Lock, इनपुट मेथड, फ़ॉन्ट।',
  'changelog.multiSection': 'CPCT और राज्य परीक्षाओं के लिए बहु-खंड मॉक पेपर, एक संयुक्त रिपोर्ट के साथ।',
  'changelog.institute': 'कोचिंग केंद्रों के लिए संस्थान ब्रांडिंग और बैच प्रमाणपत्र।',
  'changelog.quickDrill':
    'ट्रे या ग्लोबल हॉटकी से 60 सेकंड की ड्रिल, एक छोटी हमेशा-ऊपर रहने वाली विंडो में।',
  'changelog.breaks': 'लंबे सत्रों में 20-20-20 आँखों का विराम और कलाई की याद।',
  'changelog.portable': 'पोर्टेबल बिल्ड जो अपना डेटा एक्ज़ीक्यूटेबल के पास रखता है — USB स्टिक से चलाएँ।',

  // Recovering a table from an imported form
  'tabulate.title': 'यह कोई फ़ॉर्म या रजिस्टर लगता है',
  'tabulate.hint':
    'लगभग {columns} स्तंभों की {rows} पंक्तियाँ। स्तंभों के बीच की जगह को Tab में बदल दें और यह डेटा-एंट्री टेस्ट की तरह चलेगा, जिसका मूल्यांकन की-डिप्रेशन प्रति घंटा में होगा।',
  'tabulate.apply': 'फ़ील्ड में बदलें',

  'challenge.openTitle': 'किसी चुनौती का जवाब दें',
  'challenge.openHint':
    'किसी ने आपको .typly फ़ाइल भेजी है? उसे यहाँ खोलें — आप उनका गद्यांश, उनके नियमों पर टाइप करेंगे, और उनका स्कोर हराना होगा। इसे ऊपर वाले बॉक्स पर छोड़ भी सकते हैं।',
  'challenge.openButton': 'चुनौती फ़ाइल खोलें',
  'challenge.unreadable':
    'वह चुनौती फ़ाइल पढ़ी नहीं जा सकी। वह ख़राब हो सकती है, या Typly के किसी नए संस्करण से सहेजी गई हो।',
  'upload.errUnreadable': 'Typly “{name}” को पढ़ नहीं सकता। इसकी जगह पाठ चिपकाएँ।',

  'practice.forYourExam': 'आपकी परीक्षा',

  'setup.strictHint':
    'जब तक शब्द पूरी तरह सही न हो, आप आगे नहीं बढ़ सकते। शब्द के भीतर ग़लती चलेगी — उसे अगले शब्द तक ले जाना नहीं।',
  'setup.strictNeedsBackspace':
    'सख़्त मोड के लिए Backspace ज़रूरी है: सुधार बंद होने पर ग़लत टाइप हुए शब्द से निकलने का कोई रास्ता नहीं बचेगा। Backspace चालू करें, वरना रन सामान्य मोड की तरह चलेगा।',

  'stats.kdph': 'डिप्रेशन/घंटा',
};
