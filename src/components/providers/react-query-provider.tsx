'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Optionally import ReactQueryDevtools
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optionally add React Query DevTools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
