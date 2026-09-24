'use client'

import React, { useEffect, useRef, useState, useId } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'

// ─── 1. PAGE HEADER ────────────────────────────────────────────────────────
export interface PageHeaderProps {
  title: string
  subtitle?: string
  kicker?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  kicker,
  backHref,
  backLabel = 'Back',
  actions,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`page-header mb-6 ${className}`}>
      {backHref && (
        <div className="mb-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md px-1.5 py-1 transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {kicker && (
            <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 m-0 mb-1">
              {kicker}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] m-0">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--muted)] max-w-2xl m-0 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

// ─── 2. SECTION HEADER ─────────────────────────────────────────────────────
export interface SectionHeaderProps {
  title: string
  kicker?: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  kicker,
  description,
  icon,
  actions,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`section-header flex items-start justify-between gap-3 mb-3.5 ${className}`}>
      <div>
        {kicker && (
          <p className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700 m-0 mb-0.5">
            {kicker}
          </p>
        )}
        <div className="flex items-center gap-2">
          {icon && <span className="text-emerald-700 shrink-0" aria-hidden="true">{icon}</span>}
          <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)] m-0">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-xs text-[var(--muted)] m-0 mt-0.5 max-w-xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

// ─── 3. PRIMARY BUTTON ─────────────────────────────────────────────────────
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'start' | 'end'
  fullWidth?: boolean
}

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'start',
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[32px] gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 min-h-[42px] gap-2 rounded-xl',
    lg: 'text-base px-5 py-2.5 min-h-[48px] gap-2.5 rounded-xl font-semibold',
  }[size]

  const variantClasses = {
    primary:
      'bg-[var(--forest)] hover:bg-[#22633e] text-white shadow-sm hover:shadow transition-all font-bold active:translate-y-[1px]',
    secondary:
      'bg-white hover:bg-[#f5faf6] text-[var(--ink)] border border-[var(--line)] hover:border-emerald-600 font-semibold shadow-xs',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white font-bold shadow-xs active:translate-y-[1px]',
    ghost:
      'bg-transparent hover:bg-emerald-50 text-[var(--ink)] font-semibold border-transparent',
  }[variant]

  const widthClass = fullWidth ? 'w-full justify-center' : 'inline-flex'

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center font-sans select-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin shrink-0" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'start' && (
            <span className="shrink-0" aria-hidden="true">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'end' && (
            <span className="shrink-0" aria-hidden="true">{icon}</span>
          )}
        </>
      )}
    </button>
  )
}

// ─── 4. SECONDARY BUTTON ───────────────────────────────────────────────────
export function SecondaryButton(props: ButtonProps) {
  return <PrimaryButton {...props} variant="secondary" />
}

// ─── 5. ICON BUTTON ────────────────────────────────────────────────────────
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'filled'
}

export function IconButton({
  'aria-label': ariaLabel,
  icon,
  size = 'md',
  variant = 'ghost',
  disabled,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 p-1 rounded-md text-xs',
    md: 'w-9 h-9 p-2 rounded-lg text-sm',
    lg: 'w-11 h-11 p-2.5 rounded-xl text-base',
  }[size]

  const variantClasses = {
    ghost: 'bg-transparent hover:bg-emerald-50 text-[var(--ink)]',
    outline: 'bg-white border border-[var(--line)] hover:border-emerald-600 text-[var(--ink)] shadow-xs',
    filled: 'bg-emerald-700 text-white hover:bg-emerald-800',
  }[variant]

  return (
    <button
      {...props}
      type={props.type || 'button'}
      aria-label={ariaLabel}
      title={props.title || ariaLabel}
      disabled={disabled}
      className={`inline-flex items-center justify-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{ariaLabel}</span>
    </button>
  )
}

// ─── 6. STATUS BADGE (NEVER COLOR ALONE) ───────────────────────────────────
export type StatusType =
  | 'Officer Verified'
  | 'Pending'
  | 'Awaiting Officer Verification'
  | 'Rejected'
  | 'Re-scan Requested'
  | 'AI Detected'
  | 'Service Unavailable'
  | 'Healthy'
  | 'Needs attention'
  | 'Active'

export interface StatusBadgeProps {
  status: StatusType | string
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const normalized = status.trim()

  const config = (() => {
    switch (normalized) {
      case 'Officer Verified':
      case 'Verified':
        return {
          icon: <CheckCircle2 size={13} className="text-emerald-700" />,
          label: 'Officer Verified',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        }
      case 'Awaiting Officer Verification':
      case 'Pending':
        return {
          icon: <Clock size={13} className="text-amber-700" />,
          label: 'Awaiting Verification',
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
        }
      case 'Rejected':
        return {
          icon: <XCircle size={13} className="text-rose-700" />,
          label: 'Diagnosis Rejected',
          bg: 'bg-rose-50 text-rose-900 border-rose-300',
        }
      case 'Re-scan Requested':
        return {
          icon: <RefreshCw size={13} className="text-orange-700" />,
          label: 'Re-scan Requested',
          bg: 'bg-orange-50 text-orange-900 border-orange-300',
        }
      case 'AI Detected':
        return {
          icon: <Info size={13} className="text-sky-700" />,
          label: 'AI Detected (Unverified)',
          bg: 'bg-sky-50 text-sky-900 border-sky-300',
        }
      case 'Service Unavailable':
        return {
          icon: <AlertTriangle size={13} className="text-rose-700" />,
          label: 'Service Unavailable',
          bg: 'bg-rose-100 text-rose-950 border-rose-400 font-bold',
        }
      case 'Healthy':
        return {
          icon: <CheckCircle2 size={13} className="text-emerald-700" />,
          label: 'Healthy Crop',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        }
      case 'Needs attention':
        return {
          icon: <AlertTriangle size={13} className="text-amber-700" />,
          label: 'Needs Attention',
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
        }
      default:
        return {
          icon: <Info size={13} className="text-emerald-700" />,
          label: normalized,
          bg: 'bg-stone-50 text-stone-900 border-stone-300',
        }
    }
  })()

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses} ${className}`}
      role="status"
    >
      <span aria-hidden="true" className="shrink-0">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

// ─── 7. RISK BADGE (NEVER COLOR ALONE) ─────────────────────────────────────
export type RiskLevel = 'Low' | 'Moderate' | 'Medium' | 'High' | 'Critical'

export interface RiskBadgeProps {
  level: RiskLevel | string
  size?: 'sm' | 'md'
  className?: string
}

export function RiskBadge({ level, size = 'md', className = '' }: RiskBadgeProps) {
  const norm = level.toLowerCase()

  const config = (() => {
    if (norm === 'critical') {
      return {
        label: 'Critical Risk',
        icon: <ShieldAlert size={13} className="text-red-700" />,
        classes: 'bg-red-100 text-red-950 border-red-300 font-bold',
      }
    }
    if (norm === 'high') {
      return {
        label: 'High Risk',
        icon: <AlertTriangle size={13} className="text-rose-700" />,
        classes: 'bg-rose-50 text-rose-900 border-rose-300 font-semibold',
      }
    }
    if (norm === 'moderate' || norm === 'medium') {
      return {
        label: 'Moderate Risk',
        icon: <Clock size={13} className="text-amber-700" />,
        classes: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
      }
    }
    return {
      label: 'Low Risk',
      icon: <ShieldCheck size={13} className="text-emerald-700" />,
      classes: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-medium',
    }
  })()

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.classes} ${sizeClasses} ${className}`}
      role="status"
    >
      <span aria-hidden="true" className="shrink-0">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

// ─── 8. EMPTY STATE ────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryAction?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 text-center rounded-2xl border border-dashed border-[var(--line)] bg-[#fcfbf9] max-w-lg mx-auto flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
        {icon || <Info size={24} aria-hidden="true" />}
      </div>
      <h3 className="text-base font-bold text-[var(--ink)] m-0 mb-1">{title}</h3>
      <p className="text-xs text-[var(--muted)] m-0 mb-4 max-w-sm leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 bg-[var(--forest)] hover:bg-[#22633e] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <span>{actionLabel}</span>
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        )}
        {onAction && actionLabel && !actionHref && (
          <PrimaryButton size="sm" onClick={onAction}>
            {actionLabel}
          </PrimaryButton>
        )}
        {secondaryAction}
      </div>
    </div>
  )
}

// ─── 9. ERROR STATE ────────────────────────────────────────────────────────
export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  onSecondary?: () => void
  className?: string
}

export function ErrorState({
  title = 'Diagnosis unavailable',
  message,
  onRetry,
  retryLabel = 'Try Again',
  secondaryHref,
  secondaryLabel,
  onSecondary,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-6 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle size={24} aria-hidden="true" />
      </div>
      <h3 className="text-base font-extrabold text-rose-950 m-0 mb-1">{title}</h3>
      <p className="text-xs text-rose-900 m-0 mb-4 leading-relaxed max-w-md mx-auto">
        {message}
      </p>
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer"
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>{retryLabel}</span>
          </button>
        )}
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-1.5 bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 text-xs font-semibold px-4 py-2 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            {secondaryLabel}
          </Link>
        )}
        {onSecondary && secondaryLabel && !secondaryHref && (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex items-center gap-1.5 bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 text-xs font-semibold px-4 py-2 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── 10. LOADING STATE ─────────────────────────────────────────────────────
export interface LoadingStateProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingState({
  title = 'Processing...',
  description,
  className = '',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <Loader2 size={32} className="text-emerald-700 animate-spin mb-3" aria-hidden="true" />
      <p className="text-sm font-bold text-[var(--ink)] m-0">{title}</p>
      {description && (
        <p className="text-xs text-[var(--muted)] m-0 mt-1 max-w-sm">{description}</p>
      )}
      <span className="sr-only">{title}</span>
    </div>
  )
}

// ─── 11. SKELETON CARD ─────────────────────────────────────────────────────
export function SkeletonCard({
  lines = 3,
  height = 'h-36',
  className = '',
}: {
  lines?: number
  height?: string
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`bg-white border border-[var(--line)] rounded-2xl p-5 ${height} flex flex-col justify-between animate-pulse ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-stone-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-3 bg-stone-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 bg-stone-200 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── 12. FORM FIELD (WCAG AA HTMLFOR / ID ASSOCIATION) ──────────────────────
export interface FormFieldProps {
  id?: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: (inputProps: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
    required?: boolean
  }) => React.ReactNode
  className?: string
}

export function FormField({
  id: explicitId,
  label,
  hint,
  error,
  required,
  children,
  className = '',
}: FormFieldProps) {
  const generatedId = useId()
  const id = explicitId || generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-field flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-rose-600" aria-hidden="true">*</span>}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        required,
      })}

      {hint && !error && (
        <p id={hintId} className="text-[11px] text-[var(--muted)] m-0">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-[11px] font-semibold text-rose-700 m-0">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── 13. ACCESSIBLE MODAL / DIALOG ─────────────────────────────────────────
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  triggerRef?: React.RefObject<HTMLElement | null>
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  triggerRef,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!isOpen) return

    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus inside modal
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable && focusable.length > 0) {
      focusable[0].focus()
    }

    // Keydown listener for Escape & Focus Trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
      // Restore focus to trigger element
      if (triggerRef?.current) {
        triggerRef.current.focus()
      }
    }
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[maxWidth]

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`w-full ${widthClass} bg-white rounded-2xl border border-[var(--line)] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <X size={18} aria-hidden="true" />
          <span className="sr-only">Close dialog</span>
        </button>

        <div className="mb-4 pr-8">
          <h2 id={titleId} className="text-xl font-bold text-[var(--ink)] m-0">
            {title}
          </h2>
          {description && (
            <p id={descId} className="text-xs text-[var(--muted)] m-0 mt-1">
              {description}
            </p>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}

// ─── 14. CONFIRM DIALOG ────────────────────────────────────────────────────
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-2.5">
        <SecondaryButton onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </SecondaryButton>
        <PrimaryButton
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </PrimaryButton>
      </div>
    </AccessibleModal>
  )
}

// ─── 15. RESPONSIVE CARD ───────────────────────────────────────────────────
export interface ResponsiveCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
  variant?: 'default' | 'elevated' | 'tinted'
  className?: string
}

export function ResponsiveCard({
  children,
  title,
  subtitle,
  action,
  variant = 'default',
  className = '',
}: ResponsiveCardProps) {
  const variantClasses = {
    default: 'bg-white border border-[var(--line)] shadow-xs',
    elevated: 'bg-white border border-[var(--line)] shadow-md',
    tinted: 'bg-[#f8faf7] border border-emerald-200 shadow-xs',
  }[variant]

  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${variantClasses} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-3 border-b border-[var(--line)]/50 pb-2.5">
          <div>
            {title && <h3 className="text-base font-bold text-[var(--ink)] m-0">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--muted)] m-0 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── 16. TIMELINE ITEM (CROP HEALTH PASSPORT & HISTORY) ────────────────────
export interface TimelineItemProps {
  date: string
  crop: string
  disease: string
  status: string
  confidence?: number
  severity?: string
  riskLevel?: string
  officerName?: string
  officerNotes?: string
  location?: string
  onAction?: () => void
  actionLabel?: string
  actionHref?: string
  isLast?: boolean
}

export function TimelineItem({
  date,
  crop,
  disease,
  status,
  confidence,
  severity,
  riskLevel,
  officerName,
  officerNotes,
  location,
  onAction,
  actionLabel,
  actionHref,
  isLast = false,
}: TimelineItemProps) {
  const isVerified = status === 'Officer Verified'

  return (
    <div className="relative pl-6 sm:pl-8 pb-6 last:pb-0">
      {/* Timeline track line */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-stone-200"
          aria-hidden="true"
        />
      )}

      {/* Node bullet */}
      <div
        className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isVerified
            ? 'bg-emerald-600 border-emerald-200 text-white'
            : 'bg-amber-100 border-amber-300 text-amber-800'
        }`}
        aria-hidden="true"
      >
        {isVerified ? <CheckCircle2 size={13} /> : <Clock size={12} />}
      </div>

      <div className="bg-white border border-[var(--line)] rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500">{date}</span>
            <span className="text-xs font-bold text-emerald-950 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              {crop}
            </span>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        <div className="flex flex-wrap items-baseline gap-2 mb-2">
          <h4 className="text-base font-extrabold text-[var(--ink)] m-0">{disease}</h4>
          {confidence !== undefined && (
            <span className="text-xs font-medium text-stone-600">
              ({confidence}% AI confidence)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          {severity && (
            <span className="text-xs text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
              Severity: <strong>{severity}</strong>
            </span>
          )}
          {riskLevel && <RiskBadge level={riskLevel} size="sm" />}
          {location && (
            <span className="text-xs text-stone-600">
              📍 {location}
            </span>
          )}
        </div>

        {isVerified && officerName && (
          <div className="mt-2 text-xs bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 text-emerald-950">
            <p className="font-bold m-0 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Certified by {officerName}</span>
            </p>
            {officerNotes && <p className="m-0 mt-1 text-emerald-900">{officerNotes}</p>}
          </div>
        )}

        {!isVerified && (
          <p className="text-xs text-amber-800 italic m-0 mt-1">
            AI result pending officer field inspection & digital certification.
          </p>
        )}

        {(actionHref || onAction) && (
          <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
            {actionHref ? (
              <Link
                href={actionHref}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                <span>{actionLabel || 'View Record'}</span>
                <ChevronRight size={13} aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                <span>{actionLabel || 'View Record'}</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 17. ACCESSIBLE TABS ───────────────────────────────────────────────────
export interface TabItem {
  id: string
  label: string
  badge?: number | string
}

export interface AccessibleTabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  ariaLabel: string
  className?: string
}

export function AccessibleTabs({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
  className = '',
}: AccessibleTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (index + 1) % tabs.length
      onChange(tabs[next].id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (index - 1 + tabs.length) % tabs.length
      onChange(tabs[prev].id)
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl border border-[var(--line)] overflow-x-auto ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              isActive
                ? 'bg-white text-[var(--forest)] shadow-xs border border-[var(--line)]/60'
                : 'text-[var(--muted)] hover:text-[var(--ink)] bg-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── 18. TOAST / ALERT BANNER ──────────────────────────────────────────────
export interface AlertBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

export function AlertBanner({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}: AlertBannerProps) {
  const config = {
    info: {
      bg: 'bg-sky-50 border-sky-300 text-sky-950',
      icon: <Info size={16} className="text-sky-700 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      icon: <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      icon: <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-950',
      icon: <AlertTriangle size={16} className="text-rose-700 shrink-0 mt-0.5" />,
    },
  }[variant]

  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status'

  return (
    <div
      role={role}
      className={`rounded-xl border p-3 flex items-start gap-2.5 text-xs ${config.bg} ${className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <div className="flex-1">
        {title && <strong className="block font-bold mb-0.5">{title}</strong>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="p-1 rounded text-stone-500 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
