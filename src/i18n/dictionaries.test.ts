import { describe, expect, test } from 'bun:test';
import { en, type TKey } from './en';
import { hi } from './hi';
import { translate } from './index';

const keys = Object.keys(en) as TKey[];

/** `{named}` holes in a template, which both languages must agree on. */
function placeholders(template: string): string[] {
  return [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();
}

describe('interface copy', () => {
  test('Hindi covers every English key', () => {
    expect(keys.filter((key) => hi[key] === undefined)).toEqual([]);
  });

  test('Hindi adds no key English does not have', () => {
    expect(Object.keys(hi).filter((key) => !(key in en))).toEqual([]);
  });

  test('nothing is blank in either language', () => {
    expect(keys.filter((key) => en[key].trim() === '' || hi[key].trim() === '')).toEqual([]);
  });

  // A hole that exists in one language and not the other prints as a literal
  // `{count}` to whoever reads that language.
  test('both languages take the same placeholders', () => {
    const mismatched = keys.filter(
      (key) => placeholders(en[key]).join() !== placeholders(hi[key]).join(),
    );
    expect(mismatched).toEqual([]);
  });

  test('a supplied placeholder is substituted in both languages', () => {
    expect(translate('en', 'split.partsCount', { count: 7 })).toContain('7');
    expect(translate('hi', 'split.partsCount', { count: 7 })).toContain('7');
  });

  test('a missing placeholder is left visible rather than printed as undefined', () => {
    expect(translate('en', 'split.partsCount')).toContain('{count}');
    expect(translate('en', 'split.partsCount')).not.toContain('undefined');
  });

  // The strings behind this session's features, in both languages: a key that
  // is referenced but never added renders as the key itself.
  test('the count-in, the split panel and the info buttons all have copy', () => {
    const added: TKey[] = [
      'info.more',
      'info.about',
      'split.offer',
      'split.about',
      'split.aboutLength',
      'split.aboutRecut',
      'tabulate.about',
      'countIn.title',
      'countIn.hint',
      'countIn.startNow',
      'countIn.turnOff',
      'settings.countIn',
      'settings.countInHint',
    ];
    for (const key of added) {
      expect(translate('en', key)).not.toBe(key);
      expect(translate('hi', key)).not.toBe(key);
      expect(translate('hi', key)).not.toBe(en[key]);
    }
  });

  test('the info button names what it explains', () => {
    expect(translate('en', 'info.about', { subject: 'Passage length' })).toBe(
      'What is this? Passage length',
    );
  });
});
