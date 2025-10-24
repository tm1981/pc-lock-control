"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createPc } from "@/lib/actions/pc"
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

interface AddPcDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPcDialog({ open, onOpenChange, onSuccess }: AddPcDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    port: "8080",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget as HTMLFormElement)

    try {
      const result = await createPc(form)

      if (result.error) {
        // Handle validation errors or general errors from the server action
        const generalError = (result.error as { general?: string[] }).general?.[0]

        // Log specific field errors for debugging
        if (!generalError) {
          console.error("Field validation errors:", result.error)
        }

        const errorMsg = generalError || "Failed to add PC due to validation errors. Check console for details."
        throw new Error(errorMsg)
      }

      toast({
        title: "Success",
        description: "PC added successfully",
      })

      setFormData({ name: "", ipAddress: "", port: "8080", password: "" })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error adding PC:", error)
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
          <DialogTitle>Add New PC</DialogTitle>
          <DialogDescription>Add a new PC to your remote management dashboard.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="add-pc-form">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">PC Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Desktop PC"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                placeholder="192.168.1.100"
                value={formData.ipAddress}
                onChange={(e) => handleChange("ipAddress", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                name="port"
                type="number"
                placeholder="8080"
                value={formData.port}
                onChange={(e) => handleChange("port", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
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
            <Button type="submit" disabled={loading} form="add-pc-form">
              {loading ? "Adding..." : "Add PC"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
