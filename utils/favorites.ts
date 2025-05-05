type Favorite = { id: string; title: string };

export function addToFavorites(list: Favorite[], item: Favorite): Favorite[] {
  if (!item || !item.id) return list;
  return list.some(i => i.id === item.id) ? list : [...list, item];
}

export function removeFromFavorites(list: Favorite[], id: string): Favorite[] {
  return list.filter(item => item.id !== id);
}

export function isFavorite(list: Favorite[], id: string): boolean {
  return list.some(item => item.id === id);
}
