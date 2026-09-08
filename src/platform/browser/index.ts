import type { Platform } from '../ports';
import { BrowserRepository } from './repository';
import { BrowserCache } from './cache';
import { BrowserFilePicker } from './files';
import { BrowserPdfReader } from './pdf';
import { BrowserOcrEngine } from './ocr';
import { BrowserSpellChecker } from './spell';
import { BrowserGrammarChecker } from './grammar';
import { BrowserAuth } from './auth';
import { BrowserAiCoach } from './coach';
import { BrowserPassageWriter } from './passage';
import { BrowserNotifications } from './notifications';
import { BrowserSound } from './sound';
import { BrowserTts } from './tts';
import { BrowserShell } from './shell';
import { BrowserDeviceSync } from './sync';
import { BrowserQuotes } from './quotes';

export function createBrowserPlatform(): Platform {
  // One cache instance, shared: the quote adapter stores its batch through the
  // same port the rest of the app reads from, rather than reaching past it.
  const cache = new BrowserCache();
  return {
    repo: new BrowserRepository(),
    cache,
    files: new BrowserFilePicker(),
    pdf: new BrowserPdfReader(),
    ocr: new BrowserOcrEngine(),
    spell: new BrowserSpellChecker(),
    grammar: new BrowserGrammarChecker(),
    auth: new BrowserAuth(),
    coach: new BrowserAiCoach(),
    passageWriter: new BrowserPassageWriter(),
    notifications: new BrowserNotifications(),
    sound: new BrowserSound(),
    tts: new BrowserTts(),
    shell: new BrowserShell(),
    sync: new BrowserDeviceSync(),
    quotes: new BrowserQuotes(cache),
  };
}
