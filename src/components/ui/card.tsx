import { cn } from '@/lib/cn';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn('bg-bg-surface border border-bg-border rounded-2xl p-4', className)}
      {...props}
    >
      {children}
    </View>
  );
}
