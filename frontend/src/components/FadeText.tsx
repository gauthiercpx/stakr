import {useState} from 'react';
import type {CSSProperties, ElementType, ReactNode} from 'react';

interface FadeTextProps {
    children: ReactNode;
    as?: ElementType;
    className?: string;
    style?: CSSProperties;
}

// Replays a fade + blur reveal whenever `children` changes, so swapped text
// (language toggle, or a loading placeholder resolving into real content)
// settles in instead of flashing.
export default function FadeText({children, as: Tag = 'span', className, style}: FadeTextProps) {
    const [prevChildren, setPrevChildren] = useState(children);
    const [animKey, setAnimKey] = useState(0);

    // Adjust state during render (React's recommended pattern for "reset on
    // prop change") instead of an effect, so the remount happens in the same
    // commit rather than one tick later.
    if (children !== prevChildren) {
        setPrevChildren(children);
        setAnimKey((key) => key + 1);
    }

    const Component = Tag as ElementType;

    return (
        <Component
            key={animKey}
            className={className ? `stakr-fade-text ${className}` : 'stakr-fade-text'}
            style={style}
        >
            {children}
        </Component>
    );
}
