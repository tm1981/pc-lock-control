"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { getScheduleByPcId, upsertSchedule } from "@/lib/actions/schedule"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { setPCSchedule, type ScheduleConfig } from "@/lib/pc-api"

interface PC {
  id: string
  name: string
  ipAddress: string
  port: number
  password: string
  createdAt: Date
  updatedAt: Date
}

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pc: PC | null
  onSuccess?: () => void
}

export function ScheduleDialog({ open, onOpenChange, pc, onSuccess }: ScheduleDialogProps) {
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    enabled: false,
    start: "22:00",
    end: "07:00",
  })
  const [loading, setLoading] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const { toast } = useToast()

  const loadExistingSchedule = useCallback(async () => {
    if (!pc) return

  setLoadingExisting(true)
  try {
      const { data, error } = await getScheduleByPcId(pc.id)

      if (error) {
        // If error is not "not found", throw it
        if (error !== "Failed to fetch schedule.") {
          throw new Error(error)
        }
      }

      if (data) {
        setSchedule({
          enabled: data.enabled,
          start: data.startTime,
          end: data.endTime,
        })
      } else {
        setSchedule({
          enabled: false,
          start: "22:00",
          end: "07:00",
        })
      }
    } catch (error) {
      console.error("Error loading existing schedule:", error)
      toast({
        title: "Warning",
        description: "Could not load existing schedule, using defaults",
        variant: "destructive",
      })
    } finally {
      setLoadingExisting(false)
    }
  }, [pc, toast])

  // Load existing schedule when dialog opens
  useEffect(() => {
    if (open && pc) {
      loadExistingSchedule()
    }
  }, [open, pc, loadExistingSchedule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pc) return

    setLoading(true)

    const formData = new FormData()
    formData.append("pcId", pc.id)
    formData.append("enabled", schedule.enabled ? "on" : "off")
    formData.append("startTime", schedule.start)
    formData.append("endTime", schedule.end)

    try {
      // Save to database first using Server Action
      const result = await upsertSchedule(formData)

      if (result.error) {
        const generalError = (result.error as { general?: string[] }).general?.[0]
        const errorMsg = generalError || "Failed to save schedule due to validation errors."
        throw new Error(errorMsg)
      }

      // Then send to PC API
      await setPCSchedule(pc.ipAddress, pc.port, pc.password, schedule)

      toast({
        title: "Success",
        description: `Schedule updated for ${pc.name}`,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update schedule"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleChange = (field: keyof ScheduleConfig, value: boolean | string) => {
    setSchedule((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Settings</DialogTitle>
          <DialogDescription>
            {pc ? `Configure automatic lock schedule for ${pc.name}` : "Configure automatic lock schedule"}
          </DialogDescription>
        </DialogHeader>

        {loadingExisting ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading current schedule...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable Schedule</Label>
                  <div className="text-sm text-muted-foreground">Automatically lock PC during specified hours</div>
                </div>
                <Switch
                  id="enabled"
                  checked={schedule.enabled}
                  onCheckedChange={(checked) => handleScheduleChange("enabled", checked)}
                />
              </div>

              {schedule.enabled && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="start">Lock Time</Label>
                    <Input
                      id="start"
                      type="time"
                      value={schedule.start}
                      onChange={(e) => handleScheduleChange("start", e.target.value)}
                      required
                    />
                    <div className="text-xs text-muted-foreground">PC will be locked starting at this time</div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end">Unlock Time</Label>
                    <Input
                      id="end"
                      type="time"
                      value={schedule.end}
                      onChange={(e) => handleScheduleChange("end", e.target.value)}
                      required
                    />
                    <div className="text-xs text-muted-foreground">PC will be unlocked at this time</div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Schedule"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
