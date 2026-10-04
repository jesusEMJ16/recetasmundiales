'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID } from '../site';
import { useAnalyticsChoice, forgetAnalyticsCookies } from './PrivacyPreferences';

// Google Analytics 4. Única carga de gtag.js del sitio; solo en producción.
export function Analytics() {
  const choice = useAnalyticsChoice();
  useEffect(() => {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = choice !== 'accepted';
    if (choice !== 'accepted') forgetAnalyticsCookies();
  }, [choice]);
  if (process.env.NODE_ENV !== 'production' || choice !== 'accepted') {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}
