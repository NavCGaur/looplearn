'use client';

import { useEffect } from 'react';

interface GoogleAdBannerProps {
    adSlot?: string;
    adFormat?: 'auto' | 'horizontal' | 'rectangle';
    className?: string;
}

export function GoogleAdBanner({
    adSlot,
    adFormat = 'auto',
    className = '',
}: GoogleAdBannerProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('Google AdSense banner error:', err);
        }
    }, []);

    return (
        <div className={`my-6 text-center overflow-hidden min-h-[90px] ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-8989689535170282"
                data-ad-slot={adSlot || ''}
                data-ad-format={adFormat}
                data-full-width-responsive="true"
            />
        </div>
    );
}
