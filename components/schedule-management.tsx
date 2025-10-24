"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { getPcs } from "@/lib/actions/pc"
import { toggleScheduleEnabled } from "@/lib/actions/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Clock, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScheduleDialog } from "./schedule-dialog"

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === "object" && e !== null) {
    const maybe = e as { error_description?: unknown; message?: unknown }
    if (typeof maybe.error_description === "string") return maybe.error_description
    if (typeof maybe.message === "string") return maybe.message
    try {
      return JSON.stringify(e)
    } catch {
      return String(e)
    }
  }
  return String(e)
}

interface PC {
  id: string
  name: string
  ipAddress: string
  port: number
  password: string
  createdAt: Date
  updatedAt: Date
}

interface Schedule {
  id: string
  pcId: string
  enabled: boolean
  startTime: string
  endTime: string
  createdAt: Date
  updatedAt: Date
}

interface PCWithSchedule extends PC {
  schedule?: Schedule | null
}

export function ScheduleManagement() {
  const [pcsWithSchedules, setPcsWithSchedules] = useState<PCWithSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedPc, setSelectedPc] = useState<PC | null>(null)
  const { toast } = useToast()

  const fetchPcsWithSchedules = useCallback(async () => {
    try {
      // getPcs returns PCs with their schedules included
      const { data, error } = await getPcs()

      if (error) throw new Error(error)

      // The data structure from getPcs already matches PCWithSchedule
      setPcsWithSchedules(data || [])
    } catch (error) {
      const msg = getErrorMessage(error)
      console.error("Error fetching PCs with schedules:", msg)
      toast({
        title: "Error",
        description: "Failed to fetch schedule data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const toggleSchedule = async (pc: PCWithSchedule) => {
    try {
      const newEnabled = !pc.schedule?.enabled

      const { error } = await toggleScheduleEnabled(pc.id, newEnabled)

      if (error) throw new Error(error)

      toast({
        title: "Success",
        description: `Schedule ${newEnabled ? "enabled" : "disabled"} for ${pc.name}`,
      })

      // Refresh data by updating local state (optimistic update is better, but full refresh is safer for now)
      fetchPcsWithSchedules()
    } catch (error) {
      console.error("Error toggling schedule:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update schedule",
        variant: "destructive",
      })
    }
  }

  const handleConfigureSchedule = (pc: PC) => {
    setSelectedPc(pc)
    setScheduleDialogOpen(true)
  }

  const isCurrentlyInSchedule = (schedule: Schedule): boolean => {
    if (!schedule.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = schedule.startTime.split(":").map(Number)
    const [endHour, endMin] = schedule.endTime.split(":").map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight schedules (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }

  useEffect(() => {
    fetchPcsWithSchedules()
  }, [fetchPcsWithSchedules])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading schedule data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Schedule Management</h2>
        <p className="text-muted-foreground">Configure automatic lock/unlock schedules for your PCs</p>
      </div>

      {pcsWithSchedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No PCs available</h3>
            <p className="text-muted-foreground text-center">Add some PCs to configure their schedules</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pcsWithSchedules.map((pc) => (
            <Card key={pc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pc.name}</CardTitle>
                  <Switch
                    checked={pc.schedule?.enabled || false}
                    onCheckedChange={() => toggleSchedule(pc)}
                    aria-label={`Toggle schedule for ${pc.name}`}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {pc.ipAddress}:{pc.port}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pc.schedule?.enabled ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lock Time:</span>
                        <span className="font-mono">{pc.schedule.startTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Unlock Time:</span>
                        <span className="font-mono">{pc.schedule.endTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Status:</span>
                      <Badge variant={isCurrentlyInSchedule(pc.schedule) ? "destructive" : "default"}>
                        {isCurrentlyInSchedule(pc.schedule) ? "Should be Locked" : "Should be Unlocked"}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No schedule configured</p>
                  </div>
                )}

                <Button onClick={() => handleConfigureSchedule(pc)} variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Schedule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        pc={selectedPc}
        onSuccess={fetchPcsWithSchedules}
      />
    </div>
  )
}
