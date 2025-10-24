"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Define Schemas for validation
const ScheduleSchema = z.object({
  pcId: z.string().uuid(),
  enabled: z.boolean().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
})

const ScheduleUpdateSchema = ScheduleSchema.partial().extend({
  pcId: z.string().uuid(),
})

// --- READ ---

export async function getScheduleByPcId(pcId: string) {
  try {
    const schedule = await prisma.pcSchedule.findUnique({
      where: { pcId },
    })
    return { data: schedule, error: null }
  } catch (error) {
    console.error(`Error fetching schedule for PC ${pcId}:`, error)
    return { data: null, error: "Failed to fetch schedule." }
  }
}

// --- UPSERT (Create or Update) ---

export async function upsertSchedule(formData: FormData) {
  const rawData = {
    pcId: formData.get("pcId"),
    enabled: formData.get("enabled") === "on",
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  }

  const validatedFields = ScheduleSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { pcId, ...data } = validatedFields.data

  try {
    await prisma.pcSchedule.upsert({
      where: { pcId },
      update: data,
      create: {
        pcId,
        ...data,
      },
    })
    revalidatePath("/")
    return { error: null }
  } catch (error) {
    console.error("Error upserting schedule:", error)
    return { error: { general: ["Failed to save schedule."] } }
  }
}

// --- TOGGLE ENABLED STATUS ---

export async function toggleScheduleEnabled(pcId: string, enabled: boolean) {
  try {
    await prisma.pcSchedule.update({
      where: { pcId },
      data: { enabled },
    })
    revalidatePath("/")
    return { error: null }
  } catch (error) {
    console.error(`Error toggling schedule for PC ${pcId}:`, error)
    return { error: "Failed to toggle schedule status." }
  }
}