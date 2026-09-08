'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CommuteRoute {
  origin: string
  destination: string
  departureTime: string
  seats: number
  role: 'passenger' | 'driver'
  detourTolerance: number // in minutes
  distanceMiles: number
  estDurationMinutes: number
}

export interface DriverMatch {
  id: string
  driverName: string
  driverRole: string
  driverAvatar: string
  rating: number
  verified: boolean
  vehicle: string
  availableSeats: number
  pickupTime: string
  dropoffTime: string
  pickupWalk: string
  dropoffWalk: string
  routeOverlapPct: number
  detourMinutes: number
  estimatedSplit: number
  soloCost: number
  savings: number
  breakdown: {
    fuel: number
    toll: number
    wear: number
    occupants: number
    formulaText: string
  }
}

export interface CoRider {
  id: string
  name: string
  role: string
  avatar: string
  status: 'PAID' | 'ESCROW_SECURED' | 'PENDING_DEBIT'
  amount: number
  paymentMethod: string
}

export interface LiveRideSession {
  tripId: string
  driverName: string
  vehicle: string
  origin: string
  destination: string
  eta: string
  progressPct: number
  speedMph: number
  currentLocation: string
  basePoolCost: number
  tollAdded: number
  totalOperatingCost: number
  coRiders: CoRider[]
  status: 'IN_PROGRESS' | 'COMPLETED'
}

export interface RideReceipt {
  id: string
  date: string
  corridor: string
  driverName: string
  vehicle: string
  distanceMiles: number
  operatingCost: string
  passengerSplit: number
  savingsVsSolo: number
  escrowSeal: string
}

export interface SplitRouteState {
  currentRoute: CommuteRoute
  selectedMatch: DriverMatch | null
  liveSession: LiveRideSession | null
  ytdSavings: number
  carbonAvoidedKg: number
  sharedMiles: number
  hovHoursSaved: number
  receipts: RideReceipt[]
  updateRoute: (route: Partial<CommuteRoute>) => void
  selectMatch: (match: DriverMatch) => void
  addLiveToll: (tollAmount: number) => void
  updateLiveGpsStep: (step: number) => void
  completeLiveRide: () => void
}

const DEFAULT_ROUTE: CommuteRoute = {
  origin: '420 Guerrero St, Mission District, SF',
  destination: '1955 Broadway, City Center, Oakland',
  departureTime: 'Today, 8:30 AM',
  seats: 1,
  role: 'passenger',
  detourTolerance: 8,
  distanceMiles: 14.2,
  estDurationMinutes: 26,
}

export const INITIAL_MATCHES: DriverMatch[] = [
  {
    id: 'match-1',
    driverName: 'Sarah Jenkins',
    driverRole: 'Staff Engineer at Stripe',
    driverAvatar: 'SJ',
    rating: 4.95,
    verified: true,
    vehicle: 'Tesla Model Y',
    availableSeats: 2,
    pickupTime: '8:35 AM',
    dropoffTime: '9:05 AM',
    pickupWalk: '1.1 mi walk',
    dropoffWalk: '0.2 mi to office',
    routeOverlapPct: 94,
    detourMinutes: 4,
    estimatedSplit: 4.75,
    soloCost: 34.00,
    savings: 29.25,
    breakdown: {
      fuel: 1.40,
      toll: 7.00,
      wear: 1.15,
      occupants: 2,
      formulaText: '($1.40 kWh Power + $7.00 Bay Bridge Toll + $1.15 Wear) ÷ 2 = $4.75',
    },
  },
  {
    id: 'match-2',
    driverName: 'Marcus Rivera',
    driverRole: 'Principal Architect at Gensler',
    driverAvatar: 'MR',
    rating: 4.88,
    verified: true,
    vehicle: 'Honda Accord Hybrid',
    availableSeats: 1,
    pickupTime: '8:40 AM',
    dropoffTime: '9:12 AM',
    pickupWalk: 'Right on your corner',
    dropoffWalk: 'Broadway entrance',
    routeOverlapPct: 98,
    detourMinutes: 0,
    estimatedSplit: 5.20,
    soloCost: 34.00,
    savings: 28.80,
    breakdown: {
      fuel: 1.95,
      toll: 7.00,
      wear: 1.45,
      occupants: 2,
      formulaText: '($1.95 Hybrid Fuel + $7.00 Toll + $1.45 Wear) ÷ 2 = $5.20',
    },
  },
  {
    id: 'match-3',
    driverName: 'Elena Kostas',
    driverRole: 'Biochem Researcher at UCSF',
    driverAvatar: 'EK',
    rating: 4.98,
    verified: true,
    vehicle: 'Subaru Outback',
    availableSeats: 3,
    pickupTime: '8:45 AM',
    dropoffTime: '9:18 AM',
    pickupWalk: '16th & Valencia',
    dropoffWalk: '12th St City Ctr',
    routeOverlapPct: 91,
    detourMinutes: 6,
    estimatedSplit: 4.10,
    soloCost: 34.00,
    savings: 29.90,
    breakdown: {
      fuel: 2.80,
      toll: 7.00,
      wear: 2.50,
      occupants: 3,
      formulaText: '($2.80 Gas + $7.00 Toll + $2.50 Wear) ÷ 3 = $4.10',
    },
  },
]

const INITIAL_RECEIPTS: RideReceipt[] = [
  {
    id: 'rec-1',
    date: 'OCT 14, 2026',
    corridor: 'SF (Mission) → Oakland (Broadway)',
    driverName: 'Sarah Jenkins',
    vehicle: 'Tesla Model Y',
    distanceMiles: 14.2,
    operatingCost: '$1.40 Power + $7.00 Toll + $1.15 Wear',
    passengerSplit: 4.75,
    savingsVsSolo: 29.25,
    escrowSeal: 'SR-ESCROW-88421-SF-OAK',
  },
  {
    id: 'rec-2',
    date: 'OCT 12, 2026',
    corridor: 'Oakland (Grand Lake) → SF (FiDi)',
    driverName: 'Marcus Rivera',
    vehicle: 'Honda Accord Hybrid',
    distanceMiles: 11.8,
    operatingCost: '$1.95 Fuel + $7.00 Toll + $1.45 Wear',
    passengerSplit: 5.10,
    savingsVsSolo: 28.90,
    escrowSeal: 'SR-ESCROW-76912-OAK-SF',
  },
  {
    id: 'rec-3',
    date: 'OCT 09, 2026',
    corridor: 'Berkeley (Downtown) → SF (SoMa)',
    driverName: 'Elena Kostas',
    vehicle: 'Subaru Outback',
    distanceMiles: 15.6,
    operatingCost: '$2.80 Gas + $7.00 Toll + $2.50 Wear',
    passengerSplit: 4.10,
    savingsVsSolo: 31.40,
    escrowSeal: 'SR-ESCROW-65410-BKY-SF',
  },
]

const SplitRouteContext = createContext<SplitRouteState | null>(null)

export function SplitRouteProvider({ children }: { children: React.ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<CommuteRoute>(DEFAULT_ROUTE)
  const [selectedMatch, setSelectedMatch] = useState<DriverMatch | null>(INITIAL_MATCHES[0])
  const [ytdSavings, setYtdSavings] = useState<number>(428.50)
  const [carbonAvoidedKg, setCarbonAvoidedKg] = useState<number>(194)
  const [sharedMiles, setSharedMiles] = useState<number>(384)
  const [hovHoursSaved, setHovHoursSaved] = useState<number>(4.2)
  const [receipts, setReceipts] = useState<RideReceipt[]>(INITIAL_RECEIPTS)

  const [liveSession, setLiveSession] = useState<LiveRideSession | null>({
    tripId: 'SR-8092',
    driverName: 'Sarah Jenkins',
    vehicle: 'Tesla Model Y',
    origin: '420 Guerrero St, SF',
    destination: '1955 Broadway, Oakland',
    eta: '9:04 AM',
    progressPct: 62,
    speedMph: 54,
    currentLocation: 'Bay Bridge Center Span',
    basePoolCost: 9.55,
    tollAdded: 0,
    totalOperatingCost: 9.55,
    status: 'IN_PROGRESS',
    coRiders: [
      {
        id: 'cr-driver',
        name: 'Sarah Jenkins (Driver)',
        role: 'Host & Vehicle Owner',
        avatar: 'SJ',
        status: 'ESCROW_SECURED',
        amount: 4.75,
        paymentMethod: 'Automated Escrow Direct Deposit',
      },
      {
        id: 'cr-you',
        name: 'You (Rider 1)',
        role: 'Passenger',
        avatar: 'YOU',
        status: 'PAID',
        amount: 4.75,
        paymentMethod: 'Splitwise Auto-Debit Synced',
      },
      {
        id: 'cr-2',
        name: 'Elena Kostas (Rider 2)',
        role: 'Passenger (Boarded 16th St)',
        avatar: 'EK',
        status: 'PENDING_DEBIT',
        amount: 4.75,
        paymentMethod: 'Apple Pay Transit Card',
      },
    ],
  })

  // Load persisted state if available
  useEffect(() => {
    try {
      const savedSavings = localStorage.getItem('sr_ytd_savings')
      if (savedSavings) setYtdSavings(parseFloat(savedSavings))
    } catch {
      // Ignore storage errors
    }
  }, [])

  const updateRoute = (route: Partial<CommuteRoute>) => {
    setCurrentRoute((prev) => ({ ...prev, ...route }))
  }

  const selectMatch = (match: DriverMatch) => {
    setSelectedMatch(match)
    setLiveSession({
      tripId: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: match.driverName,
      vehicle: match.vehicle,
      origin: currentRoute.origin,
      destination: currentRoute.destination,
      eta: match.dropoffTime,
      progressPct: 15,
      speedMph: 45,
      currentLocation: 'Departing Pickup Point',
      basePoolCost: match.breakdown.fuel + match.breakdown.toll + match.breakdown.wear,
      tollAdded: 0,
      totalOperatingCost: match.breakdown.fuel + match.breakdown.toll + match.breakdown.wear,
      status: 'IN_PROGRESS',
      coRiders: [
        {
          id: 'cr-driver',
          name: `${match.driverName} (Driver)`,
          role: 'Vehicle Owner',
          avatar: match.driverAvatar,
          status: 'ESCROW_SECURED',
          amount: match.estimatedSplit,
          paymentMethod: 'Escrow Vault',
        },
        {
          id: 'cr-you',
          name: 'You (Rider 1)',
          role: 'Passenger',
          avatar: 'YOU',
          status: 'PAID',
          amount: match.estimatedSplit,
          paymentMethod: 'Splitwise Auto-Debit',
        },
      ],
    })
  }

  const addLiveToll = (tollAmount: number) => {
    if (!liveSession) return
    const nextToll = liveSession.tollAdded + tollAmount
    const nextTotal = liveSession.basePoolCost + nextToll
    const riderCount = liveSession.coRiders.length
    const splitPerRider = parseFloat((nextTotal / riderCount).toFixed(2))

    setLiveSession((prev) => {
      if (!prev) return null
      return {
        ...prev,
        tollAdded: nextToll,
        totalOperatingCost: nextTotal,
        coRiders: prev.coRiders.map((cr) => ({
          ...cr,
          amount: splitPerRider,
        })),
      }
    })
  }

  const updateLiveGpsStep = (step: number) => {
    if (!liveSession) return
    const milestones = [
      { progressPct: 20, speedMph: 35, location: 'Mission District Arterial' },
      { progressPct: 45, speedMph: 52, location: 'Bay Bridge On-ramp' },
      { progressPct: 65, speedMph: 58, location: 'Bay Bridge Center Span' },
      { progressPct: 85, speedMph: 48, location: 'Oakland Toll Plaza / I-80 Split' },
      { progressPct: 100, speedMph: 20, location: 'Arrived at 1955 Broadway' },
    ]
    const milestone = milestones[step % milestones.length]
    setLiveSession((prev) => {
      if (!prev) return null
      return {
        ...prev,
        progressPct: milestone.progressPct,
        speedMph: milestone.speedMph,
        currentLocation: milestone.location,
      }
    })
  }

  const completeLiveRide = () => {
    if (!liveSession) return
    const riderSplit = liveSession.coRiders.find((c) => c.id === 'cr-you')?.amount || 4.75
    const savingsThisRide = 34.00 - riderSplit
    const newYtd = parseFloat((ytdSavings + savingsThisRide).toFixed(2))
    const newCarbon = carbonAvoidedKg + 8
    const newMiles = sharedMiles + 14

    setYtdSavings(newYtd)
    setCarbonAvoidedKg(newCarbon)
    setSharedMiles(newMiles)
    setHovHoursSaved((prev) => parseFloat((prev + 0.35).toFixed(1)))

    try {
      localStorage.setItem('sr_ytd_savings', newYtd.toString())
    } catch {
      // Ignore storage errors
    }

    const newReceipt: RideReceipt = {
      id: `rec-${Date.now()}`,
      date: 'TODAY, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      corridor: `${liveSession.origin.split(',')[0]} → ${liveSession.destination.split(',')[0]}`,
      driverName: liveSession.driverName,
      vehicle: liveSession.vehicle,
      distanceMiles: 14.2,
      operatingCost: `$${liveSession.totalOperatingCost.toFixed(2)} Shared Operating Pool`,
      passengerSplit: riderSplit,
      savingsVsSolo: savingsThisRide,
      escrowSeal: `SR-ESCROW-${Math.floor(10000 + Math.random() * 90000)}-SETTLED`,
    }

    setReceipts((prev) => [newReceipt, ...prev])
    setLiveSession((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null))
  }

  return (
    <SplitRouteContext.Provider
      value={{
        currentRoute,
        selectedMatch,
        liveSession,
        ytdSavings,
        carbonAvoidedKg,
        sharedMiles,
        hovHoursSaved,
        receipts,
        updateRoute,
        selectMatch,
        addLiveToll,
        updateLiveGpsStep,
        completeLiveRide,
      }}
    >
      {children}
    </SplitRouteContext.Provider>
  )
}

export function useSplitRoute() {
  const context = useContext(SplitRouteContext)
  if (!context) {
    throw new Error('useSplitRoute must be used within a SplitRouteProvider')
  }
  return context
}
