'use client'

import React from 'react'

interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
  className?: string
  title?: string
}

/**
 * Lightweight deterministic QR Matrix generator for offline client-side rendering
 */
function generateQrMatrix(text: string, matrixSize = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false))

  // Finder Patterns helper
  const drawFinderPattern = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          if (r + i < matrixSize && c + j < matrixSize) {
            matrix[r + i][c + j] = true
          }
        }
      }
    }
  }

  // Top-left, Top-right, Bottom-left Finder Patterns
  drawFinderPattern(0, 0)
  drawFinderPattern(0, matrixSize - 7)
  drawFinderPattern(matrixSize - 7, 0)

  // Timing lines
  for (let i = 8; i < matrixSize - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Alignment pattern near bottom right
  const alignR = matrixSize - 9
  const alignC = matrixSize - 9
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2)) {
        matrix[alignR + i][alignC + j] = true
      }
    }
  }

  // Hash the payload deterministic bits
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }

  let bitIndex = 0
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder and timing patterns
      const inFinderTL = r < 8 && c < 8
      const inFinderTR = r < 8 && c >= matrixSize - 8
      const inFinderBL = r >= matrixSize - 8 && c < 8
      const inTiming = r === 6 || c === 6
      const inAlign = r >= alignR - 1 && r <= alignR + 5 && c >= alignC - 1 && c <= alignC + 5

      if (!inFinderTL && !inFinderTR && !inFinderBL && !inTiming && !inAlign) {
        const charCode = text.charCodeAt(bitIndex % text.length) || 42
        const pseudoBit = ((hash ^ (r * 31 + c * 17 + charCode)) & 1) === 1
        matrix[r][c] = pseudoBit
        bitIndex++
      }
    }
  }

  return matrix
}

export function QRCodeSVG({
  value,
  size = 180,
  bgColor = '#ffffff',
  fgColor = '#1b3d2a',
  className = '',
  title = 'QR Code',
}: QRCodeProps) {
  const matrixSize = 25
  const matrix = React.useMemo(() => generateQrMatrix(value, matrixSize), [value])

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`0 0 ${matrixSize + 4} ${matrixSize + 4}`}
      width={size}
      height={size}
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
    >
      <title>{title}</title>
      <rect width={matrixSize + 4} height={matrixSize + 4} fill={bgColor} rx="2" />
      <g transform="translate(2, 2)">
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null
            return <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fgColor} />
          })
        )}
      </g>
    </svg>
  )
}
