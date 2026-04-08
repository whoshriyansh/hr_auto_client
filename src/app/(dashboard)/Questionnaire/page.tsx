"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatsCard, EmptyState } from "@/components/global";
import {
  Plus,
  ClipboardList,
  FileQuestion,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { questionServices } from "@/lib/services/Questions.services";
import type { Questionnaire } from "@/lib/types";

function getJobTitle(questionnaire: Questionnaire): string {
  if (typeof questionnaire.jobId === "object" && questionnaire.jobId !== null) {
    return questionnaire.jobId.title;
  }
  return "Unknown Job";
}

export default function QuestionnairePage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await questionServices.getAll();
        setQuestionnaires(res.data || []);
      } catch (err) {
        console.error("Failed to load questionnaires:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalQuestions = questionnaires.reduce(
    (acc, q) => acc + q.questions.length,
    0,
  );

  const handleDelete = async (id: string) => {
    try {
      await questionServices.delete(id);
      setQuestionnaires((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Failed to delete questionnaire:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading questionnaires...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questionnaires"
        description="Create and manage screening questionnaires for your jobs"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Questionnaires" },
        ]}
        actions={
          <Button asChild>
            <Link href="/Questionnaire/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Questionnaire
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Questionnaires"
          value={questionnaires.length}
          icon={ClipboardList}
        />
        <StatsCard
          title="Total Questions"
          value={totalQuestions}
          icon={FileQuestion}
        />
      </div>

      {/* Questionnaires List */}
      {questionnaires.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionnaires.map((questionnaire) => (
            <Card key={questionnaire._id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight">
                      {getJobTitle(questionnaire)}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/Questionnaire/${questionnaire._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(questionnaire._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {questionnaire.difficulty}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {questionnaire.experienceLevel}
                  </Badge>
                  <Badge variant="outline">
                    {questionnaire.questions.length} questions
                  </Badge>
                </div>

                {/* Question Previews */}
                <div className="space-y-1 text-sm text-muted-foreground">
                  {questionnaire.questions.slice(0, 3).map((q, idx) => (
                    <p key={idx} className="line-clamp-1">
                      {idx + 1}. {q.question}
                    </p>
                  ))}
                  {questionnaire.questions.length > 3 && (
                    <p className="text-xs">
                      +{questionnaire.questions.length - 3} more questions
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/Questionnaire/${questionnaire._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No questionnaires yet"
          description="Create your first screening questionnaire to streamline your hiring process."
          action={{
            label: "Create Questionnaire",
            href: "/Questionnaire/new",
          }}
        />
      )}

      {/* Quick Tips Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Questionnaire Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Keep it focused</p>
              <p className="text-muted-foreground">
                5-10 questions is ideal for candidate engagement
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Mix question types</p>
              <p className="text-muted-foreground">
                Combine multiple choice, coding, and open-ended questions
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Set time limits</p>
              <p className="text-muted-foreground">
                15-30 minutes keeps candidates focused without pressure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
