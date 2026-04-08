"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  DataTable,
  DataTableColumnHeader,
  StatusBadge,
  StatsCard,
  EmptyState,
  TableSkeleton,
  CardSkeleton,
  EditJobDialog,
} from "@/components/global";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  MapPin,
  Clock,
  Users,
  FileText,
  PauseCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { jobServices } from "@/lib/services/Jobs.services";
import type { Job, JobsStats, JobStatus } from "@/lib/types";
import { toast } from "sonner";

const EXPERIENCE_LEVELS = [
  { value: "internship", label: "Internship" },
  { value: "entry-level", label: "Entry Level" },
  { value: "associate", label: "Associate" },
  { value: "mid-level", label: "Mid Level" },
  { value: "senior-level", label: "Senior Level" },
];

const WORK_TYPES = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

const SKILLS_OPTIONS = [
  "javascript",
  "react",
  "nodejs",
  "mongodb",
  "express",
  "typescript",
  "python",
  "django",
  "flask",
  "java",
  "spring boot",
  "c++",
  "html",
  "css",
  "tailwind",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "github",
  "sql",
  "postgresql",
  "firebase",
  "nextjs",
  "redux",
  "graphql",
  "rest api",
  "linux",
  "figma",
  "testing",
];

type Filters = {
  search: string;
  experienceLevel: string;
  workType: string;
  skills: string;
  status: string;
  page: number;
  limit: number;
};

export default function AllJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    experienceLevel: "",
    workType: "",
    skills: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.experienceLevel)
        params.experienceLevel = filters.experienceLevel;
      if (filters.workType) params.workType = filters.workType;
      if (filters.skills) params.skills = filters.skills;

      const [jobsRes, statsRes] = await Promise.allSettled([
        jobServices.getMyJobs(params),
        jobServices.stats(),
      ]);
      if (jobsRes.status === "fulfilled") {
        setJobs(jobsRes.value.data || []);
        if (jobsRes.value.pagination) setPagination(jobsRes.value.pagination);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (jobId: string) => {
    try {
      await jobServices.delete(jobId);
      toast.success("Job deleted");
      loadJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleUpdateStatus = async (jobId: string, status: JobStatus) => {
    try {
      await jobServices.update(jobId, { status });
      toast.success(`Job status updated to ${status}`);
      loadJobs();
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      experienceLevel: "",
      workType: "",
      skills: "",
      status: "",
      page: 1,
      limit: 10,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.experienceLevel ||
    filters.workType ||
    filters.skills ||
    filters.status;

  // Client-side status filter (backend getMyJobs doesn't have status param)
  const displayedJobs = filters.status
    ? jobs.filter((j) => j.status === filters.status)
    : jobs;

  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Job Title" />
      ),
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Link
                href={`/jobs/${job._id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {job.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {job.workType} • {job.mode}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              {job.location?.city}, {job.location?.state}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "experienceLevel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Experience" />
      ),
      cell: ({ row }) => (
        <span className="capitalize text-sm">
          {(row.getValue("experienceLevel") as string).replace("-", " ")}
        </span>
      ),
    },
    {
      accessorKey: "totalApplicants",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applicants" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("totalApplicants")}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Posted" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/jobs/${job._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingJob(job);
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(job._id, "published")}
                    disabled={job.status === "published"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Published
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(job._id, "draft")}
                    disabled={job.status === "draft"}
                  >
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(job._id, "paused")}
                    disabled={job.status === "paused"}
                  >
                    <PauseCircle className="h-4 w-4 mr-2 text-yellow-500" />
                    Paused
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(job._id, "closed")}
                    disabled={job.status === "closed"}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Closed
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(job._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredJobs = displayedJobs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage all your job postings"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "All Jobs" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/jobs/new?mode=ai">
                <Sparkles className="h-4 w-4 mr-2" />
                Post AI Job
              </Link>
            </Button>
            <Button asChild>
              <Link href="/jobs/new">
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total Jobs"
              value={stats.totalJobs}
              icon={Briefcase}
            />
            <StatsCard
              title="Published"
              value={stats.totalPublishedJobs}
              icon={CheckCircle}
            />
            <StatsCard
              title="Drafts"
              value={stats.totalDraftJobs}
              icon={FileText}
            />
            <StatsCard
              title="Paused"
              value={stats.totalPausedJobs}
              icon={PauseCircle}
            />
            <StatsCard
              title="Closed"
              value={stats.totalClosedJobs}
              icon={XCircle}
            />
          </div>
        )
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.experienceLevel || "all"}
              onValueChange={(v) =>
                updateFilter("experienceLevel", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <SelectItem key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.workType || "all"}
              onValueChange={(v) =>
                updateFilter("workType", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {WORK_TYPES.map((wt) => (
                  <SelectItem key={wt.value} value={wt.value}>
                    {wt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.skills || "all"}
              onValueChange={(v) =>
                updateFilter("skills", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {SKILLS_OPTIONS.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
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

      {/* Jobs Table */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      ) : filteredJobs.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={filteredJobs}
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
          icon={Briefcase}
          title="No jobs found"
          description="Get started by creating your first job posting."
          action={{ label: "Post New Job", href: "/jobs/new" }}
        />
      )}

      {editingJob && (
        <EditJobDialog
          job={editingJob}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditingJob(null);
          }}
          onSaved={() => {
            setEditDialogOpen(false);
            setEditingJob(null);
            loadJobs();
          }}
        />
      )}
    </div>
  );
}
