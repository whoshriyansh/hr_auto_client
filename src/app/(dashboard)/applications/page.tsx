"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  DataTable,
  DataTableColumnHeader,
  StatusBadge,
  AvatarWithFallback,
  StatsCard,
  ScoreIndicator,
  EmptyState,
  TableSkeleton,
} from "@/components/global";
import {
  MoreHorizontal,
  Eye,
  Calendar,
  FileText,
  UserCheck,
  Clock,
  XCircle,
  CheckCircle,
  FilterX,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { Application, PaginationMeta } from "@/lib/types";
import { applicationServices } from "@/lib/services/Application.services";
import { dashboardServices } from "@/lib/services/Dashboard.services";
import { jobServices } from "@/lib/services/Jobs.services";
import { SERVER_URL } from "@/lib/api/axiosInstance";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

function getJobTitle(jobId: Application["jobId"]): string {
  if (typeof jobId === "object" && jobId !== null) {
    return jobId.title;
  }
  return "—";
}

function getJobId(jobId: Application["jobId"]): string {
  if (typeof jobId === "object" && jobId !== null) {
    return jobId._id;
  }
  return jobId;
}

type Filters = {
  search: string;
  status: string;
  jobId: string;
  experienceLevel: string;
  analysisResume: string;
  page: number;
  limit: number;
};

type JobOption = { _id: string; title: string };

type AppStats = {
  total: number;
  byStatus: { _id: string; count: number }[];
  avgAiScore: number;
  avgJobMatch: number;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    jobId: "",
    experienceLevel: "",
    analysisResume: "",
    page: 1,
    limit: 10,
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.jobId) params.jobId = filters.jobId;
      if (filters.experienceLevel)
        params.experienceLevel = filters.experienceLevel;
      if (filters.analysisResume)
        params.analysisResume = filters.analysisResume;
      const res = await applicationServices.getAll(params);
      setApplications(res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.allSettled([
          dashboardServices.getApplicationStats(),
          jobServices.getMyJobs({ limit: 100 }),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
        if (jobsRes.status === "fulfilled")
          setJobs(
            (jobsRes.value.data || []).map(
              (j: { _id: string; title: string }) => ({
                _id: j._id,
                title: j.title,
              }),
            ),
          );
      } catch {}
    };
    loadMeta();
  }, []);

  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      jobId: "",
      experienceLevel: "",
      analysisResume: "",
      page: 1,
      limit: 10,
    });
    setSelectedIds(new Set());
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.jobId ||
    filters.experienceLevel ||
    filters.analysisResume;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a._id)));
    }
  };

  const handleBulkShortlist = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        applicationServices.shortlist(id),
      );
      await Promise.allSettled(promises);
      toast.success(`${selectedIds.size} applications shortlisted`);
      setSelectedIds(new Set());
      fetchApplications();
    } catch {
      toast.error("Failed to shortlist some applications");
    } finally {
      setBulkLoading(false);
    }
  };

  const getStatusCount = (status: string) =>
    stats?.byStatus.find((s) => s._id === status)?.count ?? 0;

  const columns: ColumnDef<Application>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            applications.length > 0 && selectedIds.size === applications.length
          }
          onCheckedChange={toggleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original._id)}
          onCheckedChange={() => toggleSelect(row.original._id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "applicantName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applicant" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-3">
            <AvatarWithFallback name={app.applicantName || ""} size="sm" />
            <div>
              <p className="font-medium">{app.applicantName}</p>
              <p className="text-sm text-muted-foreground">
                {app.applicantEmail}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "jobId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Job" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        return (
          <Link
            href={`/jobs/${getJobId(app.jobId)}`}
            className="text-sm hover:text-primary transition-colors"
          >
            {getJobTitle(app.jobId)}
          </Link>
        );
      },
    },
    {
      id: "aiScore",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="AI Score" />
      ),
      cell: ({ row }) => {
        const score = row.original.aiResumeToJobAnalysis?.aiScore;
        if (!score) return <span className="text-muted-foreground">—</span>;
        return <ScoreIndicator score={score} showLabel />;
      },
    },
    {
      accessorKey: "experienceLevel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Experience" />
      ),
      cell: ({ row }) => {
        const exp = row.original.experienceLevel;
        return exp ? (
          <span className="text-sm capitalize">{exp}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "analysisResume",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Analysis" />
      ),
      cell: ({ row }) => {
        return <StatusBadge status={row.getValue("analysisResume")} />;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return <StatusBadge status={row.getValue("status")} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applied" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const app = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  window.open(`${SERVER_URL}/${app.resume}`, "_blank");
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Resume
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-green-600"
                onClick={async () => {
                  try {
                    await applicationServices.shortlist(app._id);
                    toast.success("Application shortlisted");
                    fetchApplications();
                  } catch {
                    toast.error("Failed to shortlist");
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Shortlist
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={async () => {
                  try {
                    await applicationServices.updateStatus(app._id, "rejected");
                    toast.success("Application rejected");
                    fetchApplications();
                  } catch {
                    toast.error("Failed to reject");
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review and manage job applications"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Applications" },
        ]}
        actions={
          selectedIds.size > 0 ? (
            <Button
              onClick={handleBulkShortlist}
              disabled={bulkLoading}
              size="sm"
            >
              {bulkLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Shortlist {selectedIds.size} selected
            </Button>
          ) : undefined
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={stats?.total ?? 0} icon={FileText} />
        <StatsCard
          title="Pending"
          value={getStatusCount("pending")}
          icon={Clock}
        />
        <StatsCard
          title="Shortlisted"
          value={getStatusCount("shortlisted")}
          icon={UserCheck}
        />
        <StatsCard
          title="Avg AI Score"
          value={stats?.avgAiScore ? `${stats.avgAiScore}%` : "—"}
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected"
          value={getStatusCount("rejected")}
          icon={XCircle}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            {/* Search */}
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or email..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) =>
                  updateFilter("status", v === "all" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="ai_interview_scheduled">
                    AI Interview Scheduled
                  </SelectItem>
                  <SelectItem value="ai_interview_complete">
                    AI Interview Complete
                  </SelectItem>
                  <SelectItem value="ai_shortlisted">AI Shortlisted</SelectItem>
                  <SelectItem value="ai_rejected">AI Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job */}
            <div className="space-y-1.5">
              <Label className="text-xs">Job</Label>
              <Select
                value={filters.jobId || "all"}
                onValueChange={(v) =>
                  updateFilter("jobId", v === "all" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <Label className="text-xs">Experience</Label>
              <Select
                value={filters.experienceLevel || "all"}
                onValueChange={(v) =>
                  updateFilter("experienceLevel", v === "all" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="entry-level">Entry Level</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="mid-level">Mid Level</SelectItem>
                  <SelectItem value="senior-level">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Analysis Status */}
            <div className="space-y-1.5">
              <Label className="text-xs">Analysis</Label>
              <Select
                value={filters.analysisResume || "all"}
                onValueChange={(v) =>
                  updateFilter("analysisResume", v === "all" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <FilterX className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : applications.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={applications}
              showSearch={false}
              showPagination={false}
            />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters."
              : "Applications will appear here when candidates apply to your jobs."
          }
        />
      )}

      {/* Server-Side Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1}–
            {Math.min(
              pagination.currentPage * pagination.limit,
              pagination.total,
            )}{" "}
            of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => updateFilter("page", filters.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => updateFilter("page", filters.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
