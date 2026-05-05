import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url,
  keywords,
}) => {
  const siteTitle = 'Transhub | Premium Automotive Marketplace';
  const defaultDescription = 'Discover Nigeria\'s premier automotive marketplace for luxury and foreign-used cars.';
  const defaultKeywords = 'Transhub, luxury cars Nigeria, Tokunbo cars, automotive marketplace';
  const siteUrl = 'https://transhub.ng';
  const defaultImage = '/og-preview.png';

  const seo = {
    title: title ? `${title} | Transhub` : siteTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${url || ''}`,
    keywords: keywords ? `${defaultKeywords}, ${keywords}` : defaultKeywords,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
};

export default SEO;
