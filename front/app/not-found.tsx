import Link from "next/link";

export default function NotFound() {
  return (
    <section style={{ minHeight: "80vh" }}>
      <div>
        <h1>404: Page not found!</h1>
        <p>The page you requested does not exist!</p>
        <p>
          <Link href="/" prefetch>
            Return to home
          </Link>
        </p>
        <p>
          <Link href="https://github.com/HakierGrzonzo/mma/issues">
            Report an issue
          </Link>
        </p>
      </div>
    </section>
  );
}
