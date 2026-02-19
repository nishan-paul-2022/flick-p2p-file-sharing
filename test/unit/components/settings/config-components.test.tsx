import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MeteredConfig } from '@/features/settings/metered-config';
import { XirsysConfig } from '@/features/settings/xirsys-config';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => (
            <div {...props}>{children}</div>
        ),
    },
}));

describe('Config Components', () => {
    describe('MeteredConfig', () => {
        it('renders and handles input change', () => {
            const onApiKeyChange = vi.fn();
            render(
                <MeteredConfig apiKey="test-key" disabled={false} onApiKeyChange={onApiKeyChange} />
            );

            const input = screen.getByLabelText(/API Key/i);
            expect(input).toBeDefined();
            expect((input as HTMLInputElement).value).toBe('test-key');

            fireEvent.change(input, { target: { value: 'new-key' } });
            expect(onApiKeyChange).toHaveBeenCalledWith('new-key');
        });

        it('disables input when disabled prop is true', () => {
            render(<MeteredConfig apiKey="test-key" disabled={true} onApiKeyChange={vi.fn()} />);
            const input = screen.getByLabelText(/API Key/i);
            expect((input as HTMLInputElement).disabled).toBe(true);
        });
    });

    describe('XirsysConfig', () => {
        it('renders and handles input changes', () => {
            const onIdentChange = vi.fn();
            const onSecretChange = vi.fn();
            const onChannelChange = vi.fn();

            render(
                <XirsysConfig
                    ident="ident"
                    secret="secret"
                    channel="channel"
                    disabled={false}
                    onIdentChange={onIdentChange}
                    onSecretChange={onSecretChange}
                    onChannelChange={onChannelChange}
                />
            );

            const identInput = screen.getByLabelText(/Ident/i);
            const secretInput = screen.getByLabelText(/Secret/i);
            const channelInput = screen.getByLabelText(/Channel/i);

            fireEvent.change(identInput, { target: { value: 'new-ident' } });
            expect(onIdentChange).toHaveBeenCalledWith('new-ident');

            fireEvent.change(secretInput, { target: { value: 'new-secret' } });
            expect(onSecretChange).toHaveBeenCalledWith('new-secret');

            fireEvent.change(channelInput, { target: { value: 'new-channel' } });
            expect(onChannelChange).toHaveBeenCalledWith('new-channel');
        });

        it('disables inputs when disabled prop is true', () => {
            render(
                <XirsysConfig
                    ident="ident"
                    secret="secret"
                    channel="channel"
                    disabled={true}
                    onIdentChange={vi.fn()}
                    onSecretChange={vi.fn()}
                    onChannelChange={vi.fn()}
                />
            );
            expect((screen.getByLabelText(/Ident/i) as HTMLInputElement).disabled).toBe(true);
            expect((screen.getByLabelText(/Secret/i) as HTMLInputElement).disabled).toBe(true);
            expect((screen.getByLabelText(/Channel/i) as HTMLInputElement).disabled).toBe(true);
        });
    });
});
