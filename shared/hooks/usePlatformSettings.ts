import { useState, useEffect } from 'react';
import { db } from '../lib/db';

export const usePlatformSettings = () => {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await db.getPlatformSettings();
                const settingsMap = data.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {} as Record<string, any>);
                setSettings(settingsMap);
            } catch (err) {
                console.error('Failed to fetch platform settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const getSetting = (key: string) => settings[key];

    return { settings, getSetting, loading };
};
