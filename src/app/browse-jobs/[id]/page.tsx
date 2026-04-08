"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  DollarSign,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  GraduationCap,
} from "lucide-react";
import { jobServices } from "@/lib/services/Jobs.services";
import { SERVER_URL } from "@/lib/api/axiosInstance";

type JobDetail = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  mode: string;
  workType: string;
  experienceLevel: string;
  applicationDeadline: string;
  status: string;
  skills: string[];
  location?: { city?: string; state?: string; address?: string };
  salary: number;
  disclosed: boolean;
  equity: number;
  totalApplicants: number;
  views: number;
  companyId?: {
    _id: string;
    name: string;
    logo?: string;
    industry?: string;
    size?: string;
    description?: string;
  };
  createdAt: string;
};

function formatLabel(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await jobServices.get(id);
        setJob(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isDeadlinePassed =
    job?.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32 pb-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32 pb-20">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Job Not Found</h2>
              <p className="text-muted-foreground">
                This job listing may no longer be available.
              </p>
              <Button variant="outline" asChild>
                <Link href="/browse-jobs">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <Link
              href="/browse-jobs"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to all jobs
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {job.companyId?.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`${SERVER_URL}/${job.companyId.logo}`}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {job.companyId?.name || "Company"}
                    </p>
                    {job.companyId?.industry && (
                      <p className="text-xs text-muted-foreground">
                        {formatLabel(job.companyId.industry)}
                        {job.companyId.size
                          ? ` · ${job.companyId.size} employees`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                  {job.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {formatLabel(job.workType)}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatLabel(job.mode)}
                  </Badge>
                  <Badge variant="secondary">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {formatLabel(job.experienceLevel)}
                  </Badge>
                  {job.location?.city && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location.city}
                      {job.location.state ? `, ${job.location.state}` : ""}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {job.disclosed && job.salary > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary.toLocaleString()}/yr
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.totalApplicants} applicant
                    {job.totalApplicants !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Job Description</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>

              {/* Skills */}
              {job.skills?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-semibold mb-3">
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Company Info */}
              {job.companyId?.description && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg font-semibold mb-3">
                      About {job.companyId.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {job.companyId.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold">Apply for this role</h3>

                  {isDeadlinePassed ? (
                    <div className="text-center py-4 space-y-2">
                      <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                      <p className="text-sm font-medium">
                        Application deadline has passed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <>
                      {job.applicationDeadline && (
                        <p className="text-sm text-muted-foreground">
                          Apply by{" "}
                          {new Date(job.applicationDeadline).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/apply/${job._id}`}>
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Work Type</span>
                      <span className="font-medium">
                        {formatLabel(job.workType)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium">
                        {formatLabel(job.mode)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium">
                        {formatLabel(job.experienceLevel)}
                      </span>
                    </div>
                    {job.disclosed && job.salary > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Salary</span>
                        <span className="font-medium">
                          ${job.salary.toLocaleString()}/yr
                        </span>
                      </div>
                    )}
                    {job.equity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equity</span>
                        <span className="font-medium">{job.equity}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
