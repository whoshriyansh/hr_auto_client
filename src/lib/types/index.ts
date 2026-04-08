// ============================================================================
// CORE TYPES
// ============================================================================

export type UserRole = "super-admin" | "admin" | "candidate";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ============================================================================
// COMPANY TYPES
// ============================================================================

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export type Location = {
  address: string;
  city: string;
  state: string;
  zip: string;
};

export type SocialMedia = {
  linkedin: string;
  x: string;
  instagram: string;
};

export type Company = {
  _id: string;
  createdBy: string | User;
  name: string;
  slug: string;
  description: string;
  logo: string;
  socialMedia: SocialMedia;
  industry: string;
  size: CompanySize;
  location: Location;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// JOB TYPES
// ============================================================================

export type WorkMode = "remote" | "hybrid" | "onsite";
export type WorkType = "full-time" | "part-time" | "contract" | "freelance";
export type ExperienceLevel =
  | "internship"
  | "entry-level"
  | "associate"
  | "mid-level"
  | "senior-level";
export type JobStatus = "draft" | "published" | "paused" | "closed";

export type Job = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  mode: WorkMode;
  workType: WorkType;
  experienceLevel: ExperienceLevel;
  applicationDeadline: string;
  status: JobStatus;
  skills: string[];
  location: Location;
  salary: number;
  disclosed: boolean;
  equity: number;
  totalApplicants: number;
  views: number;
  createdBy: string;
  companyId: string | Company;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "ai_interview_scheduled"
  | "ai_interview_complete"
  | "ai_shortlisted"
  | "ai_rejected"
  | "interview_scheduled"
  | "interview_complete"
  | "accepted"
  | "rejected";

export type AnalysisResumeStatus = "pending" | "completed" | "failed";

export type AIResumeToJobAnalysis = {
  aiScore: number;
  jobRelevanceScore: number;
  jobMatchScore: number;
};

export type AIFinalInterviewAnalysis = {
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  greenFlags: string[];
  redFlags: string[];
  analyzedAt: string;
  aiRejectionReason: string | null;
  recommendation: "strong_yes" | "yes" | "neutral" | "no" | "strong_no" | null;
};

export type Application = {
  _id: string;
  candidateId: string | null;
  applicantName: string;
  applicantEmail: string;
  applicantPhoneNumber: string;
  createdBy: string | null;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        description?: string;
        experienceLevel?: string;
        skills?: string[];
        workType?: string;
      };
  companyId: string | { _id: string; name: string; description?: string };
  resume: string;
  coverLetter: string;
  status: ApplicationStatus;
  extractedSkills: string[];
  experienceLevel: string;
  extractedExperience: string;
  analysisResume: AnalysisResumeStatus;
  aiResumeToJobAnalysis: AIResumeToJobAnalysis;
  aiFinalInterviewAnalysis: AIFinalInterviewAnalysis | null;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// QUESTIONNAIRE / QUESTION TYPES
// ============================================================================

export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionDifficultyWithMixed = "easy" | "medium" | "hard" | "mixed";
export type QuestionExperienceLevel = "entry" | "mid" | "associate" | "senior";

export type QuestionItem = {
  question: string;
  difficulty: QuestionDifficulty;
};

export type Questionnaire = {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        description?: string;
        experienceLevel?: string;
        skills?: string[];
      };
  companyId: string | { _id: string; name: string; description?: string };
  createdBy: string;
  questions: QuestionItem[];
  difficulty: QuestionDifficultyWithMixed;
  experienceLevel: QuestionExperienceLevel;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// INTERVIEW TYPES
// ============================================================================

export type InterviewStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "analyzed";

export type InterviewRecommendation =
  | "strong_yes"
  | "yes"
  | "neutral"
  | "no"
  | "strong_no";

export type InterviewAnswer = {
  questionIndex: number;
  question: string;
  answer: string;
  answeredAt: string;
};

export type InterviewFeedback = {
  questionIndex: number;
  feedback: string;
};

export type InterviewAIAnalysis = {
  overallScore: number | null;
  communicationScore: number | null;
  technicalScore: number | null;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  greenFlags: string[];
  redFlags: string[];
  recommendation: InterviewRecommendation | null;
  analyzedAt: string | null;
};

export type Interview = {
  _id: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  candidateId: string | null;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  token: string;
  questions: QuestionItem[];
  answers: InterviewAnswer[];
  feedbackPerQuestion: InterviewFeedback[];
  currentQuestionIndex: number;
  questionsAsked: number;
  timeLimitMinutes: number;
  status: InterviewStatus;
  startedAt: string | null;
  completedAt: string | null;
  aiAnalysis: InterviewAIAnalysis;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// CANDIDATE TYPES
// ============================================================================

export type CandidateExperienceLevel =
  | "internship"
  | "entry-level"
  | "associate"
  | "mid-level"
  | "senior-level";

export type CandidateWorkType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance";

export type SocialPlatform =
  | "linkedin"
  | "github"
  | "twitter"
  | "personal_website";

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type WorkExperience = {
  CompanyName: string;
  Role: string;
  StartDate: string;
  EndDate: string;
  Description: string;
  isCurrent: boolean;
};

export type Education = {
  Degree: string;
  Institution: string;
  GraduationYear: number;
  Description: string;
};

export type Candidate = {
  _id: string;
  userId: string | User;
  contactPhone: string;
  contactEmail: string;
  applications: string[];
  skills: string[];
  experienceLevel: CandidateExperienceLevel;
  preferredWorkType: CandidateWorkType;
  resume: string;
  workExperince: WorkExperience[];
  education: Education[];
  socialLinks: SocialLink[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  status: string;
  message: string;
  data: T[];
  pagination: PaginationMeta;
};

export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

// ============================================================================
// DASHBOARD STATS TYPES
// ============================================================================

export type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingReview: number;
  shortlisted: number;
  hired: number;
  totalInterviews: number;
  upcomingInterviews: number;
  averageTimeToHire: number;
  applicationConversionRate: number;
};

export type JobsStats = {
  _id: string | null;
  totalJobs: number;
  totalPublishedJobs: number;
  totalDraftJobs: number;
  totalClosedJobs: number;
  totalPausedJobs: number;
};

export type SingleJobStats = {
  _id: string | null;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  aiInterviewsDone: number;
  ai_shortlisted: number;
  ai_rejected: number;
};

// ============================================================================
// WAITLIST TYPES
// ============================================================================

export type WaitlistStatus = "pending" | "paid" | "approved" | "rejected";
export type WaitlistPaymentStatus = "unpaid" | "paid" | "failed";

export type WaitlistEntry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: WaitlistStatus;
  paymentStatus: WaitlistPaymentStatus;
  earlyAccessGrantedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformConfig = {
  waitlistActive: boolean;
  earlyAccessPrice: number;
  calBookingUrl: string;
};

export type JoinWaitlistPayload = {
  name: string;
  email: string;
  phone: string;
  source?: string;
};

export type CreatePaymentOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type VerifyPaymentPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifyPaymentResponse = {
  status: string;
  calBookingUrl: string;
  message: string;
};
