import type { NextConfig } from "next";

// Фото товаров и PDF лежат в Supabase Storage — разрешаем next/image грузить их оттуда.
function supabaseImages() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return [new URL(`${url.origin}/storage/v1/object/public/**`)];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: supabaseImages(),
  },
  experimental: {
    // Загрузка фото и PDF из админки идёт через Server Actions
    serverActions: {
      bodySizeLimit: "30mb",
    },
    proxyClientMaxBodySize: "30mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
