export default function RecordsPage() {
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Farm Records</h1>
      <div className="rounded border p-4 bg-muted">
        <h3 className="font-semibold mb-2">Record Structure</h3>
        <p>Records now include:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Type (Income/Expense)</li>
          <li>Category (predefined expense/income categories)</li>
          <li>Title</li>
          <li>Unit Price</li>
          <li>Quantity</li>
          <li>Total (calculated)</li>
          <li>Optional Animal association</li>
        </ul>
        <p className="mt-4">Records list and add form coming soon...</p>
      </div>
    </main>
  )
} 