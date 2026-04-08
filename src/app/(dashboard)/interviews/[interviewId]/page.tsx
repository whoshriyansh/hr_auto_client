"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  PageHeader,
  StatusBadge,
  ScoreIndicator,
  AvatarWithFallback,
} from "@/components/global";
import {
  ArrowLeft,
  Brain,
  MessageSquare,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Briefcase,
  Mail,
  Phone,
  Clock,
  Star,
} from "lucide-react";
import { interviewServices } from "@/lib/services/Interview.services";
import type { InterviewAIAnalysis } from "@/lib/types";
import { toast } from "sonner";

type ConversationMessage = {
  role: "ai" | "candidate";
  content: string;
  type?: string;
  timestamp?: string;
  evaluation?: {
    relevance: number;
    depth: number;
    clarity: number;
    overall: number;
  };
};

type InterviewDetail = {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  status: string;
  questionsAsked: number;
  startedAt: string | null;
  completedAt: string | null;
  token: string;
  aiAnalysis: InterviewAIAnalysis;
  jobId?: {
    _id: string;
    title: string;
    description: string;
    experienceLevel: string;
    skills: string[];
  };
  companyId?: {
    _id: string;
    name: string;
  };
};

export default function InterviewDetailPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await interviewServices.getById(interviewId);
        setInterview(res.data.interview);
        setConversation(res.data.conversation || []);
      } catch {
        toast.error("Failed to load interview details");
        router.push("/interviews");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [interviewId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!interview) return null;

  const analysis: InterviewAIAnalysis | undefined = interview.aiAnalysis;
  const hasAnalysis = analysis && analysis.overallScore != null;

  const getRecommendationColor = (rec: string | null | undefined) => {
    switch (rec) {
      case "strong_yes":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "yes":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "neutral":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "no":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "strong_no":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Details"
        description={`Review for ${interview.candidateName}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Interviews", href: "/interviews" },
          { label: interview.candidateName },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.push("/interviews")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Candidate Info + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Candidate Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AvatarWithFallback name={interview.candidateName} size="lg" />
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {interview.candidateName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {interview.candidateEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {interview.candidatePhone}
                  </span>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Job Title</p>
                <p className="font-medium flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {typeof interview.jobId === "object"
                    ? interview.jobId.title
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <StatusBadge status={interview.status} />
              </div>
              <div>
                <p className="text-muted-foreground">Questions Asked</p>
                <p className="font-medium">{interview.questionsAsked}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {interview.startedAt && interview.completedAt
                    ? `${Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 60000)} min`
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            {hasAnalysis ? (
              <>
                <div className="relative">
                  <ScoreIndicator
                    score={analysis.overallScore!}
                    size="lg"
                    showLabel
                  />
                </div>
                <Badge
                  className={`text-sm px-3 py-1 ${getRecommendationColor(analysis.recommendation)}`}
                  variant="outline"
                >
                  <Star className="h-3.5 w-3.5 mr-1" />
                  {analysis.recommendation?.replace(/_/g, " ").toUpperCase() ||
                    "PENDING"}
                </Badge>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Brain className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>Analysis pending</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Scores */}
      {hasAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Communication",
              score: analysis.communicationScore,
              icon: MessageSquare,
            },
            {
              label: "Technical",
              score: analysis.technicalScore,
              icon: Brain,
            },
            {
              label: "Overall",
              score: analysis.overallScore,
              icon: Star,
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {item.score ?? "—"}
                  </span>
                </div>
                <Progress value={item.score ?? 0} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {hasAnalysis && analysis.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {analysis.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Green Flags & Red Flags */}
      {hasAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Green Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Green Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.greenFlags && analysis.greenFlags.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.greenFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ThumbsUp className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None identified</p>
              )}
            </CardContent>
          </Card>

          {/* Red Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.redFlags && analysis.redFlags.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ThumbsDown className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None identified</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {hasAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.strengths && analysis.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None listed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None listed</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversation Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversation.length > 0 ? (
            <div className="space-y-4">
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "candidate" ? "justify-end" : ""}`}
                >
                  {msg.role === "ai" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                      msg.role === "ai"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    {msg.evaluation && (
                      <div className="mt-2 pt-2 border-t border-border/50 flex gap-3 text-xs opacity-70">
                        <span>Relevance: {msg.evaluation.relevance}/10</span>
                        <span>Depth: {msg.evaluation.depth}/10</span>
                        <span>Clarity: {msg.evaluation.clarity}/10</span>
                        <span>Overall: {msg.evaluation.overall}/10</span>
                      </div>
                    )}
                  </div>
                  {msg.role === "candidate" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No conversation recorded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
