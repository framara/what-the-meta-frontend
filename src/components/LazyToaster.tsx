import React, { useEffect, useState } from 'react';

// Lazily import the toast library after idle/interaction to keep it out of the main bundle
export const LazyToaster: React.FC = () => {
    const [ToasterComp, setToasterComp] = useState<React.ComponentType | null>(null);

    useEffect(() => {
        let loaded = false;
        const load = () => {
            if (loaded) return;
            loaded = true;
            import('react-hot-toast').then((m) => {
                setToasterComp(() => m.Toaster);
            }).catch(() => {/* ignore */ });
            // cleanup listeners once we attempt loading
            removeListeners();
        };

        const removeListeners = () => {
            window.removeEventListener('scroll', load, { passive: true } as any);
            window.removeEventListener('pointerdown', load);
            window.removeEventListener('keydown', load);
        };

        // Prefer idle; fall back to first interaction; final fallback after 5s
        // @ts-ignore requestIdleCallback may not exist in some browsers
        const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: any) => number);
        if (typeof ric === 'function') {
            ric(load, { timeout: 2000 });
        } else {
            setTimeout(load, 2000);
        }
        window.addEventListener('scroll', load, { passive: true } as any);
        window.addEventListener('pointerdown', load);
        window.addEventListener('keydown', load);
        const hardTimeout = setTimeout(load, 5000);

        return () => {
            clearTimeout(hardTimeout);
            removeListeners();
        };
    }, []);

    if (!ToasterComp) return null;
    const Toaster = ToasterComp as any;
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 4500,
                style: {
                    background: '#111827',
                    color: '#E5E7EB',
                    border: '1px solid #1F2937',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                },
                iconTheme: {
                    primary: '#60A5FA',
                    secondary: '#111827'
                },
                success: { style: { borderColor: '#059669' } },
                error: { style: { borderColor: '#DC2626' } }
            }}
        />
    );
};

export default LazyToaster;
