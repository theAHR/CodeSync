import Script from "next/script";
import { Suspense } from "react";
import { GoogleAnalyticsRouteTracker } from "./GoogleAnalyticsRouteTracker";

const GA_MEASUREMENT_ID = "G-EE7D4ESTQY";

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsRouteTracker measurementId={GA_MEASUREMENT_ID} />
      </Suspense>
    </>
  );
}
