"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { getPcs } from "@/lib/actions/pc"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Lock, Unlock, RefreshCw, Settings, Monitor, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { lockPC, unlockPC, getPCStatus, type PCStatus } from "@/lib/pc-api"
import { ScheduleDialog } from "./schedule-dialog"

interface PC {
  id: string
  name: string
  ipAddress: string
  port: number
  password: string
  createdAt: Date
  updatedAt: Date
}

interface PCWithStatus extends PC {
  status?: PCStatus
  statusLoading?: boolean
  statusError?: string
}

export function PcControlDashboard() {
  const [pcs, setPcs] = useState<PCWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedPc, setSelectedPc] = useState<PC | null>(null)
  const { toast } = useToast()

  const fetchPcs = useCallback(async () => {
    try {
      const { data, error } = await getPcs()

      if (error) throw new Error(error)
      // Prisma returns Date objects, which is fine for state
      setPcs((data || []).map((pc) => ({ ...pc, statusLoading: false })))
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

  const fetchPCStatus = useCallback(async (pc: PCWithStatus) => {
    setPcs((prev) => prev.map((p) => (p.id === pc.id ? { ...p, statusLoading: true, statusError: undefined } : p)))

    try {
      const status = await getPCStatus(pc.ipAddress, pc.port)
      setPcs((prev) => prev.map((p) => (p.id === pc.id ? { ...p, status, statusLoading: false } : p)))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get status"
      setPcs((prev) =>
        prev.map((p) => (p.id === pc.id ? { ...p, statusLoading: false, statusError: errorMessage } : p)),
      )
    }
  }, [])

  const handleLockPC = async (pc: PCWithStatus) => {
    try {
      await lockPC(pc.ipAddress, pc.port, pc.password)
      toast({
        title: "Success",
        description: `${pc.name} locked successfully`,
      })
      // Refresh status after action
      setTimeout(() => fetchPCStatus(pc), 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to lock PC"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleUnlockPC = async (pc: PCWithStatus) => {
    try {
      await unlockPC(pc.ipAddress, pc.port, pc.password)
      toast({
        title: "Success",
        description: `${pc.name} unlocked successfully`,
      })
      // Refresh status after action
      setTimeout(() => fetchPCStatus(pc), 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unlock PC"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleScheduleClick = (pc: PC) => {
    setSelectedPc(pc)
    setScheduleDialogOpen(true)
  }

  const refreshAllStatuses = () => {
    pcs.forEach((pc) => fetchPCStatus(pc))
  }

  useEffect(() => {
  fetchPcs()
  }, [fetchPcs])

  // Auto-fetch status for all PCs when data is loaded or the set of PCs changes (not their status)
  const pcIds = useMemo(() => pcs.map((p) => p.id).join(','), [pcs])
  const pcsRef = useRef<PCWithStatus[]>([])
  useEffect(() => {
    pcsRef.current = pcs
  }, [pcs])
  useEffect(() => {
    if (pcsRef.current.length > 0 && !loading) {
      pcsRef.current.forEach((pc) => fetchPCStatus(pc))
    }
  }, [loading, pcIds, fetchPCStatus])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading control dashboard...</div>
      </div>
    )
  }

  if (pcs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Monitor className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No PCs to control</h3>
          <p className="text-muted-foreground text-center">
            Add some PCs in the management section to start controlling them
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Control Dashboard</h2>
          <p className="text-muted-foreground">Monitor and control your remote PCs</p>
        </div>
        <Button onClick={refreshAllStatuses} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pcs.map((pc) => (
          <Card key={pc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pc.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => fetchPCStatus(pc)} disabled={pc.statusLoading}>
                  <RefreshCw className={`w-4 h-4 ${pc.statusLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {pc.ipAddress}:{pc.port}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Display */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {pc.statusLoading ? (
                  <Badge variant="secondary">Checking...</Badge>
                ) : pc.statusError ? (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    <Badge variant="destructive">Error</Badge>
                  </div>
                ) : pc.status ? (
                  <Badge variant={pc.status.locked ? "destructive" : "default"}>
                    {pc.status.locked ? "Locked" : "Unlocked"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Unknown</Badge>
                )}
              </div>

              <Separator />

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleLockPC(pc)} variant="destructive" size="sm" disabled={pc.statusLoading}>
                  <Lock className="w-4 h-4 mr-1" />
                  Lock
                </Button>
                <Button onClick={() => handleUnlockPC(pc)} variant="default" size="sm" disabled={pc.statusLoading}>
                  <Unlock className="w-4 h-4 mr-1" />
                  Unlock
                </Button>
              </div>

              <Button onClick={() => handleScheduleClick(pc)} variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Schedule Settings
              </Button>

              {pc.statusError && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">{pc.statusError}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ScheduleDialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen} pc={selectedPc} />
    </div>
  )
}
