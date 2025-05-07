import FavoritesPage from '../app/Favorites/FavoritesPage';
import '@testing-library/jest-dom';
import {render, screen,waitFor} from '@testing-library/react';
import {auth, db } from '../firebase';
import {getDoc} from 'firebase/firestore'
import React from 'react';

//mock firebase
jest.mock('../../firebase', () => 
({
  db: {},
  auth: { currentuser: {uid: 'u12345'}},
}));
jest.mock('firebase/firestore', () => ({
  auth: {currentUser: {uid: 'u234'}},
  db: {},
}));

describe('FavoritesPage', () => {
  it('displays favorited posts', async () => {
    (getDoc as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ exists: () => true, data: () => ({ starredPosts: ['post1'] }) })
    );
    (getDoc as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: () => ({
          title: 'FTitle',
          content: 'FContent',
          imageUrl: '',
          createdAt: { seconds: 1680000000 },
        }),
      })
    );

    render(<FavoritesPage/>);

    await waitFor(() => {
      expect(screen.getByText('Favorite Title')).toBeInTheDocument();
      expect(screen.getByText('Favorite Content')).toBeInTheDocument();
    });
  });
});