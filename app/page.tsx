import PcsDashboard from "@/components/pc-dashboard"

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Remote PC Manager</h1>
          <p className="text-muted-foreground mt-2">Manage and control your remote PCs from one central dashboard</p>
        </div>

        <PcsDashboard />
      </div>
    </main>
  )
}
