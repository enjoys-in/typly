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
};
