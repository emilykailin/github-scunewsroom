import { validatePreferences, normalizePreferences } from '../../utils/preferences';

const validOptions = [
  'Arts & Sciences', 'Business', 'Engineering',
  'Art History', 'On-Campus Housing', 'Into The Wild',
  'Club Sports', 'Athletics', 'Performing Arts',
  'SCAPP', 'ASG', 'APB'
];

describe('Preferences Validation', () => {
  test('valid: 3 or more from list', () => {
    const selected = ['Business', 'Engineering', 'SCAPP', 'ASG'];
    expect(validatePreferences(selected, validOptions)).toBe(true);
  });

  test('invalid: not all categories valid', () => {
    const selected = ['Engineering', 'Bananas', 'SCAPP'];
    expect(validatePreferences(selected, validOptions)).toBe(false);
  });

  test('invalid: categories of empty strings or whitespace', () => {
    const selected = ['Engineering', '   ', 'SCAPP'];
    expect(validatePreferences(selected, validOptions)).toBe(false);
  });

  test('invalid: categories are less than 3', () => {
    const selected = ['Business', 'Engineering'];
    expect(validatePreferences(selected, validOptions)).toBe(false);
  });

  test('invalid: not an array', () => {
    // @ts-expect-error
    expect(validatePreferences(null, validOptions)).toBe(false);
  });
});

describe('Normalization', () => {
  test('remove duplicates and trim whitespace', () => {
    const messy = [' Business ', 'Engineering', 'business', 'Engineering'];
    const normalized = normalizePreferences(messy.map(s => s.toLowerCase())); // simulate lowercasing
    expect(normalized).toEqual(['business', 'engineering']);
  });

  test('filter out empty or blank entries', () => {
    const messy = ['ASG', '', ' ', 'SCAPP'];
    expect(normalizePreferences(messy)).toEqual(['ASG', 'SCAPP']);
  });

  test('return empty array when given only bad input', () => {
    expect(normalizePreferences(['', ' ', '  '])).toEqual([]);
  });
});
