const env = process.env.NODE_ENV;
export const bucket_name = process.env.BUCKET;

export const PAGE_URL =
  process.env.PAGE_URL ??
  (env === "production"
    ? "https://moringmark.grzegorzkoperwas.site"
    : "http://localhost:3000");
