export default function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 text-left">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">{title}</h1>
      <div className="prose prose-gray max-w-none">
        {children}
      </div>
    </section>
  )
}
