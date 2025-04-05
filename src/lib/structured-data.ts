type WebsiteStructuredData = {
  url: string;
  name: string;
  description: string;
  logoUrl?: string;
};

type ArticleStructuredData = {
  url: string;
  headline: string;
  description: string;
  imageUrl?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
};

type FAQStructuredData = {
  questions: Array<{
    question: string;
    answer: string;
  }>;
};

export function generateWebsiteStructuredData(
  data: WebsiteStructuredData
): Record<string, string | object> {
  const { url, name, description, logoUrl } = data;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
    description,
    ...(logoUrl && { logo: logoUrl }),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateArticleStructuredData(
  data: ArticleStructuredData
): Record<string, string | object> {
  const {
    url,
    headline,
    description,
    imageUrl,
    authorName,
    datePublished,
    dateModified,
  } = data;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    ...(imageUrl && { image: imageUrl }),
    ...(authorName && {
      author: {
        "@type": "Person",
        name: authorName,
      },
    }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    publisher: {
      "@type": "Organization",
      name: "SmartSearch",
      logo: {
        "@type": "ImageObject",
        url: "/web-app-manifest-512x512.png",
      },
    },
  };
}

export function generateFAQStructuredData(
  data: FAQStructuredData
): Record<string, string | object> {
  const { questions } = data;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

// Helper to safely stringify JSON-LD
export function jsonLdScriptProps(data: Record<string, string | object>) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data),
    },
  };
}
