import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 inline-block rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
        Built with Effect
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Simple Next Auth
      </h1>

      {/* Value Proposition */}
      <p className="mt-4 max-w-2xl text-lg text-gray-600 md:text-xl">
        A modern starter for Google and Credentials authentication in Next.js
        apps.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/signin"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-900/90 focus:outline-none focus:ring"
        >
          Get Started
        </Link>
        <Link
          href="https://github.com/sundaray/simple-next-auth"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring"
        >
          View on GitHub
        </Link>
      </div>
    </section>
  );
}
