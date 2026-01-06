import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from '@/components/Footer';

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('Footer', () => {
    it('renders the produced by link', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /produced by/i });
        expect(link).toHaveAttribute('href', 'https://kaiverse.vercel.app');
    });

    it('renders the source code link', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /source code/i });
        expect(link).toHaveAttribute(
            'href',
            'https://github.com/nishan-paul-2022/flick-p2p-file-sharing'
        );
    });

    it('renders the author logo with correct alt text', () => {
        render(<Footer />);
        const logo = screen.getByAltText('KAI');
        expect(logo).toBeInTheDocument();
    });
});
