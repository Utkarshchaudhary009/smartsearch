import { Metadata } from "next";

type MetadataProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
};

export async function generateMetadata(
  props: MetadataProps
): Promise<Metadata> {
  const {
    title = "SmartSearch",
    description = "AI-powered chat interface with smart search capabilities",
    image = "/web-app-manifest-512x512.png",
    url = "/",
    noIndex = false,
  } = props;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://smartsearch.utkarshchaudhary.space";
  const fullUrl = `${baseUrl}${url}`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | SmartSearch`,
    },
    description,
    metadataBase: new URL(baseUrl),
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "SmartSearch",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@smartsearch",
    },
  };

  return metadata;
}
