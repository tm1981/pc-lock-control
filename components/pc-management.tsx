"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Monitor, Edit, Trash2 } from "lucide-react"
import { AddPcDialog } from "./add-pc-dialog"
import { EditPcDialog } from "./edit-pc-dialog"
import { useToast } from "@/hooks/use-toast"
import { getPcs, deletePc as deletePcAction } from "@/lib/actions/pc"

interface PC {
  id: string
  name: string
  ipAddress: string
  port: number
  password: string
  createdAt: Date
  updatedAt: Date
}

export function PcManagement() {
  const [pcs, setPcs] = useState<PC[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPc, setEditingPc] = useState<PC | null>(null)
  const { toast } = useToast()
  const fetchPcs = useCallback(async () => {
    try {
      const { data, error } = await getPcs()

      if (error) throw new Error(error)
      setPcs(data || [])
    } catch (error) {
      console.error("Error fetching PCs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch PCs",
        variant: "destructive",
      })
    } finally {
    setLoading(false)
    }
    }, [toast])

    const deletePc = async (id: string) => {
    try {
      const { error } = await deletePcAction(id)

      if (error) throw new Error(error)

      setPcs(pcs.filter((pc) => pc.id !== id))
      toast({
        title: "Success",
        description: "PC deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting PC:", error)
      toast({
        title: "Error",
        description: "Failed to delete PC",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (pc: PC) => {
    setEditingPc(pc)
    setEditDialogOpen(true)
  }

  useEffect(() => {
    fetchPcs()
  }, [fetchPcs])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading PCs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Your PCs</h2>
          <p className="text-muted-foreground">
            {pcs.length} PC{pcs.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add PC
        </Button>
      </div>

      {pcs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No PCs configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first PC to start managing remote connections
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First PC
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pcs.map((pc) => (
            <Card key={pc.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{pc.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(pc)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deletePc(pc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IP:</span>
                    <Badge variant="secondary">{pc.ipAddress}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Port:</span>
                    <Badge variant="secondary">{pc.port}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Added:</span>
                    <span className="text-sm">{new Date(pc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPcDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={fetchPcs} />

      <EditPcDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} pc={editingPc} onSuccess={fetchPcs} />
    </div>
  )
}
