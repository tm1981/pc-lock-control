// Utility functions for communicating with remote PC APIs
export interface PCStatus {
  locked: boolean
}

export interface ScheduleConfig {
  enabled: boolean
  start: string
  end: string
}

export interface APIResponse {
  status?: string
  locked?: boolean
  schedule?: ScheduleConfig
}

class PCAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "PCAPIError"
  }
}

export async function lockPC(ip: string, port: number, password: string): Promise<APIResponse> {
  try {
    const response = await fetch(`/api/pc-proxy/lock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip, port, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new PCAPIError(data?.error || `Failed to lock PC: ${response.statusText}`, response.status)
    }

    return data
  } catch (error) {
    if (error instanceof PCAPIError) throw error
    throw new PCAPIError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function unlockPC(ip: string, port: number, password: string): Promise<APIResponse> {
  try {
    const response = await fetch(`/api/pc-proxy/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip, port, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new PCAPIError(data?.error || `Failed to unlock PC: ${response.statusText}`, response.status)
    }

    return data
  } catch (error) {
    if (error instanceof PCAPIError) throw error
    throw new PCAPIError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getPCStatus(ip: string, port: number): Promise<PCStatus> {
  try {
    const response = await fetch(`/api/pc-proxy/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, port }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new PCAPIError(data?.error || `Failed to get PC status: ${response.statusText}`, response.status)
    }

    return data
  } catch (error) {
    if (error instanceof PCAPIError) throw error
    throw new PCAPIError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function setPCSchedule(
  ip: string,
  port: number,
  password: string,
  schedule: ScheduleConfig,
): Promise<APIResponse> {
  try {
    const response = await fetch(`/api/pc-proxy/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ip,
        port,
        password,
        schedule,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new PCAPIError(data?.error || `Failed to set PC schedule: ${response.statusText}`, response.status)
    }

    return data
  } catch (error) {
    if (error instanceof PCAPIError) throw error
    throw new PCAPIError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
