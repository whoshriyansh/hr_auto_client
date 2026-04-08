"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Plus, FileText, Users, Briefcase } from "lucide-react";

// ============================================================================
// STATUS BADGE
// ============================================================================

type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const statusColorMap: Record<string, StatusVariant> = {
  // Job statuses
  draft: "secondary",
  published: "success",
  paused: "warning",
  closed: "default",

  // Application statuses
  applied: "info",
  under_review: "warning",
  shortlisted: "success",
  ai_interview_scheduled: "info",
  ai_interview_completed: "success",
  ai_interview_failed: "error",
  finalised_by_ai: "success",
  interview_scheduled: "info",
  interviewed: "success",
  offer_extended: "success",
  hired: "success",
  rejected: "error",
  withdrawn: "secondary",

  // Interview statuses
  scheduled: "info",
  confirmed: "success",
  in_progress: "warning",
  completed: "success",
  cancelled: "error",
  rescheduled: "warning",
  no_show: "error",

  // AI Interview statuses
  pending: "warning",
  analyzed: "success",

  // Recommendations
  strong_yes: "success",
  yes: "success",
  neutral: "warning",
  no: "error",
  strong_no: "error",
};

const variantStyles: Record<StatusVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  secondary: "bg-secondary text-secondary-foreground",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/-/g, "_");
  const colorVariant = variant || statusColorMap[normalizedStatus] || "default";
  const displayText = status
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variantStyles[colorVariant],
        className,
      )}
    >
      {displayText}
    </span>
  );
}

// ============================================================================
// STATS CARD
// ============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600",
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PAGE HEADER
// ============================================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="mx-1">/</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="p-4 rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-md">{description}</p>
      )}
      {action && (
        <Button
          className="mt-4"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? (
            <a href={action.href}>
              <Plus className="h-4 w-4 mr-2" />
              {action.label}
            </a>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {action.label}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// SCORE INDICATOR
// ============================================================================

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreIndicator({
  score,
  maxScore = 100,
  showLabel = true,
  size = "md",
  className,
}: ScoreIndicatorProps) {
  const percentage = (score / maxScore) * 100;
  const color =
    percentage >= 80
      ? "text-emerald-600"
      : percentage >= 60
        ? "text-amber-600"
        : "text-red-600";

  const bgColor =
    percentage >= 80
      ? "bg-emerald-500"
      : percentage >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Score</span>
          <span className={cn("font-medium", color)}>{score}%</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all", bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// AVATAR WITH FALLBACK
// ============================================================================

interface AvatarWithFallbackProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarWithFallback({
  src,
  name,
  size = "md",
  className,
}: AvatarWithFallbackProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center",
        sizeStyles[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}

// ============================================================================
// SKILL TAG
// ============================================================================

interface SkillTagProps {
  skill: string;
  variant?: "default" | "outline";
  className?: string;
}

export function SkillTag({
  skill,
  variant = "default",
  className,
}: SkillTagProps) {
  return (
    <Badge
      variant={variant === "outline" ? "outline" : "default"}
      className={cn("font-normal", className)}
    >
      {skill}
    </Badge>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-10 bg-muted rounded-lg animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-32 bg-muted rounded-lg animate-pulse", className)} />
  );
}
