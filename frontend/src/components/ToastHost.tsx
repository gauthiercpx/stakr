import { createPortal } from 'react-dom';

export interface ToastHostProps {
  children: React.ReactNode;
}

export default function ToastHost({ children }: ToastHostProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
