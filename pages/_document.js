import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''} />
        <meta name="format-detection" content="telephone=no,address=no,email=no" />
        <link rel="icon" href="/favicon.ico" />
        {/* Optional: PNG favicon fallback if provided */}
        <link rel="icon" type="image/png" href="/faxul_favicon.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2930039630594930" crossOrigin="anonymous"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

