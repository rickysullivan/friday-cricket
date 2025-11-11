import React, { createContext, useState, useContext, ReactNode } from 'react';

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncContextType {
  status: SyncStatus;
  lastSyncTime: Date | null;
  sync: () => Promise<void>;
  error: string | null;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    try {
      setStatus('syncing');
      setError(null);

      // TODO: Implement Yjs + Supabase sync logic
      // For now, this is a placeholder

      setStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      setStatus('error');
    }
  };

  return (
    <SyncContext.Provider value={{ status, lastSyncTime, sync, error }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
