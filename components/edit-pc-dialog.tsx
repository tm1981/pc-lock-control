"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { updatePc } from "@/lib/actions/pc"
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
import { useToast } from "@/hooks/use-toast"

interface PC {
  id: string
  name: string
  ipAddress: string
  port: number
  password: string
  createdAt: Date
  updatedAt: Date
}

interface EditPcDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pc: PC | null
  onSuccess: () => void
}

export function EditPcDialog({ open, onOpenChange, pc, onSuccess }: EditPcDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    port: "8080",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (pc) {
      setFormData({
        name: pc.name,
        ipAddress: pc.ipAddress,
        port: pc.port.toString(),
        password: pc.password,
      })
    }
  }, [pc])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pc) return

    setLoading(true)

    const form = new FormData(e.currentTarget as HTMLFormElement)
    form.set("id", pc.id)

    try {
      const result = await updatePc(pc.id, form)

      if (result.error) {
        const generalError = (result.error as { general?: string[] }).general?.[0]
        const errorMsg = generalError || "Failed to update PC due to validation errors."
        throw new Error(errorMsg)
      }

      toast({
        title: "Success",
        description: "PC updated successfully",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating PC:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit PC</DialogTitle>
          <DialogDescription>Update the PC configuration details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">PC Name</Label>
              <Input
                id="edit-name"
                placeholder="My Desktop PC"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ipAddress">IP Address</Label>
              <Input
                id="edit-ipAddress"
                name="ipAddress"
                placeholder="192.168.1.100"
                value={formData.ipAddress}
                onChange={(e) => handleChange("ipAddress", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-port">Port</Label>
              <Input
                id="edit-port"
                name="port"
                type="number"
                placeholder="8080"
                value={formData.port}
                onChange={(e) => handleChange("port", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="Enter PC password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update PC"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
