import Document, { Html, Head, Main, NextScript } from 'next/document';

/* Sarun Pro is self-hosted through @ethcali/design-tokens/tokens.css (imported
   once in _app.tsx). JetBrains Mono, the face for everything a chain produced,
   is not bundled and comes from Google Fonts. */
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="bg-surface-void">
        <Head>
          <meta charSet="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/svg+xml" href="/branding/favicon.svg" />
          <link rel="alternate icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/1x1ethcali.png" />
          <meta name="theme-color" content="#06060B" />
          <meta name="color-scheme" content="dark" />
        </Head>
        <body className="bg-surface-void text-content-primary">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
