'use client';

import { jsonLdScriptProps } from "@/lib/structured-data";

export default function StructuredData({
  data,
}: {
  data: Record<string, string | object>;
}) {
  return <script {...jsonLdScriptProps(data)} />;
}
