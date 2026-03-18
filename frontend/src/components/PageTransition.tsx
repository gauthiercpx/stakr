import React from 'react';

export interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
