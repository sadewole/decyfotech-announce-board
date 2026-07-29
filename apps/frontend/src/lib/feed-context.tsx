'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface FeedContextType {
  openNewPost: () => void;
}

const FeedContext = createContext<FeedContextType>({ openNewPost: () => {} });

export function FeedProvider({ children, onNewPost }: { children: ReactNode; onNewPost: () => void }) {
  return (
    <FeedContext.Provider value={{ openNewPost: onNewPost }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  return useContext(FeedContext);
}
