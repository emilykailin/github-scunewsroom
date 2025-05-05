import { validatePostData } from '../../utils/postHelper';

describe('Post Validation', () => {
  test('valid post passes validation', () => {
    expect(validatePostData({ title: 'Hello', content: 'World' })).toBe(true);
  });

  test('missing title throws error', () => {
    expect(() => validatePostData({ title: '', content: 'Content' })).toThrow('Title is required');
  });

  test('missing content throws error', () => {
    expect(() => validatePostData({ title: 'Title', content: '' })).toThrow('Content is required');
  });

  test('title with only spaces is invalid', () => {
    expect(() => validatePostData({ title: '   ', content: 'Content' })).toThrow('Title is required');
  });

  test('content with only spaces is invalid', () => {
    expect(() => validatePostData({ title: 'Valid', content: '  ' })).toThrow('Content is required');
  });
});
