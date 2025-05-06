import { validatePostData } from '../../utils/postHelper';

describe('Post Validation', () => {
  test('valid post passes validation', () => {
    expect(validatePostData({ title: 'Hello', content: 'World' })).toBe(true);
  });

  test('no missing title', () => {
    expect(() => validatePostData({ title: '', content: 'Content' })).toThrow('Title is required');
  });

  test('no missing content', () => {
    expect(() => validatePostData({ title: 'Title', content: '' })).toThrow('Content is required');
  });

  test('no title with only spaces', () => {
    expect(() => validatePostData({ title: '   ', content: 'Content' })).toThrow('Title is required');
  });

  test('no content with only spaces', () => {
    expect(() => validatePostData({ title: 'Valid', content: '  ' })).toThrow('Content is required');
  });
});
