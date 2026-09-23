import { describe, expect, test } from 'bun:test';
import { initialPhase, type GateConfig } from './gates';

const plain: GateConfig = { briefing: false, dictation: null, readingSec: 0 };

describe('initialPhase', () => {
  test('a plain run stops at the count-in before the clock', () => {
    expect(initialPhase(plain, false, true)).toBe('ready');
  });

  test('with the count-in off, a plain run starts typing immediately', () => {
    expect(initialPhase(plain, false, false)).toBe('typing');
  });

  test('the briefing comes before everything else', () => {
    const config = { briefing: true, dictation: {}, readingSec: 120 };
    expect(initialPhase(config, false, true)).toBe('briefing');
    expect(initialPhase(config, false, false)).toBe('briefing');
  });

  test('dictation comes before the reading window', () => {
    expect(initialPhase({ ...plain, dictation: {}, readingSec: 120 }, false, true)).toBe(
      'dictation',
    );
  });

  test('a reading window is the last gate before the count-in', () => {
    expect(initialPhase({ ...plain, readingSec: 120 }, false, true)).toBe('reading');
    expect(initialPhase({ ...plain, readingSec: 120 }, false, false)).toBe('reading');
  });

  test('zero reading seconds is no reading window at all', () => {
    expect(initialPhase({ ...plain, readingSec: 0 }, false, false)).toBe('typing');
  });

  // The gates are one-time: a resumed attempt has read the briefing and had
  // its reading time. The count-in is not a gate in that sense — it is there
  // for the hands, and a resumed run needs it most.
  test('a resumed attempt skips every gate except the count-in', () => {
    const everything = { briefing: true, dictation: {}, readingSec: 120 };
    expect(initialPhase(everything, true, true)).toBe('ready');
    expect(initialPhase(plain, true, true)).toBe('ready');
  });

  test('a resumed attempt with the count-in off goes straight back to typing', () => {
    expect(initialPhase({ briefing: true, dictation: {}, readingSec: 120 }, true, false)).toBe(
      'typing',
    );
  });
});
