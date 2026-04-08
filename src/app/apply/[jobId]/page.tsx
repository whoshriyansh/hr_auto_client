"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  MapPin,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { jobServices } from "@/lib/services/Jobs.services";
import { applicationServices } from "@/lib/services/Application.services";
import { SERVER_URL } from "@/lib/api/axiosInstance";
import { toast } from "sonner";

type ApiError = {
  response?: { data?: { message?: string } };
};

interface JobDetails {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  mode: string;
  workType: string;
  experienceLevel: string;
  salary?: number;
  disclosed?: boolean;
  location?: { city?: string; state?: string };
  applicationDeadline?: string;
  companyId?: { name?: string; logo?: string };
}

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobServices.get(jobId);
        setJob(res.data);
      } catch {
        setError("Job not found or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Invalid email address";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    if (!resume) errors.resume = "Resume is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("jobId", jobId);
      if (form.coverLetter) fd.append("coverLetter", form.coverLetter);
      if (resume) fd.append("resume", resume);

      await applicationServices.publicApply(fd);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: unknown) {
      const msg =
        (err as ApiError).response?.data?.message ||
        "Failed to submit application.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Job Not Found</h2>
            <p className="text-muted-foreground">
              {error || "This job listing is no longer available."}
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">Application Submitted!</h2>
            <p className="text-muted-foreground">
              Thank you for applying to <strong>{job.title}</strong>. We&apos;ll
              review your application and get back to you soon.
            </p>
            <p className="text-sm text-muted-foreground">
              Your resume is being analyzed by our AI system, and you&apos;ll
              receive updates via email.
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDeadlinePassed =
    job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                H
              </span>
            </div>
            <span className="font-semibold text-lg">HR Auto</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {job.companyId?.logo ? (
                    <img
                      src={`${SERVER_URL}/${job.companyId.logo}`}
                      alt="Company"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {job.companyId?.name || "Company"}
                  </span>
                </div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {job.workType}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {job.mode}
                  </Badge>
                  {job.location?.city && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location.city}
                      {job.location.state ? `, ${job.location.state}` : ""}
                    </Badge>
                  )}
                </div>

                <Badge variant="outline">{job.experienceLevel}</Badge>

                {job.disclosed && job.salary && (
                  <p className="text-sm font-medium">
                    Salary: ${job.salary.toLocaleString()}/yr
                  </p>
                )}

                {job.applicationDeadline && (
                  <p
                    className={`text-sm ${isDeadlinePassed ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {isDeadlinePassed ? "Deadline passed: " : "Apply by: "}
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                )}

                <Separator />

                {job.skills?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isDeadlinePassed ? (
                  <div className="text-center py-8 space-y-2">
                    <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
                    <p className="font-medium">
                      Application deadline has passed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This position is no longer accepting applications.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={form.name}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, name: e.target.value }));
                          if (formErrors.name)
                            setFormErrors((p) => ({ ...p, name: "" }));
                        }}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-destructive">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, email: e.target.value }));
                          if (formErrors.email)
                            setFormErrors((p) => ({ ...p, email: "" }));
                        }}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, phone: e.target.value }));
                          if (formErrors.phone)
                            setFormErrors((p) => ({ ...p, phone: "" }));
                        }}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-destructive">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resume">Resume (PDF) *</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setResume(file);
                            if (formErrors.resume)
                              setFormErrors((p) => ({ ...p, resume: "" }));
                          }}
                        />
                        <label htmlFor="resume" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          {resume ? (
                            <p className="text-sm font-medium text-primary">
                              {resume.name}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Click to upload your resume
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, DOCX (max 5MB)
                          </p>
                        </label>
                      </div>
                      {formErrors.resume && (
                        <p className="text-sm text-destructive">
                          {formErrors.resume}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">
                        Cover Letter (Optional)
                      </Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Tell us why you're a great fit for this role..."
                        rows={5}
                        value={form.coverLetter}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            coverLetter: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, your resume will be analyzed by our AI
                      system to match you with this position.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
