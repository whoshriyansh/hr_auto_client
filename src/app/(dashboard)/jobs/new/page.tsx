"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  PageHeader,
  TextInput,
  TextAreaInput,
  SelectInput,
  EditJobDialog,
} from "@/components/global";
import {
  ArrowLeft,
  Save,
  Send,
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  Eye,
  Loader2,
} from "lucide-react";
import { jobServices } from "@/lib/services/Jobs.services";
import { skillsServices } from "@/lib/services/Skills.services";
import type {
  CreateJobRequest,
  CreateJobAIRequest,
} from "@/lib/schema/Jobs.schema";
import type { Job } from "@/lib/types";
import { toast } from "sonner";

export default function NewJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAIMode = searchParams.get("mode") === "ai";

  const [mode, setMode] = useState<"manual" | "ai">(isAIMode ? "ai" : "manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // AI mode state
  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiJobType, setAiJobType] = useState("");
  const [aiJobMode, setAiJobMode] = useState("");
  const [aiWorkType, setAiWorkType] = useState("");
  const [aiExperienceLevel, setAiExperienceLevel] = useState("");
  const [aiSkills, setAiSkills] = useState<string[]>([]);
  const [aiLocationCity, setAiLocationCity] = useState("");
  const [aiLocationState, setAiLocationState] = useState("");
  const [aiLocationAddress, setAiLocationAddress] = useState("");
  const [aiLocationZip, setAiLocationZip] = useState("");
  const [aiSalary, setAiSalary] = useState("");
  const [aiDisclosed, setAiDisclosed] = useState(true);
  const [aiEquity, setAiEquity] = useState("");
  const [aiApplicationDeadline, setAiApplicationDeadline] = useState("");
  const [aiCreatedJob, setAiCreatedJob] = useState<Job | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Manual mode state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobMode, setJobMode] = useState<string>("remote");
  const [workType, setWorkType] = useState<string>("full-time");
  const [experienceLevel, setExperienceLevel] = useState<string>("mid-level");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationZip, setLocationZip] = useState("");
  const [salary, setSalary] = useState("");
  const [disclosed, setDisclosed] = useState(true);
  const [equity, setEquity] = useState("");
  const [createdJob, setCreatedJob] = useState<Job | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const res = await skillsServices.getAll();
        setAvailableSkills(res.data?.skills || []);
      } catch (err) {
        console.error("Failed to load skills:", err);
      }
    };
    loadSkills();
  }, []);

  const handleManualSubmit = async (status: "draft" | "published") => {
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }
    if (!jobType) {
      toast.error("Job Type is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateJobRequest = {
        title,
        description,
        jobType: jobType as CreateJobRequest["jobType"],
        mode: jobMode as CreateJobRequest["mode"],
        workType: workType as CreateJobRequest["workType"],
        experienceLevel: experienceLevel as CreateJobRequest["experienceLevel"],
        applicationDeadline: applicationDeadline || undefined,
        skills: skills.length > 0 ? skills : undefined,
        location:
          locationCity && locationState
            ? {
                address: locationAddress || locationCity,
                city: locationCity,
                state: locationState,
                zip: locationZip || "000000",
              }
            : undefined,
        salary: salary ? Number(salary) : undefined,
        disclosed,
        equity: equity ? Number(equity) : undefined,
        status,
      };
      const res = await jobServices.create(payload);
      setCreatedJob(res.data?.job || res.data);
      toast.success(
        `Job ${status === "draft" ? "saved as draft" : "published"}!`,
      );

      if (status === "published") {
        router.push("/jobs/all");
      } else {
        setPreviewOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to create job";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISubmit = async () => {
    if (!aiTitle || !aiDescription) {
      toast.error("Title and description are required for AI job creation");
      return;
    }
    if (!aiJobType) {
      toast.error("Job Type is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateJobAIRequest = {
        title: aiTitle,
        description: aiDescription,
        jobType: aiJobType as CreateJobAIRequest["jobType"],
        mode: aiJobMode ? (aiJobMode as CreateJobAIRequest["mode"]) : undefined,
        workType: aiWorkType
          ? (aiWorkType as CreateJobAIRequest["workType"])
          : undefined,
        experienceLevel: aiExperienceLevel
          ? (aiExperienceLevel as CreateJobAIRequest["experienceLevel"])
          : undefined,
        applicationDeadline: aiApplicationDeadline || undefined,
        skills: aiSkills.length > 0 ? aiSkills : undefined,
        location:
          aiLocationCity && aiLocationState
            ? {
                address: aiLocationAddress || aiLocationCity,
                city: aiLocationCity,
                state: aiLocationState,
                zip: aiLocationZip || "000000",
              }
            : undefined,
        salary: aiSalary ? Number(aiSalary) : undefined,
        disclosed: aiDisclosed,
        equity: aiEquity ? Number(aiEquity) : undefined,
      };
      const res = await jobServices.createWithAI(payload);
      setAiCreatedJob(res.data?.job || res.data);
      setPreviewOpen(true);
      toast.success("AI job created! Review and publish.");
    } catch (err: any) {
      console.error("Error Messahge:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create AI job";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      await jobServices.update(jobId, { status: "published" });
      toast.success("Job published!");
      router.push("/jobs/all");
    } catch {
      toast.error("Failed to publish job");
    }
  };

  const previewJob = mode === "ai" ? aiCreatedJob : createdJob;

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "ai" ? "Post AI Job" : "Post New Job"}
        description={
          mode === "ai"
            ? "Let AI help you create a comprehensive job posting"
            : "Create a new job posting to attract top talent"
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Jobs", href: "/jobs/all" },
          { label: mode === "ai" ? "AI Job" : "New Job" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/jobs/all">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
          </div>
        }
      />

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Post a Job
        </Button>
        <Button
          variant={mode === "ai" ? "default" : "outline"}
          onClick={() => setMode("ai")}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Post AI Job
        </Button>
      </div>

      {mode === "ai" && (
        <div className="space-y-6">
          {/* Required fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI Job Creation</CardTitle>
              </div>
              <CardDescription>
                Provide a title and brief description and AI will generate a
                complete job posting for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextInput
                label="Job Title"
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />
              <TextAreaInput
                label="Brief Description"
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="Describe the role briefly and AI will fill in the rest..."
                rows={4}
                required
              />
              <SelectInput
                label="Job Type"
                value={aiJobType}
                onValueChange={(value) => setAiJobType(value)}
                options={[
                  { value: "Indian", label: "Indian" },
                  { value: "World Wide", label: "World Wide" },
                ]}
                required
              />
            </CardContent>
          </Card>

          {/* Optional fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle>Job Details</CardTitle>
              </div>
              <CardDescription>
                All fields below are optional — AI will fill them if left blank.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <SelectInput
                  label="Work Mode"
                  value={aiJobMode}
                  onValueChange={(value) => setAiJobMode(value)}
                  options={[
                    { value: "remote", label: "Remote" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "onsite", label: "On-site" },
                  ]}
                />
                <SelectInput
                  label="Work Type"
                  value={aiWorkType}
                  onValueChange={(value) => setAiWorkType(value)}
                  options={[
                    { value: "full-time", label: "Full-time" },
                    { value: "part-time", label: "Part-time" },
                    { value: "contract", label: "Contract" },
                    { value: "freelance", label: "Freelance" },
                  ]}
                />
                <SelectInput
                  label="Experience Level"
                  value={aiExperienceLevel}
                  onValueChange={(value) => setAiExperienceLevel(value)}
                  options={[
                    { value: "internship", label: "Internship" },
                    { value: "entry-level", label: "Entry Level" },
                    { value: "associate", label: "Associate" },
                    { value: "mid-level", label: "Mid Level" },
                    { value: "senior-level", label: "Senior Level" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Required Skills</CardTitle>
              </div>
              <CardDescription>
                Optional — AI will suggest relevant skills if not provided.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label className="text-sm font-medium mb-2 block">Skills</Label>
              {aiSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {aiSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="capitalize cursor-pointer hover:bg-destructive/20"
                      onClick={() =>
                        setAiSkills(aiSkills.filter((s) => s !== skill))
                      }
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
              <Combobox
                value={null}
                onValueChange={(val: string | null) => {
                  if (val && !aiSkills.includes(val)) {
                    setAiSkills([...aiSkills, val]);
                  }
                }}
              >
                <ComboboxInput placeholder="Type to search skills..." />
                <ComboboxContent>
                  <ComboboxList>
                    {availableSkills
                      .filter((s) => !aiSkills.includes(s))
                      .map((skill) => (
                        <ComboboxItem key={skill} value={skill}>
                          <span className="capitalize">{skill}</span>
                        </ComboboxItem>
                      ))}
                    <ComboboxEmpty>No skills found</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </CardContent>
          </Card>

          {/* AI Location & Compensation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Location & Compensation</CardTitle>
              </div>
              <CardDescription>
                Optional — AI will fill these in if not provided.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="City"
                  value={aiLocationCity}
                  onChange={(e) => setAiLocationCity(e.target.value)}
                  placeholder="e.g., Bangalore"
                />
                <TextInput
                  label="State"
                  value={aiLocationState}
                  onChange={(e) => setAiLocationState(e.target.value)}
                  placeholder="e.g., Karnataka"
                />
                <TextInput
                  label="Address"
                  value={aiLocationAddress}
                  onChange={(e) => setAiLocationAddress(e.target.value)}
                  placeholder="e.g., 123 Main St"
                />
                <TextInput
                  label="ZIP Code"
                  value={aiLocationZip}
                  onChange={(e) => setAiLocationZip(e.target.value)}
                  placeholder="e.g., 560001"
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <TextInput
                  label="Salary (Annual)"
                  type="number"
                  value={aiSalary}
                  onChange={(e) => setAiSalary(e.target.value)}
                  placeholder="e.g., 1500000"
                />
                <TextInput
                  label="Equity (%)"
                  type="number"
                  value={aiEquity}
                  onChange={(e) => setAiEquity(e.target.value)}
                  placeholder="e.g., 0.5"
                />
                <div className="flex items-end gap-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={aiDisclosed}
                      onCheckedChange={setAiDisclosed}
                    />
                    <Label>Disclose Salary</Label>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Application Deadline"
                  type="date"
                  value={aiApplicationDeadline}
                  onChange={(e) => setAiApplicationDeadline(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Optional fields are not required — AI will fill all those fields
              by itself.
            </p>
            <Button
              onClick={handleAISubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Job with AI
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
              <CardDescription>
                Enter the basic details about the job position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextInput
                label="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />

              <TextAreaInput
                label="Job Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, team, and what makes this opportunity exciting..."
                rows={6}
                required
              />

              <SelectInput
                label="Job Type"
                value={jobType}
                onValueChange={(value) => setJobType(value)}
                options={[
                  { value: "Indian", label: "Indian" },
                  { value: "World Wide", label: "World Wide" },
                ]}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <SelectInput
                  label="Work Mode"
                  value={jobMode}
                  onValueChange={(value) => setJobMode(value)}
                  options={[
                    { value: "remote", label: "Remote" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "onsite", label: "On-site" },
                  ]}
                />

                <SelectInput
                  label="Work Type"
                  value={workType}
                  onValueChange={(value) => setWorkType(value)}
                  options={[
                    { value: "full-time", label: "Full-time" },
                    { value: "part-time", label: "Part-time" },
                    { value: "contract", label: "Contract" },
                    { value: "freelance", label: "Freelance" },
                  ]}
                />

                <SelectInput
                  label="Experience Level"
                  value={experienceLevel}
                  onValueChange={(value) => setExperienceLevel(value)}
                  options={[
                    { value: "internship", label: "Internship" },
                    { value: "entry-level", label: "Entry Level" },
                    { value: "associate", label: "Associate" },
                    { value: "mid-level", label: "Mid Level" },
                    { value: "senior-level", label: "Senior Level" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills Selection with Combobox */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Required Skills</CardTitle>
              </div>
              <CardDescription>
                Search and select skills required for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label className="text-sm font-medium mb-2 block">Skills</Label>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="capitalize cursor-pointer hover:bg-destructive/20"
                      onClick={() =>
                        setSkills(skills.filter((s) => s !== skill))
                      }
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
              <Combobox
                value={null}
                onValueChange={(val: string | null) => {
                  if (val && !skills.includes(val)) {
                    setSkills([...skills, val]);
                  }
                }}
              >
                <ComboboxInput placeholder="Type to search skills..." />
                <ComboboxContent>
                  <ComboboxList>
                    {availableSkills
                      .filter((s) => !skills.includes(s))
                      .map((skill) => (
                        <ComboboxItem key={skill} value={skill}>
                          <span className="capitalize">{skill}</span>
                        </ComboboxItem>
                      ))}
                    <ComboboxEmpty>No skills found</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </CardContent>
          </Card>

          {/* Location & Compensation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Location & Compensation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="City"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="e.g., Bangalore"
                />
                <TextInput
                  label="State"
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  placeholder="e.g., Karnataka"
                />
                <TextInput
                  label="Address"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g., 123 Main St"
                />
                <TextInput
                  label="ZIP Code"
                  value={locationZip}
                  onChange={(e) => setLocationZip(e.target.value)}
                  placeholder="e.g., 560001"
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <TextInput
                  label="Salary (Annual)"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g., 1500000"
                />
                <TextInput
                  label="Equity (%)"
                  type="number"
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                  placeholder="e.g., 0.5"
                />
                <div className="flex items-end gap-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={disclosed}
                      onCheckedChange={setDisclosed}
                    />
                    <Label>Disclose Salary</Label>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Application Deadline"
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleManualSubmit("draft")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleManualSubmit("published")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish Job
            </Button>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {previewJob && (
        <EditJobDialog
          job={previewJob}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          onSaved={(updated) => {
            if (mode === "ai") setAiCreatedJob(updated);
            else setCreatedJob(updated);
          }}
        />
      )}
    </div>
  );
}
