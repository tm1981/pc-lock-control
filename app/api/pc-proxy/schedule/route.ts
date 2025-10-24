import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { ip, port, password, schedule } = await req.json()
    if (!ip || !port || !password || !schedule) {
      return NextResponse.json({ error: "Missing ip, port, password, or schedule" }, { status: 400 })
    }

    const resp = await fetch(`http://${ip}:${port}/api/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        enabled: !!schedule.enabled,
        start: schedule.start,
        end: schedule.end,
      }),
    })

    const text = await resp.text()
    const data = (() => {
      try {
        return JSON.parse(text)
      } catch {
        return { raw: text }
      }
    })()

    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || resp.statusText, details: data }, { status: resp.status })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
