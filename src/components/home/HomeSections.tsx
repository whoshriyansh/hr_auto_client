"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  BarChart3,
  MessageSquare,
  Shield,
  Clock,
  Target,
  CheckCircle2,
  Star,
  Mic,
  Brain,
  FileText,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
  Video,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ============================================================================
// HERO SECTION
// ============================================================================

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
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
            <span>AI-Powered Hiring Platform</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Hire smarter.
            <br />
            <span className="text-primary">Faster.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Streamline your recruitment process with AI-powered interviews,
            automated screening, and intelligent candidate matching. Find the
            best talent in half the time.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/early-access">Learn More</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES SECTION
// ============================================================================

const features = [
  {
    icon: Brain,
    title: "AI-Powered Screening",
    description:
      "Automatically analyze resumes and match candidates to job requirements using advanced AI algorithms.",
  },
  {
    icon: Mic,
    title: "Voice AI Interviews",
    description:
      "Conduct preliminary interviews with AI voice technology. Screen candidates 24/7 without human intervention.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Get detailed insights on your hiring pipeline, conversion rates, and time-to-hire metrics.",
  },
  {
    icon: Target,
    title: "Candidate Scoring",
    description:
      "AI-generated scores for each candidate based on skills, experience, and cultural fit.",
  },
  {
    icon: MessageSquare,
    title: "Automated Communication",
    description:
      "Send personalized emails and updates to candidates automatically throughout the hiring process.",
  },
  {
    icon: Shield,
    title: "Bias-Free Hiring",
    description:
      "Our AI helps reduce unconscious bias in the screening process for more diverse hiring.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Everything you need to hire better
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Powerful features designed to streamline your recruitment process
            and help you find the best candidates faster.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
// AI INTERVIEWS SECTION
// ============================================================================

export function AIInterviewsSection() {
  return (
    <section id="ai-interviews" className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Mic className="h-4 w-4" />
              AI Voice Interviews
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interview candidates at scale
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our AI conducts structured voice interviews with candidates,
              analyzes their responses, and provides detailed assessments. Save
              hours of interviewer time while ensuring consistent evaluation.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "24/7 automated interviews",
                "Natural language understanding",
                "Detailed skill assessment",
                "Communication analysis",
                "Instant scoring and reports",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" asChild>
              <Link href="/register">
                Try AI Interviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">AI Interview Session</p>
                        <p className="text-sm text-muted-foreground">
                          Senior Frontend Developer
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium">
                      Live
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex-1">
                      <p className="text-sm">
                        Can you explain the virtual DOM and how React uses it
                        for performance optimization?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">
                        The virtual DOM is a lightweight copy of the actual DOM.
                        React uses it to improve performance by comparing
                        changes...
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">
                      AT
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">85%</p>
                      <p className="text-xs text-muted-foreground">
                        Overall Score
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">88%</p>
                      <p className="text-xs text-muted-foreground">
                        Communication
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">82%</p>
                      <p className="text-xs text-muted-foreground">Technical</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// INTERVIEW PREP SECTION
// ============================================================================

const prepResources = [
  {
    icon: BookOpen,
    title: "Interview Guides",
    description:
      "Comprehensive guides for different roles and industries to help candidates prepare.",
    count: "50+ guides",
  },
  {
    icon: MessageSquare,
    title: "Practice Questions",
    description:
      "Common interview questions with sample answers and tips for improvement.",
    count: "500+ questions",
  },
  {
    icon: Video,
    title: "Mock Interviews",
    description:
      "Practice with AI-powered mock interviews and get instant feedback.",
    count: "Unlimited practice",
  },
  {
    icon: Lightbulb,
    title: "Tips & Tricks",
    description:
      "Expert advice on body language, communication, and professional presentation.",
    count: "100+ tips",
  },
];

export function InterviewPrepSection() {
  return (
    <section id="interview-prep" className="py-20 bg-muted/30">
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
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <BookOpen className="h-4 w-4" />
            For Candidates
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Interview Preparation Hub
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Help candidates succeed with our comprehensive interview preparation
            resources. Better prepared candidates mean better hiring decisions.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {prepResources.map((resource, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <resource.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {resource.description}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {resource.count}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button size="lg" variant="outline" asChild>
            <Link href="/interview-prep">
              Explore All Resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// STATS SECTION
// ============================================================================

const stats = [
  { value: "10K+", label: "Companies Trust Us" },
  { value: "500K+", label: "Interviews Conducted" },
  { value: "85%", label: "Faster Time-to-Hire" },
  { value: "92%", label: "Client Satisfaction" },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y bg-card">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

const testimonials = [
  {
    quote:
      "This platform reduced our time-to-hire by 60%. The AI interviews are incredibly accurate and saved us countless hours.",
    author: "Sarah Chen",
    role: "Head of Talent, TechCorp",
    avatar: "SC",
  },
  {
    quote:
      "The candidate experience is amazing. We've received so much positive feedback about the AI interview process.",
    author: "Michael Rodriguez",
    role: "HR Director, StartupXYZ",
    avatar: "MR",
  },
  {
    quote:
      "Finally, a hiring tool that actually works. The AI scoring is spot-on and helps us make better decisions.",
    author: "Emily Johnson",
    role: "CEO, GrowthCo",
    avatar: "EJ",
  },
];

export function TestimonialsSection() {
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
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Loved by hiring teams
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground"
          >
            See what our customers have to say
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
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
// CTA SECTION
// ============================================================================

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your hiring?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join thousands of companies using our platform to find the best
            talent faster. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/early-access">Contact Sales</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// BROWSE JOBS CTA SECTION
// ============================================================================

export function BrowseJobsCTA() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Briefcase className="h-4 w-4" />
            For Candidates
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find your next opportunity
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse open positions from top companies. Filter by skills,
            experience level, work type, and more to find the perfect role for
            you.
          </p>
          <Button size="lg" asChild>
            <Link href="/browse-jobs">
              Browse Open Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
