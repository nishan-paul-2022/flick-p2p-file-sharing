import { useState, useEffect, useRef } from 'react';
import { LogEntry } from '@/lib/types';

export function useLogNotification(logs: LogEntry[], isLogPanelOpen: boolean) {
    const [hasUnreadLogs, setHasUnreadLogs] = useState(false);
    const prevLogsLength = useRef(logs.length);

    // Show notification dot when a new log arrives
    useEffect(() => {
        if (logs.length > prevLogsLength.current) {
            if (!isLogPanelOpen) {
                setHasUnreadLogs(true);
            }
        }
        prevLogsLength.current = logs.length;
    }, [logs.length, isLogPanelOpen]);

    // Clear notification when log panel is opened
    useEffect(() => {
        if (isLogPanelOpen) {
            setHasUnreadLogs(false);
        }
    }, [isLogPanelOpen]);

    return { hasUnreadLogs };
}
