import Sidebar from '@/components/dashboard/sidebar'
import Topbar from '@/components/dashboard/topbar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="border-r bg-white md:w-72 md:shrink-0">
        <Sidebar />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}