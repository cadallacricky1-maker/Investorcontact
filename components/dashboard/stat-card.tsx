export default function StatCard({
  label,
  value,
  subtext
}: {
  label: string
  value: string | number
  subtext?: string
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {subtext ? <p className="mt-2 text-sm text-gray-600">{subtext}</p> : null}
    </div>
  )
}