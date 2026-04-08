"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { jobServices } from "@/lib/services/Jobs.services";
import { SERVER_URL } from "@/lib/api/axiosInstance";

const SKILLS = [
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

const EXPERIENCE_LEVELS = [
  { value: "internship", label: "Internship" },
  { value: "entry-level", label: "Entry Level" },
  { value: "associate", label: "Associate" },
  { value: "mid-level", label: "Mid Level" },
  { value: "senior-level", label: "Senior Level" },
];

const WORK_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

const WORK_MODES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

type JobItem = {
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
  location?: { city?: string; state?: string };
  salary: number;
  disclosed: boolean;
  totalApplicants: number;
  companyId?: { _id: string; name: string; logo?: string };
  createdAt: string;
};

type Filters = {
  search: string;
  experienceLevel: string[];
  workType: string[];
  mode: string[];
  skills: string[];
  page: number;
};

function formatLabel(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    experienceLevel: [],
    workType: [],
    mode: [],
    skills: [],
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: 12,
        status: "published",
      };
      if (filters.search) params.search = filters.search;
      if (filters.experienceLevel.length > 0)
        params.experienceLevel = filters.experienceLevel.join(",");
      if (filters.workType.length > 0)
        params.workType = filters.workType.join(",");
      if (filters.mode.length > 0) params.mode = filters.mode.join(",");
      if (filters.skills.length > 0) params.skills = filters.skills.join(",");

      const res = await jobServices.getAll(params);
      setJobs(res.data || []);
      if (res.pagination) {
        setPagination({
          total: res.pagination.total,
          page: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          hasNextPage: res.pagination.currentPage < res.pagination.totalPages,
          hasPrevPage: res.pagination.currentPage > 1,
        });
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const addSkill = (skill: string) => {
    setFilters((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills : [...f.skills, skill],
      page: 1,
    }));
  };

  const removeSkill = (skill: string) => {
    setFilters((f) => ({
      ...f,
      skills: f.skills.filter((s) => s !== skill),
      page: 1,
    }));
  };

  const addExperienceLevel = (level: string) => {
    setFilters((f) => ({
      ...f,
      experienceLevel: f.experienceLevel.includes(level)
        ? f.experienceLevel
        : [...f.experienceLevel, level],
      page: 1,
    }));
  };

  const removeExperienceLevel = (level: string) => {
    setFilters((f) => ({
      ...f,
      experienceLevel: f.experienceLevel.filter((l) => l !== level),
      page: 1,
    }));
  };

  const addWorkType = (type: string) => {
    setFilters((f) => ({
      ...f,
      workType: f.workType.includes(type) ? f.workType : [...f.workType, type],
      page: 1,
    }));
  };

  const removeWorkType = (type: string) => {
    setFilters((f) => ({
      ...f,
      workType: f.workType.filter((t) => t !== type),
      page: 1,
    }));
  };

  const addMode = (mode: string) => {
    setFilters((f) => ({
      ...f,
      mode: f.mode.includes(mode) ? f.mode : [...f.mode, mode],
      page: 1,
    }));
  };

  const removeMode = (mode: string) => {
    setFilters((f) => ({
      ...f,
      mode: f.mode.filter((m) => m !== mode),
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      experienceLevel: [],
      workType: [],
      mode: [],
      skills: [],
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.experienceLevel.length > 0 ||
    filters.workType.length > 0 ||
    filters.mode.length > 0 ||
    filters.skills.length > 0;

  const FilterControls = () => (
    <div className="space-y-4">
      {/* Experience Level */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Experience Level</label>
        {filters.experienceLevel.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.experienceLevel.map((level) => (
              <Badge
                key={level}
                variant="secondary"
                className="capitalize cursor-pointer hover:bg-destructive/20 gap-1"
                onClick={() => removeExperienceLevel(level)}
              >
                {formatLabel(level)}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        <Combobox
          value={null}
          onValueChange={(val: string | null) => {
            if (val) addExperienceLevel(val);
          }}
        >
          <ComboboxInput placeholder="Search levels..." />
          <ComboboxContent>
            <ComboboxList>
              {EXPERIENCE_LEVELS.filter(
                (l) => !filters.experienceLevel.includes(l.value),
              ).map((level) => (
                <ComboboxItem key={level.value} value={level.value}>
                  {level.label}
                </ComboboxItem>
              ))}
              <ComboboxEmpty>No levels found</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Work Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Work Type</label>
        {filters.workType.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.workType.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="capitalize cursor-pointer hover:bg-destructive/20 gap-1"
                onClick={() => removeWorkType(type)}
              >
                {formatLabel(type)}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        <Combobox
          value={null}
          onValueChange={(val: string | null) => {
            if (val) addWorkType(val);
          }}
        >
          <ComboboxInput placeholder="Search types..." />
          <ComboboxContent>
            <ComboboxList>
              {WORK_TYPES.filter(
                (t) => !filters.workType.includes(t.value),
              ).map((type) => (
                <ComboboxItem key={type.value} value={type.value}>
                  {type.label}
                </ComboboxItem>
              ))}
              <ComboboxEmpty>No types found</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Work Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Work Mode</label>
        {filters.mode.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.mode.map((mode) => (
              <Badge
                key={mode}
                variant="secondary"
                className="capitalize cursor-pointer hover:bg-destructive/20 gap-1"
                onClick={() => removeMode(mode)}
              >
                {formatLabel(mode)}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        <Combobox
          value={null}
          onValueChange={(val: string | null) => {
            if (val) addMode(val);
          }}
        >
          <ComboboxInput placeholder="Search modes..." />
          <ComboboxContent>
            <ComboboxList>
              {WORK_MODES.filter((m) => !filters.mode.includes(m.value)).map(
                (mode) => (
                  <ComboboxItem key={mode.value} value={mode.value}>
                    <span className="capitalize">{mode.label}</span>
                  </ComboboxItem>
                ),
              )}
              <ComboboxEmpty>No modes found</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Skills</label>
        {filters.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="capitalize cursor-pointer hover:bg-destructive/20 gap-1"
                onClick={() => removeSkill(skill)}
              >
                {formatLabel(skill)}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        <Combobox
          value={null}
          onValueChange={(val: string | null) => {
            if (val) addSkill(val);
          }}
        >
          <ComboboxInput placeholder="Search skills..." />
          <ComboboxContent>
            <ComboboxList>
              {SKILLS.filter((s) => !filters.skills.includes(s)).map(
                (skill) => (
                  <ComboboxItem key={skill} value={skill}>
                    <span className="capitalize">{formatLabel(skill)}</span>
                  </ComboboxItem>
                ),
              )}
              <ComboboxEmpty>No skills found</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Find your dream job
            </h1>
            <p className="text-muted-foreground">
              Browse {pagination.total > 0 ? `${pagination.total}+` : ""} open
              positions from top companies
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, skills, or company..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button type="submit" className="h-11 px-6">
              Search
            </Button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                <FilterControls />
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button + results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading..."
                  : `${pagination.total} job${pagination.total !== 1 ? "s" : ""} found`}
              </p>
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setFilters((f) => ({ ...f, search: "", page: 1 }));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.experienceLevel.length > 0 &&
                  filters.experienceLevel.map((level) => (
                    <Badge key={level} variant="secondary" className="gap-1">
                      {formatLabel(level)}
                      <button onClick={() => removeExperienceLevel(level)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                {filters.workType.length > 0 &&
                  filters.workType.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {formatLabel(type)}
                      <button onClick={() => removeWorkType(type)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                {filters.mode.length > 0 &&
                  filters.mode.map((mode) => (
                    <Badge key={mode} variant="secondary" className="gap-1">
                      {formatLabel(mode)}
                      <button onClick={() => removeMode(mode)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                {filters.skills.length > 0 &&
                  filters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {formatLabel(skill)}
                      <button onClick={() => removeSkill(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            )}

            {/* Job cards */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-52 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <Card
                    key={job._id}
                    className="group hover:shadow-md hover:border-primary/20 transition-all"
                  >
                    <CardContent className="p-5">
                      {/* Company + time ago */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {job.companyId?.logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={`${SERVER_URL}/${job.companyId.logo}`}
                              alt=""
                              className="h-8 w-8 rounded-md object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-sm text-muted-foreground truncate">
                            {job.companyId?.name || "Company"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {timeAgo(job.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/browse-jobs/${job._id}`}
                        className="block mb-2"
                      >
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                      </Link>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {formatLabel(job.workType)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatLabel(job.mode)}
                        </Badge>
                        {job.location?.city && (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location.city}
                          </Badge>
                        )}
                      </div>

                      {/* Experience + Salary */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span>{formatLabel(job.experienceLevel)}</span>
                        {job.disclosed && job.salary > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <DollarSign className="h-3 w-3" />
                              {job.salary.toLocaleString()}/yr
                            </span>
                          </>
                        )}
                      </div>

                      {/* Skills */}
                      {job.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {job.skills.slice(0, 3).map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="text-xs"
                            >
                              {s}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Apply button */}
                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/apply/${job._id}`}>
                          Apply Now
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: f.page - 1 }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: f.page + 1 }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
