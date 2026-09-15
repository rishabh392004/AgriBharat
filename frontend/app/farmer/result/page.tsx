'use client'

import { useEffect, useState } from 'react'
import { DiagnosisResultView } from '@/components/explainable-ai/DiagnosisResultView'
import { predictionsByCrop } from '@/data/mock'
import { readLastPrediction } from '@/lib/prediction-store'
import { checkDiagnosisVerification } from '@/services/passportService'
import type { Prediction, PassportRecord } from '@/types'

export default function ResultPage() {
  const [result, setResult] = useState<Prediction>(predictionsByCrop.Wheat)
  const [verifiedRecord, setVerifiedRecord] = useState<PassportRecord | null>(null)

  useEffect(() => {
    const last = readLastPrediction() ?? predictionsByCrop.Wheat
    setResult(last)
    const record = checkDiagnosisVerification(last.scanId)
    setVerifiedRecord(record)
  }, [])

  return (
    <DiagnosisResultView
      prediction={result}
      verifiedRecord={verifiedRecord}
    />
  )
}

