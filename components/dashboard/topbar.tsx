import Link from 'next/link'

export default function Topbar() {
  return (
    <header className="border-b bg-white px-4 py-4 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Welcome back</p>
          <h2 className="text-lg font-semibold">Founder workspace</h2>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/billing" className="rounded-md border px-3 py-2 text-sm">
            Billing
          </Link>
          <Link href="/my-offers/new" className="rounded-md bg-black px-3 py-2 text-sm text-white">
            New offer
          </Link>
        </div>
      </div>
    </header>
  )
}