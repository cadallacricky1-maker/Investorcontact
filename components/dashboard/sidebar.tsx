import Link from 'next/link'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/my-offers', label: 'My offers' },
  { href: '/my-offers/new', label: 'Create offer' },
  { href: '/requests/inbox', label: 'Request inbox' },
  { href: '/billing', label: 'Billing' }
]

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col p-5">
      <div>
        <h1 className="text-xl font-semibold">Founder Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage offers and requests</p>
      </div>

      <nav className="mt-8 space-y-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <form action="/api/auth/logout" method="post" className="mt-auto">
        <button className="w-full rounded-md border px-3 py-2 text-sm">
          Logout
        </button>
      </form>
    </div>
  )
}