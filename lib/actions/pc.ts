"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Define Schemas for validation
const PcSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ipAddress: z.string().ip({ version: "v4", message: "Invalid IP address" }),
  port: z.coerce.number().int().min(1).max(65535).default(8080),
  password: z.string().min(1, "Password is required"),
})

const PcUpdateSchema = PcSchema.partial().extend({
  id: z.string().uuid(),
})

// --- READ ---

export async function getPcs() {
  try {
    const pcs = await prisma.pc.findMany({
      include: {
        schedule: true,
      },
      orderBy: {
        name: "asc",
      },
    })
    return { data: pcs, error: null }
  } catch (error) {
    console.error("Error fetching PCs:", error)
    return { data: null, error: "Failed to fetch PCs." }
  }
}

// --- CREATE ---

export async function createPc(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    ipAddress: formData.get("ipAddress"),
    port: formData.get("port") === "" ? undefined : formData.get("port"),
    password: formData.get("password"),
  }

  const validatedFields = PcSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error("PC creation validation failed:", validatedFields.error.flatten().fieldErrors)
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await prisma.pc.create({
      data: validatedFields.data,
    })
    revalidatePath("/")
    return { error: null }
  } catch (error) {
    console.error("Error creating PC:", error)
    return { error: { general: ["Failed to create PC."] } }
  }
}

// --- UPDATE ---

export async function updatePc(id: string, formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    ipAddress: formData.get("ipAddress"),
    port: formData.get("port") === "" ? undefined : formData.get("port"),
    password: formData.get("password"),
  }

  const validatedFields = PcUpdateSchema.safeParse({ id, ...rawData })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id: pcId, ...updateData } = validatedFields.data

  try {
    await prisma.pc.update({
      where: { id: pcId },
      data: updateData,
    })
    revalidatePath("/")
    return { error: null }
  } catch (error) {
    console.error("Error updating PC:", error)
    return { error: { general: ["Failed to update PC."] } }
  }
}

// --- DELETE ---

export async function deletePc(id: string) {
  try {
    await prisma.pc.delete({
      where: { id },
    })
    revalidatePath("/")
    return { error: null }
  } catch (error) {
    console.error("Error deleting PC:", error)
    return { error: "Failed to delete PC." }
  }
}