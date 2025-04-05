import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://smartsearch.utkarshchaudhary.space";

  // Static pages
  const staticPages = ["", "/offline"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Get dynamic pages if needed
  // Example: You could fetch dynamic pages from your database
  // const dynamicPages = await fetchDynamicRoutes();

  return [
    ...staticPages,
    // ...dynamicPages,
  ];
}
