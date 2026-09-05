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

export function createBrowserPlatform(): Platform {
  return {
    repo: new BrowserRepository(),
    cache: new BrowserCache(),
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
  };
}
