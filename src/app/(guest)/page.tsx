import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Create Professional Resumes with{" "}
          <span className="text-primary">AI</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          Build stunning resumes in minutes with our AI-powered resume builder.
          Get personalized suggestions and professional templates.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">AI-Powered Suggestions</h3>
          <p className="text-muted-foreground">
            Get intelligent recommendations for your resume content and
            formatting.
          </p>
        </div>

        <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Professional Templates</h3>
          <p className="text-muted-foreground">
            Choose from a variety of modern, ATS-friendly resume templates.
          </p>
        </div>

        <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Quick & Easy</h3>
          <p className="text-muted-foreground">
            Create your perfect resume in minutes with our intuitive interface.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center text-center gap-6 p-8 rounded-lg border bg-card">
        <h2 className="text-3xl font-bold">Ready to Create Your Resume?</h2>
        <p className="max-w-[500px] text-muted-foreground">
          Join thousands of professionals who have already created their dream
          resumes with ResuMate.
        </p>
        <Link href="/login">
          <Button size="lg">
            Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
