'use client'

import { useState } from 'react'
import { updateGameNumbersAction } from '@/app/actions/games'
import { useRouter } from 'next/navigation'

interface AxisNumberEditorProps {
  gameId: string
  groupId: string
  homeTeam: string
  awayTeam: string
  currentHomeNumbers: number[] | null
  currentAwayNumbers: number[] | null
  onClose: () => void
}

const ALL_DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function validateAxis(numbers: (number | null)[]): { valid: boolean; duplicates: Set<number>; missing: number[] } {
  const filled = numbers.filter((n): n is number => n !== null)
  const seen = new Set<number>()
  const duplicates = new Set<number>()

  for (const n of filled) {
    if (seen.has(n)) duplicates.add(n)
    seen.add(n)
  }

  const missing = ALL_DIGITS.filter(d => !seen.has(d))
  const valid = filled.length === 10 && duplicates.size === 0 && missing.length === 0

  return { valid, duplicates, missing }
}

export function AxisNumberEditor({
  gameId,
  groupId,
  homeTeam,
  awayTeam,
  currentHomeNumbers,
  currentAwayNumbers,
  onClose,
}: AxisNumberEditorProps) {
  const [homeNumbers, setHomeNumbers] = useState<(number | null)[]>(
    currentHomeNumbers || Array(10).fill(null)
  )
  const [awayNumbers, setAwayNumbers] = useState<(number | null)[]>(
    currentAwayNumbers || Array(10).fill(null)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const homeValidation = validateAxis(homeNumbers)
  const awayValidation = validateAxis(awayNumbers)
  const canSave = homeValidation.valid && awayValidation.valid

  function handleNumberChange(axis: 'home' | 'away', index: number, value: string) {
    const num = value === '' ? null : parseInt(value)
    if (num !== null && (num < 0 || num > 9)) return

    if (axis === 'home') {
      setHomeNumbers(prev => {
        const next = [...prev]
        next[index] = num
        return next
      })
    } else {
      setAwayNumbers(prev => {
        const next = [...prev]
        next[index] = num
        return next
      })
    }
  }

  async function handleSave() {
    if (!canSave) return

    setLoading(true)
    setError('')

    const result = await updateGameNumbersAction(
      gameId,
      groupId,
      homeNumbers as number[],
      awayNumbers as number[]
    )

    if (!result.success) {
      setError(result.error || 'Failed to update numbers')
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
  }

  function renderAxisRow(
    label: string,
    teamName: string,
    numbers: (number | null)[],
    validation: ReturnType<typeof validateAxis>,
    axis: 'home' | 'away',
    color: string
  ) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${color}`}>{label}:</span>
          <span className="text-gray-300 text-sm">{teamName}</span>
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          {numbers.map((num, i) => {
            const isDuplicate = num !== null && validation.duplicates.has(num)
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">Pos {i}</span>
                <select
                  value={num === null ? '' : num}
                  onChange={(e) => handleNumberChange(axis, i, e.target.value)}
                  className={`w-9 h-9 sm:w-11 sm:h-11 text-center font-bold rounded-lg border-2 bg-black text-white appearance-none cursor-pointer text-sm sm:text-base transition-colors ${
                    isDuplicate
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : num !== null
                        ? 'border-primary-green/50'
                        : 'border-border'
                  }`}
                >
                  <option value="">-</option>
                  {ALL_DIGITS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>

        {/* Validation status */}
        <div className="text-xs">
          {validation.valid ? (
            <span className="text-primary-green">Valid - all digits 0-9 assigned</span>
          ) : (
            <div className="space-y-1">
              {validation.duplicates.size > 0 && (
                <span className="text-red-400 block">
                  Duplicate: {[...validation.duplicates].join(', ')}
                </span>
              )}
              {validation.missing.length > 0 && (
                <span className="text-yellow-400 block">
                  Missing: {validation.missing.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-border rounded-2xl p-6 w-full max-w-lg shadow-glow-primary">
        <h3 className="text-xl font-bold gradient-text mb-2">Edit Axis Numbers</h3>
        <p className="text-gray-400 text-sm mb-6">
          Each axis must have exactly one of each digit 0-9.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {renderAxisRow('Vertical', homeTeam, homeNumbers, homeValidation, 'home', 'text-primary-green')}
          {renderAxisRow('Horizontal', awayTeam, awayNumbers, awayValidation, 'away', 'text-primary-blue')}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-border rounded-lg hover:bg-card-hover text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || loading}
            className="flex-1 px-4 py-3 bg-gradient-primary text-black rounded-lg hover:shadow-glow-primary disabled:opacity-50 font-bold transition-all"
          >
            {loading ? 'Saving...' : 'Save Numbers'}
          </button>
        </div>
      </div>
    </div>
  )
}
