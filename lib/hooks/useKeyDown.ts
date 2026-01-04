import { useEffect } from 'react';

/**
 * Hook that listens for specific key presses and triggers a callback.
 *
 * @param keys - The keys to listen for (e.g., ['Escape', 'Enter'])
 * @param callback - The function to call when a matching key is pressed
 */
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
