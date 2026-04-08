"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  DataTable,
  DataTableColumnHeader,
  StatsCard,
  StatusBadge,
  AvatarWithFallback,
  ScoreIndicator,
  EmptyState,
  TableSkeleton,
  CardSkeleton,
} from "@/components/global";
import {
  Video,
  Clock,
  CheckCircle,
  Copy,
  Loader2,
  BarChart3,
  MessageSquare,
  Brain,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { interviewServices } from "@/lib/services/Interview.services";
import { dashboardServices } from "@/lib/services/Dashboard.services";
import { jobServices } from "@/lib/services/Jobs.services";
import type { Interview, Job } from "@/lib/types";
import { toast } from "sonner";

type InterviewStatsData = {
  total: number;
  byStatus: { _id: string; count: number }[];
  avgOverallScore: number;
  avgTechnicalScore: number;
  avgCommunicationScore: number;
};

type Filters = {
  search: string;
  jobId: string;
  status: string;
  page: number;
  limit: number;
};

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<InterviewStatsData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    jobId: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.jobId) params.jobId = filters.jobId;

      const res = await interviewServices.getMy(params);
      setInterviews(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load interviews:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Load stats and jobs list on mount
  useEffect(() => {
    const loadMeta = async () => {
      const [statsRes, jobsRes] = await Promise.allSettled([
        dashboardServices.getInterviewStats(),
        jobServices.getMyJobs({ limit: 100 }),
      ]);
      if (statsRes.status === "fulfilled") setStatsData(statsRes.value.data);
      if (jobsRes.status === "fulfilled") setJobs(jobsRes.value.data || []);
    };
    loadMeta();
  }, []);

  const copyInterviewLink = (interview: Interview) => {
    const link = `${window.location.origin}/interview/${interview.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(interview._id);
    toast.success("Interview link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters({ search: "", jobId: "", status: "", page: 1, limit: 10 });
  };

  const hasActiveFilters = filters.search || filters.jobId || filters.status;

  // Client-side status filter (backend doesn't support status filter for getMy)
  const displayedInterviews = filters.status
    ? interviews.filter((i) => i.status === filters.status)
    : interviews;

  const stats = {
    total: statsData?.total ?? interviews.length,
    pending: interviews.filter((i) => i.status === "pending").length,
    inProgress: interviews.filter((i) => i.status === "in_progress").length,
    completed: interviews.filter(
      (i) => i.status === "completed" || i.status === "analyzed",
    ).length,
  };

  const columns: ColumnDef<Interview>[] = [
    {
      accessorKey: "candidateName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Candidate" />
      ),
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex items-center gap-3">
            <AvatarWithFallback
              name={interview.candidateName || ""}
              size="sm"
            />
            <div>
              <p className="font-medium">{interview.candidateName}</p>
              <p className="text-xs text-muted-foreground">
                {interview.candidateEmail}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "candidatePhone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("candidatePhone")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "overallScore",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="AI Score" />
      ),
      cell: ({ row }) => {
        const score = row.original.aiAnalysis?.overallScore;
        if (score == null)
          return <span className="text-muted-foreground">—</span>;
        return <ScoreIndicator score={score} showLabel />;
      },
    },
    {
      id: "recommendation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recommendation" />
      ),
      cell: ({ row }) => {
        const rec = row.original.aiAnalysis?.recommendation;
        if (!rec) return <span className="text-muted-foreground">—</span>;
        return (
          <Badge
            variant={
              rec === "strong_yes" || rec === "yes"
                ? "default"
                : rec === "neutral"
                  ? "secondary"
                  : "destructive"
            }
          >
            {rec.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "questionsAsked",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Questions" />
      ),
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <span className="text-sm">
            {interview.questionsAsked ?? 0}/{interview.questions?.length ?? 0}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/interviews/${interview._id}`)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyInterviewLink(interview)}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedId === interview._id ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading && interviews.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Interviews"
          description="Manage interviews and AI screening sessions"
          breadcrumbs={[
            { label: "Dashboard", href: "/jobs" },
            { label: "Interviews" },
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        description="Manage interviews and AI screening sessions"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Interviews" },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Interviews" value={stats.total} icon={Video} />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Loader2}
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
        />
      </div>

      {/* Average Scores */}
      {statsData &&
        (statsData.avgOverallScore > 0 || statsData.avgTechnicalScore > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Avg Overall Score"
              value={
                statsData.avgOverallScore
                  ? `${statsData.avgOverallScore}%`
                  : "—"
              }
              icon={BarChart3}
            />
            <StatsCard
              title="Avg Technical Score"
              value={
                statsData.avgTechnicalScore
                  ? `${statsData.avgTechnicalScore}%`
                  : "—"
              }
              icon={Brain}
            />
            <StatsCard
              title="Avg Communication"
              value={
                statsData.avgCommunicationScore
                  ? `${statsData.avgCommunicationScore}%`
                  : "—"
              }
              icon={MessageSquare}
            />
          </div>
        )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={(v) =>
                updateFilter("status", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.jobId || "all"}
              onValueChange={(v) => updateFilter("jobId", v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Job" />
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

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {displayedInterviews.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={displayedInterviews}
                showSearch={false}
                showPagination={false}
                pageSize={filters.limit}
              />
            </CardContent>
          </Card>

          {/* Server-side Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * filters.limit + 1}–
              {Math.min(pagination.page * filters.limit, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => updateFilter("page", filters.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => updateFilter("page", filters.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Video}
          title="No interviews found"
          description="Interviews will appear here once candidates are scheduled."
        />
      )}
    </div>
  );
}
