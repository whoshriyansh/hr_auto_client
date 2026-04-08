"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

// ============================================================================
// FORM FIELD WRAPPER
// ============================================================================

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  description,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// TEXT INPUT
// ============================================================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export function TextInput({
  label,
  error,
  description,
  required,
  className,
  id,

  ...props
}: TextInputProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      required={required}
      description={description}
    >
      <Input
        id={id}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
    </FormField>
  );
}

// ============================================================================
// PASSWORD INPUT
// ============================================================================

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
  description?: string;
}

export function PasswordInput({
  label,
  error,
  description,
  required,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      required={required}
      description={description}
    >
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className={cn(error && "border-destructive", "pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </FormField>
  );
}

// ============================================================================
// TEXT AREA
// ============================================================================

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

export function TextAreaInput({
  label,
  error,
  description,
  required,
  className,
  id,
  ...props
}: TextAreaInputProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      required={required}
      description={description}
    >
      <Textarea
        id={id}
        className={cn(
          error && "border-destructive",
          "min-h-25 resize-none",
          className,
        )}
        {...props}
      />
    </FormField>
  );
}

// ============================================================================
// SELECT INPUT
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SelectInput({
  label,
  error,
  description,
  required,
  placeholder = "Select an option",
  options,
  value,
  onValueChange,
  disabled,
  className,
  id,
}: SelectInputProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      required={required}
      description={description}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-destructive", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

// ============================================================================
// CHECKBOX INPUT
// ============================================================================

interface CheckboxInputProps {
  label: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  error?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CheckboxInput({
  label,
  checked,
  onCheckedChange,
  error,
  description,
  disabled,
  className,
  id,
}: CheckboxInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      </div>
      {description && !error && (
        <p className="text-xs text-muted-foreground ml-6">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 ml-6">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// OTP INPUT
// ============================================================================

interface OTPInputFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * OTP Input Component
 * Uses the InputOTP component from shadcn/ui for entering verification codes
 * Automatically focuses and manages input state
 */
export function OTPInputField({
  label,
  error,
  description,
  required,
  value,
  onChange,
  length = 6,
  disabled,
  className,
  id,
}: OTPInputFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      required={required}
      description={description}
      className={className}
    >
      <div className="flex justify-center">
        <InputOTP
          maxLength={length}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <InputOTPGroup>
            {Array.from({ length }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={cn(error && "border-destructive")}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
    </FormField>
  );
}

// ============================================================================
// SEARCH INPUT
// ============================================================================

interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onSearch?: (value: string) => void;
}

export function SearchInput({
  className,
  onSearch,
  onChange,
  ...props
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onSearch?.(e.target.value);
  };

  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        type="search"
        className={cn("pl-10", className)}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

// ============================================================================
// ARRAY INPUT (for skills, requirements, etc.)
// ============================================================================

interface ArrayInputProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ArrayInput({
  label,
  error,
  description,
  required,
  values,
  onChange,
  placeholder = "Type and press Enter to add",
  className,
}: ArrayInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        onChange([...values, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      description={description}
      className={className}
    >
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
              >
                {value}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="hover:text-destructive"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}
