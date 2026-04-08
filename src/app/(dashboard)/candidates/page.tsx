"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  DataTable,
  DataTableColumnHeader,
  AvatarWithFallback,
  StatsCard,
  SkillTag,
  EmptyState,
} from "@/components/global";
import {
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Users,
  UserPlus,
  Star,
  FileText,
  Calendar,
} from "lucide-react";
import { candidateServices } from "@/lib/services/Candidate.services";
import { Candidate, User } from "@/lib/types";

function getCandidateName(candidate: Candidate): string {
  if (typeof candidate.userId === "object" && candidate.userId !== null) {
    return (candidate.userId as User).name;
  }
  return candidate.contactEmail;
}

const columns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Candidate" />
    ),
    cell: ({ row }) => {
      const candidate = row.original;
      const name = getCandidateName(candidate);
      return (
        <div className="flex items-center gap-3">
          <AvatarWithFallback name={name} size="md" />
          <div>
            <Link
              href={`/candidates/${candidate._id}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {candidate.contactEmail}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contactPhone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const candidate = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {candidate.contactPhone}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            {candidate.contactEmail}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "experienceLevel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Experience" />
    ),
    cell: ({ row }) => {
      const candidate = row.original;
      const latestExp = candidate.workExperince[0];
      return (
        <div>
          <p className="text-sm font-medium capitalize">
            {candidate.experienceLevel}
          </p>
          <p className="text-xs text-muted-foreground">
            {latestExp?.Role || "No experience listed"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "skills",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Skills" />
    ),
    cell: ({ row }) => {
      const skills = row.original.skills.slice(0, 3);
      const remaining = row.original.skills.length - 3;
      return (
        <div className="flex flex-wrap gap-1">
          {skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {remaining > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{remaining}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "applications",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applications" />
    ),
    cell: ({ row }) => {
      const candidateApps = row.original.applications;
      return (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span>{candidateApps.length}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const candidate = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/candidates/${candidate._id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              View Resume
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Phone className="h-4 w-4 mr-2" />
              Call Candidate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Star className="h-4 w-4 mr-2" />
              Add to Talent Pool
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await candidateServices.getAll();
        setCandidates(response.data ?? []);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const stats = {
    total: candidates.length,
    active: candidates.filter((c) => c.isActive).length,
    withResume: candidates.filter((c) => c.resume && c.resume.length > 0)
      .length,
    senior: candidates.filter((c) => c.experienceLevel === "senior-level")
      .length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates"
        description="Manage your candidate database"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Candidates" },
        ]}
        actions={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Candidates" value={stats.total} icon={Users} />
        <StatsCard
          title="Active Candidates"
          value={stats.active}
          icon={Briefcase}
        />
        <StatsCard
          title="With Resume"
          value={stats.withResume}
          icon={FileText}
        />
        <StatsCard title="Senior+" value={stats.senior} icon={Star} />
      </div>

      {!loading && candidates.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={candidates}
              searchKey="contactEmail"
              searchPlaceholder="Search candidates..."
              pageSize={10}
            />
          </CardContent>
        </Card>
      ) : !loading ? (
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="Candidates will appear here when they apply to your jobs."
        />
      ) : null}
    </div>
  );
}
