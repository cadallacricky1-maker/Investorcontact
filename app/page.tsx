import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-4xl font-semibold">Investor Match</h1>
      <p className="mt-4 max-w-2xl text-gray-600">
        Connect founders and investors through paid listings and consent-based contact requests.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/pricing" className="rounded-md bg-black px-4 py-2 text-white">
          Pricing
        </Link>
        <Link href="/login" className="rounded-md border px-4 py-2">
          Login
        </Link>
      </div>
    </main>
  )
}