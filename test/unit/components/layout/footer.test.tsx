import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/shared/components/layout/footer';

describe('Footer', () => {
    it('renders the footer with correct content', () => {
        render(<Footer />);

        // Check for copyright text
        expect(screen.getByText(/flick/i)).toBeDefined();

        // Check if "Built with" text is present
        expect(screen.getByText(/Built with/i)).toBeDefined();

        // Check for author link
        const authorLink = screen.getByRole('link', { name: /KAI/i });
        expect(authorLink).toBeDefined();
        expect(authorLink.getAttribute('href')).toBe('https://kaiverse.vercel.app');
    });

    it('contains an image for the author logo', () => {
        render(<Footer />);
        const logo = screen.getByAltText(/KAI/i);
        expect(logo).toBeDefined();
    });

    it('contains a Heart icon', () => {
        const { container } = render(<Footer />);
        const heartIcon = container.querySelector('.lucide-heart');
        expect(heartIcon).toBeDefined();
    });
});
