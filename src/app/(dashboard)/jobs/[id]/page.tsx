"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  StatusBadge,
  StatsCard,
  DataTable,
  DataTableColumnHeader,
  AvatarWithFallback,
  ScoreIndicator,
  CardSkeleton,
  TableSkeleton,
  EmptyState,
  EditJobDialog,
} from "@/components/global";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  Calendar,
  Share2,
  Eye,
  FileCheck,
  UserCheck,
  GraduationCap,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { jobServices } from "@/lib/services/Jobs.services";
import { applicationServices } from "@/lib/services/Application.services";
import type { Job, Application, SingleJobStats } from "@/lib/types";
import { toast } from "sonner";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [jobStats, setJobStats] = useState<SingleJobStats | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsPagination, setAppsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobRes, statsRes, appsRes] = await Promise.allSettled([
        jobServices.get(id),
        jobServices.singleStats(id),
        applicationServices.getByJob(id, { limit: 50 }),
      ]);
      if (jobRes.status === "fulfilled") setJob(jobRes.value.data);
      if (statsRes.status === "fulfilled") setJobStats(statsRes.value.data);
      if (appsRes.status === "fulfilled") {
        setJobApplications(appsRes.value.data || []);
        if (appsRes.value.pagination)
          setAppsPagination(appsRes.value.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    try {
      await jobServices.delete(id);
      toast.success("Job deleted");
      router.push("/jobs/all");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await jobServices.update(id, { status: status as Job["status"] });
      toast.success(`Job status updated to ${status}`);
      loadData();
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const handleAppStatusUpdate = async (
    applicationId: string,
    status: string,
  ) => {
    try {
      await applicationServices.updateStatus(applicationId, status);
      toast.success("Application status updated");
      loadData();
    } catch {
      toast.error("Failed to update application status");
    }
  };

  const handleAppDelete = async (applicationId: string) => {
    try {
      await applicationServices.delete(applicationId);
      toast.success("Application deleted");
      loadData();
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${id}`);
    toast.success("Application link copied!");
  };

  const applicationColumns: ColumnDef<Application>[] = [
    {
      accessorKey: "applicantName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applicant" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-3">
            <AvatarWithFallback
              name={app.applicantName || "Unknown"}
              size="sm"
            />
            <div>
              <p className="font-medium">{app.applicantName}</p>
              <p className="text-xs text-muted-foreground">
                {app.applicantEmail}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "applicantPhoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("applicantPhoneNumber")}</span>
      ),
    },
    {
      accessorKey: "aiResumeToJobAnalysis",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="AI Score" />
      ),
      cell: ({ row }) => {
        const app = row.original;
        const score = app.aiResumeToJobAnalysis?.aiScore;
        return score != null && score > 0 ? (
          <ScoreIndicator score={score} />
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "analysisResume",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Analysis" />
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("analysisResume")} />
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
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applied" />
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
        const app = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/applications/${app._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() =>
                      handleAppStatusUpdate(app._id, "shortlisted")
                    }
                  >
                    <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                    Shortlist
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAppStatusUpdate(app._id, "rejected")}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAppStatusUpdate(app._id, "accepted")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                    Accept
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleAppDelete(app._id)}
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

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The job you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/jobs/all">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.workType} • ${job.location?.city || ""}, ${job.location?.state || ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Jobs", href: "/jobs/all" },
          { label: job.title },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            {/* Edit Job Modal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <EditJobDialog
              job={job}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onSaved={() => {
                setEditDialogOpen(false);
                loadData();
              }}
            />

            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Job Info Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <StatusBadge status={job.status} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {job.totalApplicants} applications
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          {job.views} views
        </div>
      </div>

      {/* Stats Cards from API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Applications"
          value={jobStats?.totalApplications ?? 0}
          icon={FileCheck}
        />
        <StatsCard
          title="Pending"
          value={jobStats?.pendingApplications ?? 0}
          icon={Clock}
        />
        <StatsCard
          title="Shortlisted"
          value={jobStats?.shortlistedApplications ?? 0}
          icon={UserCheck}
        />
        <StatsCard
          title="AI Interviews Done"
          value={jobStats?.aiInterviewsDone ?? 0}
          icon={GraduationCap}
        />
        <StatsCard
          title="AI Shortlisted"
          value={jobStats?.ai_shortlisted ?? 0}
          icon={ThumbsUp}
        />
        <StatsCard
          title="AI Rejected"
          value={jobStats?.ai_rejected ?? 0}
          icon={ThumbsDown}
        />
      </div>

      {/* Job Details Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="capitalize">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Work Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {job.workType?.replace("-", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Work Mode</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {job.mode}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {job.location?.city}, {job.location?.state}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {job.experienceLevel?.replace("-", " ")}
                  </p>
                </div>
              </div>
              <Separator />
              {job.disclosed && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{job.salary?.toLocaleString()}
                    </p>
                    {job.equity > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {job.equity}% equity
                      </p>
                    )}
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Application Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.applicationDeadline).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/Questionnaire?job=${job._id}`}>
                  Manage Questionnaire
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Applications ({appsPagination.total || jobApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobApplications.length > 0 ? (
            <DataTable
              columns={applicationColumns}
              data={jobApplications}
              searchKey="applicantName"
              searchPlaceholder="Search applicants..."
              pageSize={10}
            />
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No applications yet"
                description="Share the job link to start receiving applications."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
