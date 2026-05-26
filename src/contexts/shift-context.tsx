import { closeShift, getCurrentShift, startShift } from '@/database/repositories';
import type { Shift } from '@/types/sales';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDatabase } from './database-context';

// ============================================================================
// Shift Context
// ============================================================================

interface ShiftContextValue {
  currentShift: Shift | null;
  isLoadingShift: boolean;
  refreshShift: () => Promise<void>;
  startNewShift: (operatorName: string, initialCash: number, exchangeRate: number) => Promise<Shift>;
  endShift: (finalCash: number, notes?: string) => Promise<Shift>;
}

const ShiftContext = createContext<ShiftContextValue | null>(null);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useDatabase();
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isLoadingShift, setIsLoadingShift] = useState(true);

  const refreshShift = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setIsLoadingShift(true);
      const shift = await getCurrentShift();
      setCurrentShift(shift);
      console.log('🔄 Shift refreshed:', shift?.id || 'none');
    } catch (error) {
      console.error('❌ Error refreshing shift:', error);
    } finally {
      setIsLoadingShift(false);
    }
  }, [isInitialized]);

  // Load current shift when database is initialized
  useEffect(() => {
    if (isInitialized) {
      refreshShift();
    }
  }, [isInitialized, refreshShift]);

  const startNewShift = useCallback(async (
    operatorName: string,
    initialCash: number,
    exchangeRate: number
  ): Promise<Shift> => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const shift = await startShift(operatorName, initialCash, exchangeRate);
      setCurrentShift(shift);
      return shift;
    } catch (error) {
      console.error('❌ Error starting shift:', error);
      throw error;
    }
  }, [isInitialized]);

  const endShift = useCallback(async (
    finalCash: number,
    notes?: string
  ): Promise<Shift> => {
    if (!isInitialized) {
      throw new Error('Database not initialized');
    }

    if (!currentShift) {
      throw new Error('No active shift');
    }

    try {
      const closedShift = await closeShift(currentShift.id, finalCash, notes);
      setCurrentShift(null); // Clear current shift after closing
      return closedShift;
    } catch (error) {
      console.error('❌ Error closing shift:', error);
      throw error;
    }
  }, [isInitialized, currentShift]);

  return (
    <ShiftContext.Provider
      value={{
        currentShift,
        isLoadingShift,
        refreshShift,
        startNewShift,
        endShift,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within ShiftProvider');
  }
  return context;
}
