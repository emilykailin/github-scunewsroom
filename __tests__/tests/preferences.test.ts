import { validatePreferences } from '../../utils/preferences';

describe('Preferences logic', () => {
  test('valid: 3 or more categories', () => {
    expect(validatePreferences(['A', 'B', 'C'])).toBe(true);
  });

  test('invalid: only 1 category', () => {
    expect(validatePreferences(['A'])).toBe(false);
  });

  test('invalid: empty list', () => {
    expect(validatePreferences([])).toBe(false);
  });

  test('invalid: not an array', () => {
    // @ts-expect-error
    expect(validatePreferences(null)).toBe(false);
  });

  test('valid: exactly 3', () => {
    expect(validatePreferences(['X', 'Y', 'Z'])).toBe(true);
  });
});
