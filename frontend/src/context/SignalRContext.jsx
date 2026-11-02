import React, { createContext, useEffect, useState, useRef, useCallback } from 'react'
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'

export const SignalRContext = createContext(null)

const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5013/hubs/attendance'

export function SignalRProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false)
  const [latestEvent, setLatestEvent] = useState(null)
  const connectionRef = useRef(null)
  const listenersRef = useRef([])

  // Play a soft notification beep using Web Audio API as fallback
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {
        // Fallback to Web Audio API beep
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
          gain.gain.setValueAtTime(0.1, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.25)
        } catch {
          // Ignore audio errors if audio context blocked by browser
        }
      })
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')

    const newConnection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build()

    connectionRef.current = newConnection

    newConnection.on('ReceiveAttendanceEvent', (eventData) => {
      console.log('[SignalR] Received attendance event:', eventData)
      setLatestEvent(eventData)
      playNotificationSound()
      listenersRef.current.forEach(callback => {
        try {
          callback(eventData)
        } catch (err) {
          console.error('[SignalR] Error in event listener callback:', err)
        }
      })
    })

    const startConnection = async () => {
      try {
        await newConnection.start()
        setIsConnected(true)
        console.log('[SignalR] Connected successfully to', SIGNALR_HUB_URL)
      } catch (err) {
        setIsConnected(false)
        console.warn('[SignalR] Initial connection failed, will retry...', err.message)
      }
    }

    startConnection()

    newConnection.onclose(() => setIsConnected(false))
    newConnection.onreconnecting(() => setIsConnected(false))
    newConnection.onreconnected(() => setIsConnected(true))

    return () => {
      if (newConnection) {
        newConnection.stop()
      }
    }
  }, [playNotificationSound])

  const subscribeAttendance = useCallback((callback) => {
    listenersRef.current.push(callback)
    return () => {
      listenersRef.current = listenersRef.current.filter(cb => cb !== callback)
    }
  }, [])

  return (
    <SignalRContext.Provider value={{ isConnected, latestEvent, subscribeAttendance }}>
      {children}
    </SignalRContext.Provider>
  )
}

export default SignalRContext

