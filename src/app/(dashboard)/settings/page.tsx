"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, TextInput, TextAreaInput } from "@/components/global";
import {
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Upload,
  Save,
  Bot,
  Loader2,
  RotateCcw,
  Palette,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthProvider";
import { useTheme } from "next-themes";
import { SERVER_URL } from "@/lib/api/axiosInstance";
import { companyServices } from "@/lib/services/Companies.services";
import { userServices } from "@/lib/services/User.services";
import {
  aiSettingsServices,
  type AiInterviewSettings,
  type AiResumeAnalyserSettings,
  type AiFinalAnalyserSettings,
} from "@/lib/services/AiSettings.services";
import { toast } from "sonner";

const DEFAULT_INTERVIEW: AiInterviewSettings = {
  maxQuestions: 5,
  timeLimitMinutes: 30,
  difficulty: "mixed",
  behaviour: "professional and encouraging",
  customPrompt: "",
  followUpEnabled: true,
  maxFollowUps: 1,
};

const DEFAULT_RESUME: AiResumeAnalyserSettings = {
  strictness: "moderate",
  minimumMatchScore: 40,
  customPrompt: "",
};

const DEFAULT_FINAL: AiFinalAnalyserSettings = {
  autoReject: true,
  autoRejectThreshold: 30,
  autoShortlistThreshold: 70,
  customPrompt: "",
};

export default function SettingsPage() {
  const { user, company, refreshCompany, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Company state
  const [companyForm, setCompanyForm] = useState({
    name: company?.name || "",
    industry: company?.industry || "",
    size: company?.size || "",
    description: company?.description || "",
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // New company creation state (used when no company exists)
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: "",
    description: "",
    industry: "",
    size: "",
  });
  const [creatingCompany, setCreatingCompany] = useState(false);

  // AI Settings state
  const [interviewSettings, setInterviewSettings] =
    useState<AiInterviewSettings>(DEFAULT_INTERVIEW);
  const [resumeSettings, setResumeSettings] =
    useState<AiResumeAnalyserSettings>(DEFAULT_RESUME);
  const [finalSettings, setFinalSettings] =
    useState<AiFinalAnalyserSettings>(DEFAULT_FINAL);
  const [aiLoading, setAiLoading] = useState(true);
  const [savingAi, setSavingAi] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNewApplications: true,
    emailInterviewReminders: true,
    emailWeeklyDigest: true,
  });

  // Update from auth context
  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
    }
  }, [user]);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        industry: (company.industry || "").toLowerCase(),
        size: company.size || "",
        description: company.description || "",
      });
    }
  }, [company]);

  // Load AI settings
  const loadAiSettings = useCallback(async () => {
    try {
      setAiLoading(true);
      const res = await aiSettingsServices.get();
      const data = res.data;
      if (data.usingDefaults) {
        setUsingDefaults(true);
        setInterviewSettings(DEFAULT_INTERVIEW);
        setResumeSettings(DEFAULT_RESUME);
        setFinalSettings(DEFAULT_FINAL);
      } else {
        setUsingDefaults(false);
        const s = data.settings;
        setInterviewSettings({ ...DEFAULT_INTERVIEW, ...s.interview });
        setResumeSettings({ ...DEFAULT_RESUME, ...s.resumeAnalyser });
        setFinalSettings({ ...DEFAULT_FINAL, ...s.finalAnalyser });
      }
    } catch {
      // Use defaults silently
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAiSettings();
  }, [loadAiSettings]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await userServices.updateProfile({ name: profile.name });
      toast.success("Profile updated successfully");
      refreshUser();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!company?._id) return;
    setSavingCompany(true);
    try {
      const formData = new FormData();
      formData.append("name", companyForm.name);
      formData.append("industry", companyForm.industry);
      formData.append("size", companyForm.size);
      formData.append("description", companyForm.description);
      await companyServices.update(company._id, formData);
      toast.success("Company updated successfully");
      refreshCompany();
    } catch {
      toast.error("Failed to update company");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCreateCompany = async () => {
    if (
      !newCompanyForm.name ||
      !newCompanyForm.description ||
      !newCompanyForm.industry
    ) {
      toast.error("Name, description, and industry are required");
      return;
    }
    setCreatingCompany(true);
    try {
      const fd = new FormData();
      fd.append("name", newCompanyForm.name);
      fd.append("description", newCompanyForm.description);
      fd.append("industry", newCompanyForm.industry);
      if (newCompanyForm.size) fd.append("size", newCompanyForm.size);
      await companyServices.create(fd);
      toast.success("Company created successfully!");
      refreshCompany();
    } catch {
      toast.error("Failed to create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleSaveAiSettings = async () => {
    setSavingAi(true);
    try {
      await aiSettingsServices.upsert({
        interview: interviewSettings,
        resumeAnalyser: resumeSettings,
        finalAnalyser: finalSettings,
      });
      toast.success("AI settings saved successfully");
      setUsingDefaults(false);
    } catch {
      toast.error("Failed to save AI settings");
    } finally {
      setSavingAi(false);
    }
  };

  const handleResetAiSettings = async () => {
    setSavingAi(true);
    try {
      await aiSettingsServices.delete();
      setInterviewSettings(DEFAULT_INTERVIEW);
      setResumeSettings(DEFAULT_RESUME);
      setFinalSettings(DEFAULT_FINAL);
      setUsingDefaults(true);
      toast.success("AI settings reset to defaults");
    } catch {
      toast.error("Failed to reset AI settings");
    } finally {
      setSavingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, company, and AI preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/jobs" },
          { label: "Settings" },
        ]}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="gap-2">
            <Bot className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className="text-2xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <TextInput
                  label="Email"
                  type="email"
                  value={profile.email}
                  disabled
                />
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email Verified</Label>
                  <Input
                    value={user?.isEmailVerified ? "Yes" : "No"}
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          {!company ? (
            /* ── No company yet: show create form ── */
            <Card>
              <CardHeader>
                <CardTitle>Create Your Company</CardTitle>
                <CardDescription>
                  Set up your company profile to start posting jobs and managing
                  applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <TextInput
                    label="Company Name"
                    placeholder="Acme Inc."
                    value={newCompanyForm.name}
                    onChange={(e) =>
                      setNewCompanyForm((c) => ({ ...c, name: e.target.value }))
                    }
                    required
                  />
                  <TextInput
                    label="Industry"
                    placeholder="Technology, Healthcare, Finance..."
                    value={newCompanyForm.industry}
                    onChange={(e) =>
                      setNewCompanyForm((c) => ({
                        ...c,
                        industry: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select
                    value={newCompanyForm.size}
                    onValueChange={(v) =>
                      setNewCompanyForm((c) => ({ ...c, size: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1–10 employees</SelectItem>
                      <SelectItem value="11-50">11–50 employees</SelectItem>
                      <SelectItem value="51-200">51–200 employees</SelectItem>
                      <SelectItem value="201-500">201–500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TextAreaInput
                  label="Description"
                  placeholder="Tell us about your company..."
                  value={newCompanyForm.description}
                  onChange={(e) =>
                    setNewCompanyForm((c) => ({
                      ...c,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  required
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateCompany}
                    disabled={creatingCompany}
                  >
                    {creatingCompany ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Building2 className="h-4 w-4 mr-2" />
                    )}
                    Create Company
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* ── Company exists: show edit form ── */
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Manage your company profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {company?.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={
                          company.logo.startsWith("http")
                            ? company.logo
                            : `${SERVER_URL}/${company.logo}`
                        }
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      SVG, PNG or JPG. Max size 1MB.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-4">
                  <TextInput
                    label="Company Name"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm((c) => ({ ...c, name: e.target.value }))
                    }
                  />
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={companyForm.industry}
                      onValueChange={(v) =>
                        setCompanyForm((c) => ({ ...c, industry: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select
                      value={companyForm.size}
                      onValueChange={(v) =>
                        setCompanyForm((c) => ({ ...c, size: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <TextAreaInput
                  label="Description"
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm((c) => ({
                      ...c,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                />
                {company?.location && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <TextInput
                      label="City"
                      value={company.location.city}
                      disabled
                    />
                    <TextInput
                      label="State"
                      value={company.location.state}
                      disabled
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} disabled={savingCompany}>
                    {savingCompany ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai-settings" className="space-y-6">
          {aiLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <>
              {usingDefaults && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-4 text-sm text-blue-800 dark:text-blue-300">
                  Using default AI settings. Customize them below and save to
                  persist your preferences.
                </div>
              )}

              {/* Interview AI Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Interview AI Settings</CardTitle>
                  <CardDescription>
                    Configure how AI conducts interviews
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Max Questions</Label>
                        <span className="text-sm font-medium">
                          {interviewSettings.maxQuestions}
                        </span>
                      </div>
                      <Slider
                        value={[interviewSettings.maxQuestions]}
                        onValueChange={([v]) =>
                          setInterviewSettings((s) => ({
                            ...s,
                            maxQuestions: v,
                          }))
                        }
                        min={1}
                        max={20}
                        step={1}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Time Limit (min)</Label>
                        <span className="text-sm font-medium">
                          {interviewSettings.timeLimitMinutes}
                        </span>
                      </div>
                      <Slider
                        value={[interviewSettings.timeLimitMinutes]}
                        onValueChange={([v]) =>
                          setInterviewSettings((s) => ({
                            ...s,
                            timeLimitMinutes: v,
                          }))
                        }
                        min={5}
                        max={120}
                        step={5}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={interviewSettings.difficulty}
                        onValueChange={(v) =>
                          setInterviewSettings((s) => ({
                            ...s,
                            difficulty: v as AiInterviewSettings["difficulty"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label>Behaviour</Label>
                      <Input
                        value={interviewSettings.behaviour}
                        onChange={(e) =>
                          setInterviewSettings((s) => ({
                            ...s,
                            behaviour: e.target.value,
                          }))
                        }
                        placeholder="e.g. professional and encouraging"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Follow-up Questions</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to ask follow-up questions
                      </p>
                    </div>
                    <Switch
                      checked={interviewSettings.followUpEnabled}
                      onCheckedChange={(checked) =>
                        setInterviewSettings((s) => ({
                          ...s,
                          followUpEnabled: checked,
                        }))
                      }
                    />
                  </div>

                  {interviewSettings.followUpEnabled && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Max Follow-ups per Question</Label>
                        <span className="text-sm font-medium">
                          {interviewSettings.maxFollowUps}
                        </span>
                      </div>
                      <Slider
                        value={[interviewSettings.maxFollowUps]}
                        onValueChange={([v]) =>
                          setInterviewSettings((s) => ({
                            ...s,
                            maxFollowUps: v,
                          }))
                        }
                        min={0}
                        max={3}
                        step={1}
                      />
                    </div>
                  )}

                  <TextAreaInput
                    label="Custom Prompt (optional)"
                    value={interviewSettings.customPrompt}
                    onChange={(e) =>
                      setInterviewSettings((s) => ({
                        ...s,
                        customPrompt: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Additional instructions for the interview AI..."
                  />
                </CardContent>
              </Card>

              {/* Resume Analyser Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Resume Analyser Settings</CardTitle>
                  <CardDescription>
                    Configure how AI analyses candidate resumes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Strictness</Label>
                      <Select
                        value={resumeSettings.strictness}
                        onValueChange={(v) =>
                          setResumeSettings((s) => ({
                            ...s,
                            strictness:
                              v as AiResumeAnalyserSettings["strictness"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lenient">Lenient</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="strict">Strict</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Minimum Match Score</Label>
                        <span className="text-sm font-medium">
                          {resumeSettings.minimumMatchScore}%
                        </span>
                      </div>
                      <Slider
                        value={[resumeSettings.minimumMatchScore]}
                        onValueChange={([v]) =>
                          setResumeSettings((s) => ({
                            ...s,
                            minimumMatchScore: v,
                          }))
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                  <TextAreaInput
                    label="Custom Prompt (optional)"
                    value={resumeSettings.customPrompt}
                    onChange={(e) =>
                      setResumeSettings((s) => ({
                        ...s,
                        customPrompt: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Additional instructions for resume analysis..."
                  />
                </CardContent>
              </Card>

              {/* Final Analyser Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Final Analyser Settings</CardTitle>
                  <CardDescription>
                    Configure automatic decisions after AI interview completion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Reject</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically reject candidates below threshold
                      </p>
                    </div>
                    <Switch
                      checked={finalSettings.autoReject}
                      onCheckedChange={(checked) =>
                        setFinalSettings((s) => ({
                          ...s,
                          autoReject: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Auto Reject Threshold</Label>
                        <span className="text-sm font-medium">
                          {finalSettings.autoRejectThreshold}%
                        </span>
                      </div>
                      <Slider
                        value={[finalSettings.autoRejectThreshold]}
                        onValueChange={([v]) =>
                          setFinalSettings((s) => ({
                            ...s,
                            autoRejectThreshold: v,
                          }))
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Auto Shortlist Threshold</Label>
                        <span className="text-sm font-medium">
                          {finalSettings.autoShortlistThreshold}%
                        </span>
                      </div>
                      <Slider
                        value={[finalSettings.autoShortlistThreshold]}
                        onValueChange={([v]) =>
                          setFinalSettings((s) => ({
                            ...s,
                            autoShortlistThreshold: v,
                          }))
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>

                  <TextAreaInput
                    label="Custom Prompt (optional)"
                    value={finalSettings.customPrompt}
                    onChange={(e) =>
                      setFinalSettings((s) => ({
                        ...s,
                        customPrompt: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Additional instructions for final analysis..."
                  />
                </CardContent>
              </Card>

              {/* AI Settings Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleResetAiSettings}
                  disabled={savingAi || usingDefaults}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveAiSettings} disabled={savingAi}>
                  {savingAi ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save AI Settings
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Applications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when candidates apply
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewApplications}
                  onCheckedChange={(checked) =>
                    setNotifications((n) => ({
                      ...n,
                      emailNewApplications: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders before scheduled interviews
                  </p>
                </div>
                <Switch
                  checked={notifications.emailInterviewReminders}
                  onCheckedChange={(checked) =>
                    setNotifications((n) => ({
                      ...n,
                      emailInterviewReminders: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Summary of hiring activity each week
                  </p>
                </div>
                <Switch
                  checked={notifications.emailWeeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications((n) => ({
                      ...n,
                      emailWeeklyDigest: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextInput
                label="Current Password"
                type="password"
                placeholder="Enter current password"
              />
              <TextInput
                label="New Password"
                type="password"
                placeholder="Enter new password"
              />
              <TextInput
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
              />
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app for 2FA
                    </p>
                  </div>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose light or dark mode for your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark mode
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
