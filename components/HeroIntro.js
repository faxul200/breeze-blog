import Head from 'next/head';

export default function HeroIntro({ title, description, siteUrl, showMeta=true, titleStyle, descStyle }) {
  return (
    <>
      {showMeta && (
        <Head>
          <title>{title}</title>
          <meta name="description" content={description.replace(/<br\/>/g, ' ')} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description.replace(/<br\/>/g, ' ')} />
          {siteUrl ? <meta property="og:url" content={siteUrl} /> : null}
        </Head>
      )}
      <h1 className="post-title" style={titleStyle}>{title}</h1>
      <p className="muted" style={descStyle} dangerouslySetInnerHTML={{__html: description}} />
    </>
  );
}
