"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  TextInput,
  TextAreaInput,
  SelectInput,
} from "@/components/global/FormFields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { companyServices } from "@/lib/services/Companies.services";
import { useAuth } from "@/lib/context/AuthProvider";
import { toast } from "sonner";
import {
  Building2,
  ArrowRight,
  SkipForward,
  AlertTriangle,
  Upload,
  X,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ApiError = {
  response?: { data?: { message?: string } };
};

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

export default function CreateCompany() {
  const router = useRouter();
  const { refreshCompany } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    size: "",
    city: "",
    state: "",
    address: "",
    zip: "",
    linkedin: "",
    x: "",
    instagram: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be less than 5MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Company name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.industry.trim()) newErrors.industry = "Industry is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setIsLoading(true);

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("industry", formData.industry);
      if (formData.size) fd.append("size", formData.size);

      if (logoFile) {
        fd.append("logo", logoFile);
      }

      const location = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      };
      fd.append("location", JSON.stringify(location));

      const socialMedia = {
        linkedin: formData.linkedin,
        x: formData.x,
        instagram: formData.instagram,
      };
      fd.append("socialMedia", JSON.stringify(socialMedia));

      await companyServices.create(fd);
      toast.success("Company created successfully!");
      refreshCompany();
      router.push("/jobs");
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError).response?.data?.message ||
        "Failed to create company. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    toast.info("You can create your company later from Settings");
    router.push("/jobs");
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">
          Create your company
        </h1>
        <p className="text-muted-foreground text-center">
          Set up your company profile to start hiring
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Logo</Label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoFile ? "Change Logo" : "Upload Logo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>
        </div>

        <TextInput
          id="name"
          label="Company Name"
          placeholder="Acme Inc."
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          required
        />

        <TextAreaInput
          id="description"
          label="Company Description"
          placeholder="Tell us about your company..."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          required
        />

        <TextInput
          id="industry"
          label="Industry"
          placeholder="Technology, Healthcare, Finance, etc."
          value={formData.industry}
          onChange={(e) => handleChange("industry", e.target.value)}
          error={errors.industry}
          required
        />

        <SelectInput
          id="size"
          label="Company Size"
          placeholder="Select company size"
          options={companySizeOptions}
          value={formData.size}
          onValueChange={(value) => handleChange("size", value)}
          error={errors.size}
        />

        <Separator />

        {/* Social Media Links */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Social Media Links</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
              <TextInput
                id="linkedin"
                placeholder="https://linkedin.com/company/..."
                value={formData.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
              <TextInput
                id="x"
                placeholder="https://x.com/..."
                value={formData.x}
                onChange={(e) => handleChange("x", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
              <TextInput
                id="instagram"
                placeholder="https://instagram.com/..."
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Location</Label>
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              id="city"
              label="City"
              placeholder="San Francisco"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <TextInput
              id="state"
              label="State"
              placeholder="CA"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>

          <TextInput
            id="address"
            label="Address"
            placeholder="123 Main Street"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <TextInput
            id="zip"
            label="ZIP Code"
            placeholder="94102"
            value={formData.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Creating company..."
            ) : (
              <>
                Create Company
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip for now
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> You can skip this step and complete your
          company profile later from the settings page. However, you&apos;ll
          need a company to post jobs and manage applications.
        </p>
      </div>

      {/* Skip confirmation dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-amber-500" />
            </AlertDialogMedia>
            <AlertDialogTitle>Skip company setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Without a company profile you won&apos;t be able to post jobs,
              review applications, or schedule AI interviews. You can create
              your company later from the Settings page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSkipDialog(false)}>
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmSkip}
            >
              Skip anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
