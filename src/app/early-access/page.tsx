"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EarlyAccessDialog } from "@/components/pages/EarlyAccessDialog";
import { waitlistServices } from "@/lib/services/Waitlist.services";
import { toast } from "sonner";
import {
  Sparkles,
  Brain,
  Mic,
  FileText,
  BarChart3,
  Shield,
  Clock,
  Target,
  CheckCircle2,
  Users,
  Zap,
  Play,
  Loader2,
  Rocket,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ============================================================================
// WAITLIST FORM COMPONENT (Reused in Hero + Bottom CTA)
// ============================================================================

type WaitlistFormProps = {
  onSuccess: (data: { name: string; email: string; phone: string }) => void;
  variant?: "hero" | "cta";
};

function WaitlistForm({ onSuccess, variant = "hero" }: WaitlistFormProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      await waitlistServices.join({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source: "waitlist-page",
      });
      toast.success("You're on the waitlist!");
      onSuccess({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        const serverMsg = (err as { response: { data: { message: string } } })
          .response.data.message;
        // Duplicate email means already on waitlist — still allow early access
        if (serverMsg.toLowerCase().includes("already")) {
          toast.info("You're already on the waitlist!");
          onSuccess({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          });
          return;
        }
        toast.error(serverMsg);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`name-${variant}`} className={isHero ? "" : "text-sm"}>
          Full Name
        </Label>
        <Input
          id={`name-${variant}`}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`email-${variant}`} className={isHero ? "" : "text-sm"}>
          Work Email
        </Label>
        <Input
          id={`email-${variant}`}
          type="email"
          placeholder="john@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`phone-${variant}`} className={isHero ? "" : "text-sm"}>
          Phone Number
        </Label>
        <Input
          id={`phone-${variant}`}
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4 mr-2" />
        )}
        {loading ? "Joining..." : "Join the Waitlist"}
      </Button>
    </form>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection({
  onWaitlistSuccess,
  price,
}: {
  onWaitlistSuccess: (data: {
    name: string;
    email: string;
    phone: string;
  }) => void;
  price: number | null;
}) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launching Soon — Join the Waitlist</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            The future of hiring
            <br />
            <span className="text-primary">starts here.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            AI-powered interviews, automated resume screening, and intelligent
            candidate matching — all in one platform. Be the first to experience
            it.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex justify-center">
            <WaitlistForm onSuccess={onWaitlistSuccess} variant="hero" />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Early access at ₹{price ?? "..."}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// DEMO VIDEO SECTION
// ============================================================================

function DemoVideoSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            See the Platform in Action
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Watch how our platform transforms your hiring workflow — from
            posting a job to hiring the perfect candidate with AI.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                  app.hrauto.com
                </div>
              </div>
            </div>
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Demo coming soon
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HOW IT WORKS SECTION
// ============================================================================

const howItWorksSteps = [
  {
    step: "01",
    title: "Post a Job",
    description:
      "Create a detailed job listing manually or let AI generate one from a simple description.",
    icon: FileText,
  },
  {
    step: "02",
    title: "AI Screens Resumes",
    description:
      "Our AI analyzes every resume against job requirements and scores candidates automatically.",
    icon: Brain,
  },
  {
    step: "03",
    title: "AI Interviews",
    description:
      "Shortlisted candidates take an AI-powered conversational interview — no scheduling needed.",
    icon: Mic,
  },
  {
    step: "04",
    title: "Hire the Best",
    description:
      "Review AI analysis, scores, and recommendations to make confident hiring decisions.",
    icon: Target,
  },
];

function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Zap className="h-3.5 w-3.5" />
            How It Works
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            From Job Post to Hire in 4 Steps
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Our platform automates the tedious parts of hiring so you can focus
            on what matters — finding the right people.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {howItWorksSteps.map((item) => (
            <motion.div key={item.step} variants={fadeInUp}>
              <Card className="relative h-full border-dashed hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <span className="text-4xl font-bold text-primary/15 absolute top-4 right-4">
                    {item.step}
                  </span>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// WHY HR AUTO CARDS SECTION
// ============================================================================

const whyCards = [
  {
    icon: Brain,
    title: "AI-Powered Screening",
    description:
      "Every resume is analyzed against your job requirements. Get instant match scores and save hours of manual review.",
    highlight: "90% faster screening",
  },
  {
    icon: Mic,
    title: "Conversational AI Interviews",
    description:
      "Candidates take an adaptive AI interview — with follow-up questions, real-time evaluation, and no scheduling hassle.",
    highlight: "24/7 availability",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track your hiring pipeline, candidate quality, and team performance with rich dashboards and charts.",
    highlight: "Data-driven decisions",
  },
  {
    icon: Shield,
    title: "Fair & Unbiased",
    description:
      "AI evaluates candidates consistently based on skills and responses — no unconscious bias in the process.",
    highlight: "Equal opportunity",
  },
  {
    icon: Clock,
    title: "Save 70% of Your Time",
    description:
      "From resume screening to interview scheduling — automate repetitive tasks and focus on top candidates.",
    highlight: "Hours saved per hire",
  },
  {
    icon: Globe,
    title: "Hire Globally",
    description:
      "AI interviews run 24/7 across time zones. Candidates from anywhere can interview at their convenience.",
    highlight: "No timezone barriers",
  },
];

function WhySection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Award className="h-3.5 w-3.5" />
            Why HR Auto
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Built for Modern Hiring Teams
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Everything you need to hire smarter, faster, and more fairly — in
            one powerful platform.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {whyCards.map((card) => (
            <motion.div key={card.title} variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow border hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {card.highlight}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// STATS SECTION
// ============================================================================

const stats = [
  { value: "10x", label: "Faster Hiring", icon: TrendingUp },
  { value: "90%", label: "Resume Review Automated", icon: Brain },
  { value: "24/7", label: "AI Interview Availability", icon: Clock },
  { value: "0", label: "Scheduling Conflicts", icon: Users },
];

function StatsSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// BOTTOM CTA SECTION
// ============================================================================

function BottomCTASection({
  onWaitlistSuccess,
}: {
  onWaitlistSuccess: (data: {
    name: string;
    email: string;
    phone: string;
  }) => void;
}) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Don&apos;t Miss Out
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Ready to Transform Your Hiring?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground mb-8">
            Join hundreds of forward-thinking companies on the waitlist. Get
            early access and shape the future of recruitment with us.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex justify-center">
            <WaitlistForm onSuccess={onWaitlistSuccess} variant="cta" />
          </motion.div>

          <Separator className="my-8" />

          <motion.p
            variants={fadeInUp}
            className="text-xs text-muted-foreground"
          >
            By joining the waitlist, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN WAITLIST PAGE
// ============================================================================

export default function WaitlistPage() {
  const [showEarlyAccess, setShowEarlyAccess] = React.useState(false);
  const [waitlistData, setWaitlistData] = React.useState({
    name: "",
    email: "",
    phone: "",
  });
  const [earlyAccessPrice, setEarlyAccessPrice] = React.useState<number | null>(
    null,
  );

  React.useEffect(() => {
    waitlistServices
      .getPlatformConfig()
      .then((res) => {
        // Price from backend is in paise, convert to rupees
        setEarlyAccessPrice(res.data.earlyAccessPrice / 100);
      })
      .catch(() => {
        setEarlyAccessPrice(999); // fallback
      });
  }, []);

  const handleWaitlistSuccess = (data: {
    name: string;
    email: string;
    phone: string;
  }) => {
    setWaitlistData(data);
    setShowEarlyAccess(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection
          onWaitlistSuccess={handleWaitlistSuccess}
          price={earlyAccessPrice}
        />
        <StatsSection />
        <DemoVideoSection />
        <HowItWorksSection />
        <WhySection />
        <BottomCTASection onWaitlistSuccess={handleWaitlistSuccess} />
      </main>
      <Footer />

      <EarlyAccessDialog
        open={showEarlyAccess}
        onOpenChange={setShowEarlyAccess}
        email={waitlistData.email}
        name={waitlistData.name}
        phone={waitlistData.phone}
        price={earlyAccessPrice}
      />
    </div>
  );
}
