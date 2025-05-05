import { addToFavorites, removeFromFavorites, isFavorite } from '../utils/favorites';

const sample = { id: 'abc123', title: 'Test Event' };

describe('Favorites logic', () => {
  test('add event to favorites', () => {
    const updated = addToFavorites([], sample);
    expect(updated).toContainEqual(sample);
  });

  test('avoid duplicate events', () => {
    const list = addToFavorites([sample], sample);
    expect(list.length).toBe(1);
  });

  test('remove event from favorites', () => {
    const updated = removeFromFavorites([sample], sample.id);
    expect(updated.length).toBe(0);
  });

  test('check favorite status', () => {
    expect(isFavorite([sample], 'abc123')).toBe(true);
  });

  test('handle invalid add (null)', () => {
    // @ts-expect-error
    const updated = addToFavorites([], null);
    expect(updated.length).toBe(0);
  });
});
