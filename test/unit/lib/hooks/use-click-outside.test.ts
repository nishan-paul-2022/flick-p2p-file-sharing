import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useClickOutside } from '@/shared/hooks/use-click-outside';

describe('useClickOutside', () => {
    it('should call handler when clicking outside element', () => {
        const handler = vi.fn();
        const ref = createRef<HTMLDivElement>();

        const element = document.createElement('div');
        document.body.appendChild(element);

        ref.current = element;

        renderHook(() => useClickOutside(ref, handler));

        const event = new MouseEvent('mousedown', { bubbles: true });
        document.dispatchEvent(event);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(event);

        document.body.removeChild(element);
    });

    it('should not call handler when clicking inside element', () => {
        const handler = vi.fn();
        const ref = createRef<HTMLDivElement>();

        const element = document.createElement('div');
        document.body.appendChild(element);

        ref.current = element;

        renderHook(() => useClickOutside(ref, handler));

        const event = new MouseEvent('mousedown', { bubbles: true });
        // Simulating the event target being the element (contains check logic)
        Object.defineProperty(event, 'target', { value: element });

        document.dispatchEvent(event);

        expect(handler).not.toHaveBeenCalled();

        document.body.removeChild(element);
    });

    it('should remove event listeners on unmount', () => {
        const handler = vi.fn();
        const ref = createRef<HTMLDivElement>();
        const addSpy = vi.spyOn(document, 'addEventListener');
        const removeSpy = vi.spyOn(document, 'removeEventListener');

        const { unmount } = renderHook(() => useClickOutside(ref, handler));

        expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(addSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

        unmount();

        expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });
});
