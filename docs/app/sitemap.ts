import type { MetadataRoute } from "next";

import { getDate } from "@/lib/date";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://oryx.contextual.ai",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://oryx.contextual.ai/retrievals",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://oryx.contextual.ai/advanced",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://oryx.contextual.ai/hooks",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://oryx.contextual.ai/composition",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://oryx.contextual.ai/styling",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://oryx.contextual.ai/proxy",
      lastModified: getDate(2025, 12, 1),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
