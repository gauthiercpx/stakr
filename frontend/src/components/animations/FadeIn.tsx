import { motion } from 'framer-motion';
import type {ReactNode} from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'none';
  fullWidth?: boolean;
  className?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  fullWidth = false,
  className = ""
}: FadeInProps) {

  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    none: { y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1],
        delay: delay
      }}
      style={{ width: fullWidth ? '100%' : 'auto' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}