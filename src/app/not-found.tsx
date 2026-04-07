import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <h1 className="text-7xl font-bold tracking-tight text-neutral-900">
        404
      </h1>
      <p className="mt-4 text-lg text-neutral-600">Page not found</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Back to home
      </Link>
    </div>
  );
}
