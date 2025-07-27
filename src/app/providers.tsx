"use client";

import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from 'react-redux'; 
import { store } from '@/redux/store';
import GlobalNotifications from "@/components/GlobalNotifications";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        {children}
        <GlobalNotifications />
      </ReduxProvider>
    </SessionProvider>
  );
}