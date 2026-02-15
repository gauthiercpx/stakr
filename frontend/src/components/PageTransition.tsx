import React from 'react';

export interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
}

export default function PageTransition({ children }: PageTransitionProps) {
  // Wrapper minimal : passe simplement les enfants.
  // Ancienne implémentation d'animations (brouillon) archivée hors ligne si besoin.
  return <>{children}</>;
}
