import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/Layout';

export default function MyApp({ Component, pageProps }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      {adsenseClient ? (
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      ) : null}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

