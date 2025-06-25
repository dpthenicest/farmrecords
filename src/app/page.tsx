import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Farm Records Dashboard</h1>
      <div className="mb-6">Welcome to your farm records dashboard!</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Categories</h2>
          <nav className="space-y-2">
            <Link href="/categories/income" className="block underline">Income Categories</Link>
            <Link href="/categories/expense" className="block underline">Expense Categories</Link>
          </nav>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Animals</h2>
          <nav className="space-y-2">
            <Link href="/animals/goat" className="block underline">Goats</Link>
            <Link href="/animals/fowl" className="block underline">Fowls</Link>
            <Link href="/animals/catfish" className="block underline">Catfish</Link>
          </nav>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Records</h2>
        <Link href="/records" className="underline">View All Records</Link>
      </div>
      
      <section className="mt-8">
        <div className="rounded border p-4 bg-muted">
          <h3 className="font-semibold mb-2">Dashboard Stats</h3>
          <p>Total Income, Expenses, and Profit tracking coming soon...</p>
        </div>
      </section>
    </main>
  )
} 