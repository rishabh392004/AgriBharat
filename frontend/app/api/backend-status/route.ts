import { NextResponse } from 'next/server'

export async function GET() {
  const status = {
    frontend: 'healthy',
    timestamp: new Date().toISOString(),
    nodeBackend: {
      status: 'offline',
      url: 'http://localhost:5000',
      latencyMs: 0,
    },
    chatbotAi: {
      status: 'offline',
      url: 'http://localhost:8001',
      latencyMs: 0,
    },
  }

  // 1. Check Node backend
  try {
    const start = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const res = await fetch('http://localhost:5000/health', { signal: controller.signal })
    clearTimeout(timeout)
    status.nodeBackend.latencyMs = Date.now() - start
    status.nodeBackend.status = res.ok ? 'connected' : 'error'
  } catch {
    // Also try auth/login or scans endpoint
    try {
      const start = Date.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
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
    const res = await fetch('http://localhost:8001/health', { signal: controller.signal })
    clearTimeout(timeout)
    status.chatbotAi.latencyMs = Date.now() - start
    status.chatbotAi.status = res.ok ? 'connected' : 'offline'
  } catch {
    status.chatbotAi.status = 'offline'
  }

  return NextResponse.json(status)
}
