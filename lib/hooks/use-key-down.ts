import { useEffect } from 'react';

export function useKeyDown(keys: string[], callback: (event: KeyboardEvent) => void) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (keys.includes(event.key)) {
                callback(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [keys, callback]);
}
