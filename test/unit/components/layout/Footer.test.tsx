import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
    it('renders the footer with correct content', () => {
        render(<Footer />);

        // Check if "PRODUCED by" text is present
        expect(screen.getByText(/PRODUCED BY/i)).toBeDefined();

        // Check for author link
        const authorLink = screen.getByRole('link', { name: /KAI/i });
        expect(authorLink).toBeDefined();
        expect(authorLink.getAttribute('href')).toBe('https://kaiverse.vercel.app');

        // Check for source code link
        const githubLink = screen.getByRole('link', { name: /SOURCE CODE/i });
        expect(githubLink).toBeDefined();
        expect(githubLink.getAttribute('href')).toBe(
            'https://github.com/nishan-paul-2022/flick-p2p-file-sharing'
        );
    });

    it('contains an image for the author logo', () => {
        render(<Footer />);
        const logo = screen.getByAltText(/KAI/i);
        expect(logo).toBeDefined();
    });

    it('contains a Github icon', () => {
        const { container } = render(<Footer />);
        const githubIcon = container.querySelector('.lucide-github');
        expect(githubIcon).toBeDefined();
    });
});
