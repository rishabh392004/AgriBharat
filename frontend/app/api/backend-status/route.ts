import { NextResponse } from 'next/server'

export async function GET() {
  const nodeBase = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '').replace(/\/api\/v1$/, '')
  const pyBase = (process.env.PYTHON_ML_URL || process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8001').replace(/\/+$/, '')

  const status = {
    frontend: 'healthy',
    timestamp: new Date().toISOString(),
    nodeBackend: {
      status: 'offline',
      url: nodeBase,
      latencyMs: 0,
    },
    chatbotAi: {
      status: 'offline',
      url: pyBase,
      latencyMs: 0,
    },
  }

  // 1. Check Node backend
  try {
    const start = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${nodeBase}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    status.nodeBackend.latencyMs = Date.now() - start
    status.nodeBackend.status = res.ok ? 'connected' : 'error'
  } catch {
    // Also try auth/login or scans endpoint
    try {
      const start = Date.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)
      const res = await fetch(`${nodeBase}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ping@ping.com', password: 'ping' }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      status.nodeBackend.latencyMs = Date.now() - start
      // Even a 400 or 401 proves the Node.js server and PostgreSQL are connected!
      status.nodeBackend.status = res.status > 0 ? 'connected' : 'offline'
    } catch {
      status.nodeBackend.status = 'offline'
    }
  }

  // 2. Check Python chatbot
  try {
    const start = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${pyBase}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    status.chatbotAi.latencyMs = Date.now() - start
    status.chatbotAi.status = res.ok ? 'connected' : 'offline'
  } catch {
    status.chatbotAi.status = 'offline'
  }

  return NextResponse.json(status)
}

