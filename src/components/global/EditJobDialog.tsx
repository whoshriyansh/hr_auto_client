"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import { TextInput, TextAreaInput, SelectInput } from "./FormFields";
import { Loader2, Send, Save, Pencil, Eye } from "lucide-react";
import { jobServices } from "@/lib/services/Jobs.services";
import { skillsServices } from "@/lib/services/Skills.services";
import type { Job } from "@/lib/types";
import type { CreateJobRequest } from "@/lib/schema/Jobs.schema";
import { toast } from "sonner";

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (updatedJob: Job) => void;
}

const MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const WORK_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
];

const EXPERIENCE_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "entry-level", label: "Entry Level" },
  { value: "associate", label: "Associate" },
  { value: "mid-level", label: "Mid Level" },
  { value: "senior-level", label: "Senior Level" },
];

export function EditJobDialog({
  job,
  open,
  onOpenChange,
  onSaved,
}: EditJobDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Editable fields
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [mode, setMode] = useState(job.mode);
  const [workType, setWorkType] = useState(job.workType);
  const [experienceLevel, setExperienceLevel] = useState(job.experienceLevel);
  const [skills, setSkills] = useState<string[]>(job.skills || []);
  const [locationCity, setLocationCity] = useState(job.location?.city || "");
  const [locationState, setLocationState] = useState(job.location?.state || "");
  const [locationAddress, setLocationAddress] = useState(
    job.location?.address || "",
  );
  const [locationZip, setLocationZip] = useState(job.location?.zip || "");
  const [salary, setSalary] = useState(String(job.salary || ""));
  const [disclosed, setDisclosed] = useState(job.disclosed ?? true);
  const [equity, setEquity] = useState(String(job.equity || ""));
  const [applicationDeadline, setApplicationDeadline] = useState(
    job.applicationDeadline
      ? new Date(job.applicationDeadline).toISOString().split("T")[0]
      : "",
  );

  // Reset fields when job changes
  useEffect(() => {
    setTitle(job.title);
    setDescription(job.description);
    setMode(job.mode);
    setWorkType(job.workType);
    setExperienceLevel(job.experienceLevel);
    setSkills(job.skills || []);
    setLocationCity(job.location?.city || "");
    setLocationState(job.location?.state || "");
    setLocationAddress(job.location?.address || "");
    setLocationZip(job.location?.zip || "");
    setSalary(String(job.salary || ""));
    setDisclosed(job.disclosed ?? true);
    setEquity(String(job.equity || ""));
    setApplicationDeadline(
      job.applicationDeadline
        ? new Date(job.applicationDeadline).toISOString().split("T")[0]
        : "",
    );
    setIsEditing(false);
  }, [job]);

  // Load skills from API
  useEffect(() => {
    if (!open) return;
    const loadSkills = async () => {
      try {
        const res = await skillsServices.getAll();
        setAvailableSkills(res.data?.skills || []);
      } catch {
        // silently fail
      }
    };
    loadSkills();
  }, [open]);

  const handleSave = async () => {
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<CreateJobRequest> = {
        title,
        description,
        mode: mode as CreateJobRequest["mode"],
        workType: workType as CreateJobRequest["workType"],
        experienceLevel: experienceLevel as CreateJobRequest["experienceLevel"],
        skills,
        disclosed,
        salary: salary ? Number(salary) : undefined,
        equity: equity ? Number(equity) : undefined,
        applicationDeadline: applicationDeadline || undefined,
      };

      if (locationCity && locationState) {
        payload.location = {
          address: locationAddress || locationCity,
          city: locationCity,
          state: locationState,
          zip: locationZip || "000000",
        };
      }

      const res = await jobServices.update(job._id, payload);
      toast.success("Job updated successfully");
      setIsEditing(false);
      onSaved?.(res.data);
    } catch {
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Save edits first if in edit mode
      if (isEditing) {
        const payload: Partial<CreateJobRequest> = {
          title,
          description,
          mode: mode as CreateJobRequest["mode"],
          workType: workType as CreateJobRequest["workType"],
          experienceLevel:
            experienceLevel as CreateJobRequest["experienceLevel"],
          skills,
          disclosed,
          salary: salary ? Number(salary) : undefined,
          equity: equity ? Number(equity) : undefined,
          applicationDeadline: applicationDeadline || undefined,
          status: "published",
        };
        if (locationCity && locationState) {
          payload.location = {
            address: locationAddress || locationCity,
            city: locationCity,
            state: locationState,
            zip: locationZip || "000000",
          };
        }
        const res = await jobServices.update(job._id, payload);
        toast.success("Job published!");
        onSaved?.(res.data);
      } else {
        const res = await jobServices.update(job._id, {
          status: "published",
        });
        toast.success("Job published!");
        onSaved?.(res.data);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to publish job");
    } finally {
      setSaving(false);
    }
  };

  // ── View mode ──
  const renderView = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="capitalize">
            {job.status}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {job.mode}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {job.workType?.replace("-", " ")}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {job.experienceLevel?.replace("-", " ")}
          </Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-2">Description</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {job.description}
        </p>
      </div>

      {job.skills?.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="capitalize">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="grid grid-cols-2 gap-4 text-sm">
        {job.location && (
          <div>
            <span className="font-semibold">Location:</span>{" "}
            <span className="text-muted-foreground">
              {job.location.city}, {job.location.state}
            </span>
          </div>
        )}
        {job.disclosed && job.salary != null && (
          <div>
            <span className="font-semibold">Salary:</span>{" "}
            <span className="text-muted-foreground">
              ₹{job.salary.toLocaleString()}
              {job.equity > 0 && ` + ${job.equity}% equity`}
            </span>
          </div>
        )}
        {job.applicationDeadline && (
          <div>
            <span className="font-semibold">Deadline:</span>{" "}
            <span className="text-muted-foreground">
              {new Date(job.applicationDeadline).toLocaleDateString()}
            </span>
          </div>
        )}
        {job.createdAt && (
          <div>
            <span className="font-semibold">Posted:</span>{" "}
            <span className="text-muted-foreground">
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // ── Edit mode ──
  const renderEdit = () => (
    <div className="space-y-4">
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
        placeholder="Describe the role..."
        rows={5}
        required
      />

      <div className="grid grid-cols-3 gap-3">
        <SelectInput
          label="Work Mode"
          value={mode}
          onValueChange={(v) => setMode(v as typeof mode)}
          options={MODE_OPTIONS}
        />
        <SelectInput
          label="Work Type"
          value={workType}
          onValueChange={(v) => setWorkType(v as typeof workType)}
          options={WORK_TYPE_OPTIONS}
        />
        <SelectInput
          label="Experience"
          value={experienceLevel}
          onValueChange={(v) => setExperienceLevel(v as typeof experienceLevel)}
          options={EXPERIENCE_OPTIONS}
        />
      </div>

      <Separator />

      {/* Skills Selection */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Skills</Label>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="capitalize cursor-pointer hover:bg-destructive/20"
                onClick={() => setSkills(skills.filter((s) => s !== skill))}
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
      </div>

      <Separator />

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* Compensation */}
      <div className="grid grid-cols-3 gap-3">
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
        <div className="flex items-end gap-2 pb-1">
          <Switch checked={disclosed} onCheckedChange={setDisclosed} />
          <Label>Disclose Salary</Label>
        </div>
      </div>

      <TextInput
        label="Application Deadline"
        type="date"
        value={applicationDeadline}
        onChange={(e) => setApplicationDeadline(e.target.value)}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Job" : "Job Details"}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? renderEdit() : renderView()}

        <DialogFooter className="flex-wrap gap-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>

          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          )}

          {job.status !== "published" && (
            <Button onClick={handlePublish} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
