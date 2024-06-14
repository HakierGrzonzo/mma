const env = process.env.NODE_ENV;
export const bucket_name = process.env.BUCKET;

if (bucket_name === undefined) {
  console.warn("Running localy");
}

export const PAGE_URL =
  env === "production"
    ? "https://moringmark.grzegorzkoperwas.site"
    : "http://localhost:3000";
