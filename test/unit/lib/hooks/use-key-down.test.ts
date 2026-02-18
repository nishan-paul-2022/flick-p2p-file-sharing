import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useKeyDown } from '@/lib/hooks/use-key-down';

describe('useKeyDown', () => {
    it('should call callback when matching key is pressed', () => {
        const callback = vi.fn();
        renderHook(() => useKeyDown(['Enter', 'Escape'], callback));

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('should not call callback when non-matching key is pressed', () => {
        const callback = vi.fn();
        renderHook(() => useKeyDown(['Enter'], callback));

        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(event);

        expect(callback).not.toHaveBeenCalled();
    });

    it('should clean up listener on unmount', () => {
        const callback = vi.fn();
        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderHook(() => useKeyDown(['Enter'], callback));

        expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

        unmount();

        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
});
