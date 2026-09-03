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
};
