import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="app-shell">
    <Sidebar />
    <div className="app-main">
      <TopBar />
      <main>{children}</main>
    </div>
  </div>
);

