'use client';

import React from 'react';

export type MilestoneStatus =
  | 'pending'
  | 'submitted'
  | 'pending_review'
  | 'in_progress'
  | 'approved'
  | 'completed'
  | 'revision_requested'
  | 'disputed'
  | string;

export interface StatusBadgeProps {
  status: MilestoneStatus;
  label?: string;
  className?: string;
  disableAnimation?: boolean;
}

export function StatusBadge({
  status,
  label,
  className = '',
  disableAnimation = false,
}: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase().trim();

  const isPendingReview =
    normalized === 'submitted' ||
    normalized === 'pending_review' ||
    normalized === 'pending';

  const isApproved = normalized === 'approved' || normalized === 'completed';
  const isRevision = normalized === 'revision_requested' || normalized === 'revision';
  const isDisputed = normalized === 'disputed';
  const isInProgress = normalized === 'in_progress';

  let config = {
    text: label || 'Pending Review',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
    hasPulse: true,
  };

  if (isApproved) {
    config = {
      text: label || 'Approved',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      hasPulse: false,
    };
  } else if (isRevision) {
    config = {
      text: label || 'Revision Requested',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      textColor: 'text-rose-400',
      dotColor: 'bg-rose-400',
      hasPulse: false,
    };
  } else if (isDisputed) {
    config = {
      text: label || 'Disputed',
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      textColor: 'text-red-400',
      dotColor: 'bg-red-400',
      hasPulse: false,
    };
  } else if (isInProgress) {
    config = {
      text: label || 'In Progress',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      textColor: 'text-indigo-400',
      dotColor: 'bg-indigo-400',
      hasPulse: false,
    };
  } else if (!isPendingReview) {
    config = {
      text: label || status,
      bg: 'bg-slate-800/60',
      border: 'border-slate-700/60',
      textColor: 'text-slate-300',
      dotColor: 'bg-slate-400',
      hasPulse: false,
    };
  }

  const shouldPulse = config.hasPulse && !disableAnimation;

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.textColor} ${className}`}
    >
      {/* 6px Indicator Dot with Amber CSS Pulse Animation */}
      <span
        data-testid="status-badge-dot"
        className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
          shouldPulse ? 'motion-safe:animate-pulse ring-2 ring-amber-400/20' : ''
        }`}
        aria-hidden="true"
      />
      <span>{config.text}</span>
    </span>
  );
}

export default StatusBadge;
