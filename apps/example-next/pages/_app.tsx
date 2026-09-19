import type { AppProps } from "next/app";
import { GoogleAnalytics } from "analytics-adapters/next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleAnalytics id="G-TEST">
      <Component {...pageProps} />
    </GoogleAnalytics>
  );
}
