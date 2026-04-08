"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatsCard,
  StatusBadge,
  AvatarWithFallback,
  EmptyState,
} from "@/components/global";
import {
  Briefcase,
  FileText,
  ArrowRight,
  Plus,
  Video,
  Sparkles,
  CheckCircle,
  PauseCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";
import { dashboardServices } from "@/lib/services/Dashboard.services";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

type DashboardData = {
  stats: {
    jobs: {
      total: number;
      published: number;
      draft: number;
      closed: number;
      paused: number;
    };
    applications: {
      total: number;
      pending: number;
      shortlisted: number;
      ai_interview_scheduled: number;
      ai_interview_complete: number;
      ai_shortlisted: number;
      ai_rejected: number;
      accepted: number;
      rejected: number;
    };
    interviews: {
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      analyzed: number;
    };
  };
  charts: {
    jobsWithApplications: {
      title: string;
      applicationCount: number;
      interviewCount: number;
      completedInterviews: number;
    }[];
    applicationsByStatus: { _id: string; count: number }[];
    interviewsByStatus: { _id: string; count: number }[];
    applicationsOverTime: { _id: string; count: number }[];
  };
  recent: {
    applications: {
      _id: string;
      applicantName: string;
      applicantEmail: string;
      status: string;
      createdAt: string;
      jobId: { _id: string; title: string } | string;
      aiResumeToJobAnalysis?: {
        aiScore: number;
        jobRelevanceScore: number;
        jobMatchScore: number;
      };
    }[];
    jobs: {
      _id: string;
      title: string;
      status: string;
      totalApplicants: number;
      createdAt: string;
    }[];
  };
  company: { name: string; industry: string; size: string };
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  shortlisted: "#10b981",
  ai_interview_scheduled: "#3b82f6",
  ai_interview_complete: "#6366f1",
  ai_shortlisted: "#22c55e",
  ai_rejected: "#ef4444",
  accepted: "#059669",
  rejected: "#dc2626",
  in_progress: "#f59e0b",
  completed: "#10b981",
  analyzed: "#8b5cf6",
};

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardServices.getCompanyDashboard();
        setData(res.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const charts = data?.charts;
  const recent = data?.recent;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={
          data?.company?.name
            ? `Welcome back! Here's an overview of ${data.company.name}'s hiring activity.`
            : "Welcome back! Here's an overview of your hiring activity."
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/jobs/new?mode=ai">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Job Post
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

      {/* Top-level stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Jobs"
          value={stats?.jobs.total ?? 0}
          description={`${stats?.jobs.published ?? 0} published`}
          icon={Briefcase}
        />
        <StatsCard
          title="Total Applications"
          value={stats?.applications.total ?? 0}
          description={`${stats?.applications.pending ?? 0} pending review`}
          icon={FileText}
        />
        <StatsCard
          title="AI Interviews"
          value={stats?.interviews.total ?? 0}
          description={`${stats?.interviews.completed ?? 0} completed`}
          icon={Video}
        />
        <StatsCard
          title="Shortlisted"
          value={
            (stats?.applications.shortlisted ?? 0) +
            (stats?.applications.ai_shortlisted ?? 0)
          }
          description={`${stats?.applications.accepted ?? 0} accepted`}
          icon={CheckCircle}
        />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          title="Published"
          value={stats?.jobs.published ?? 0}
          icon={CheckCircle}
        />
        <StatsCard
          title="Drafts"
          value={stats?.jobs.draft ?? 0}
          icon={FileText}
        />
        <StatsCard
          title="Paused"
          value={stats?.jobs.paused ?? 0}
          icon={PauseCircle}
        />
        <StatsCard
          title="Closed"
          value={stats?.jobs.closed ?? 0}
          icon={XCircle}
        />
        <StatsCard
          title="In Progress"
          value={stats?.interviews.in_progress ?? 0}
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Applications (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.applicationsOverTime &&
            charts.applicationsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={charts.applicationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs with Application Counts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Jobs by Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.jobsWithApplications &&
            charts.jobsWithApplications.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={charts.jobsWithApplications.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="title"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={120}
                    tickFormatter={(v) =>
                      v.length > 18 ? v.slice(0, 18) + "…" : v
                    }
                  />
                  <Tooltip />
                  <Bar
                    dataKey="applicationCount"
                    fill="hsl(var(--chart-1))"
                    name="Applications"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="interviewCount"
                    fill="hsl(var(--chart-2))"
                    name="Interviews"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.applicationsByStatus &&
            charts.applicationsByStatus.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={charts.applicationsByStatus}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {charts.applicationsByStatus.map((entry, i) => (
                        <Cell
                          key={entry._id}
                          fill={
                            STATUS_COLORS[entry._id] ||
                            PIE_COLORS[i % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        formatStatusLabel(name as string),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {charts.applicationsByStatus.map((entry, i) => (
                    <div
                      key={entry._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[entry._id] ||
                            PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-muted-foreground flex-1">
                        {formatStatusLabel(entry._id)}
                      </span>
                      <span className="font-medium">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interviews by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interviews by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.interviewsByStatus &&
            charts.interviewsByStatus.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={charts.interviewsByStatus}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {charts.interviewsByStatus.map((entry, i) => (
                        <Cell
                          key={entry._id}
                          fill={
                            STATUS_COLORS[entry._id] ||
                            PIE_COLORS[i % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        formatStatusLabel(name as string),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {charts.interviewsByStatus.map((entry, i) => (
                    <div
                      key={entry._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[entry._id] ||
                            PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-muted-foreground flex-1">
                        {formatStatusLabel(entry._id)}
                      </span>
                      <span className="font-medium">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/applications">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent?.applications && recent.applications.length > 0 ? (
              <div className="space-y-3">
                {recent.applications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarWithFallback name={app.applicantName} size="md" />
                      <div>
                        <p className="font-medium">{app.applicantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {typeof app.jobId === "object"
                            ? app.jobId.title
                            : "Job"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {app.aiResumeToJobAnalysis?.aiScore != null &&
                        app.aiResumeToJobAnalysis.aiScore > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {app.aiResumeToJobAnalysis.aiScore}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              AI Score
                            </p>
                          </div>
                        )}
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No applications yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Jobs</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs/all">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent?.jobs && recent.jobs.length > 0 ? (
              <div className="space-y-3">
                {recent.jobs.map((job) => (
                  <Link
                    key={job._id}
                    href={`/jobs/${job._id}`}
                    className="block p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.totalApplicants} applicants</span>
                      <span>
                        {new Date(job.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No jobs yet"
                description="Post your first job to get started."
                action={{ label: "Post New Job", href: "/jobs/new" }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
