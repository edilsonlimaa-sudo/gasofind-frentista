import { initDatabase } from '@/database';
import React, { createContext, useContext, useEffect, useState } from 'react';

// ============================================================================
// Database Context
// ============================================================================

interface DatabaseContextValue {
  isInitialized: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  isInitialized: false,
  error: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        await initDatabase();
        if (isMounted) {
          setIsInitialized(true);
          console.log('✅ Database initialized successfully');
        }
      } catch (err) {
        console.error('❌ Database initialization failed:', err);
        if (isMounted) {
          setError(err as Error);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
}
