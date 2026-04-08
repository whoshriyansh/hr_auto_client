"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/global";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { jobServices } from "@/lib/services/Jobs.services";
import { questionServices } from "@/lib/services/Questions.services";
import { toast } from "sonner";
import type { Job } from "@/lib/types";
import type { CreateQuestionsRequest } from "@/lib/schema/Questions.schema";

type Difficulty = CreateQuestionsRequest["difficulty"];
type ExperienceLevel = CreateQuestionsRequest["experienceLevel"];

export default function NewQuestionnairePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<{
    jobId: string;
    difficulty: Difficulty | "";
    experienceLevel: ExperienceLevel | "";
  }>({
    jobId: "",
    difficulty: "",
    experienceLevel: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobServices.getMyJobs();
        setJobs(res.data || []);
      } catch {
        toast.error("Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCreate = async () => {
    if (!formData.jobId || !formData.difficulty || !formData.experienceLevel) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setCreating(true);
      await questionServices.create({
        jobId: formData.jobId,
        difficulty: formData.difficulty as Difficulty,
        experienceLevel: formData.experienceLevel as ExperienceLevel,
      });
      toast.success("Questionnaire generated successfully!");
      router.push("/Questionnaire");
    } catch {
      toast.error("Failed to generate questionnaire");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate AI Questionnaire"
        description="Use AI to generate interview questions for a job"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Questionnaires", href: "/Questionnaire" },
          { label: "New" },
        ]}
        actions={
          <Link href="/Questionnaire">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Question Generator
          </CardTitle>
          <CardDescription>
            Select a job and configure the generation parameters. Our AI will
            create relevant interview questions tailored to the role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Job *</Label>
            <Select
              value={formData.jobId}
              onValueChange={(v) => setFormData((p) => ({ ...p, jobId: v }))}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingJobs ? "Loading jobs..." : "Select a job"}
                />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty *</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, difficulty: v as Difficulty }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Experience Level *</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(v) =>
                setFormData((p) => ({
                  ...p,
                  experienceLevel: v as ExperienceLevel,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
                <SelectItem value="mid">Mid-Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating || !formData.jobId}
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            The AI will analyze the job description and skills to generate
            relevant interview questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
