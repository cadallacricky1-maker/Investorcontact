import Link from 'next/link'

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-4xl font-semibold">Pricing</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <PlanCard title="Founder List" price="$9.99/mo" href="/api/stripe/checkout?plan=founder_list" />
        <PlanCard title="Investor Access" price="$19.99/mo" href="/api/stripe/checkout?plan=investor_access" />
      </div>
    </main>
  )
}

function PlanCard({ title, price, href }: { title: string; price: string; href: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-3xl font-bold">{price}</p>
      <a href={href} className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-white">
        Subscribe
      </a>
    </div>
  )
}