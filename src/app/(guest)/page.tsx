import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Sparkles,
  Zap,
  CheckCircle2,
  Users,
  Star,
  Mail,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 pt-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Create Professional Resumes with{" "}
          <span className="text-primary">AI</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          Build stunning resumes in minutes with our AI-powered resume builder.
          Get personalized suggestions and professional templates.
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
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
      <section id="features" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Everything you need to create a professional resume that stands out
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Suggestions</h3>
            <p className="text-muted-foreground">
              Get intelligent recommendations for your resume content and
              formatting.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Professional Templates</h3>
            <p className="text-muted-foreground">
              Choose from a variety of modern, ATS-friendly resume templates.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Quick & Easy</h3>
            <p className="text-muted-foreground">
              Create your perfect resume in minutes with our intuitive
              interface.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Choose the plan that's right for you
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-4">Free</h3>
            <div className="text-3xl font-bold mb-4">$0</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Basic Templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>1 Resume</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Basic AI Suggestions</span>
              </li>
            </ul>
            <Link href="/signup">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>

          <div className="flex flex-col p-6 rounded-lg border bg-card border-primary">
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
              Popular
            </div>
            <h3 className="text-xl font-semibold mb-4">Pro</h3>
            <div className="text-3xl font-bold mb-4">
              $9.99<span className="text-sm text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>All Templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Unlimited Resumes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Advanced AI Features</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Priority Support</span>
              </li>
            </ul>
            <Link href="/signup">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Get Pro
              </Button>
            </Link>
          </div>

          <div className="flex flex-col p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
            <div className="text-3xl font-bold mb-4">Custom</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Custom Templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>API Access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Dedicated Support</span>
              </li>
            </ul>
            <Link href="/contact">
              <Button className="w-full">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">About ResuMate</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            We're on a mission to help everyone create professional resumes that
            get them hired
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Our Story</h3>
            <p className="text-muted-foreground">
              ResuMate was founded with a simple idea: everyone deserves a
              professional resume that showcases their skills and experience.
              Our AI-powered platform makes it easy to create stunning resumes
              that stand out to employers.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">4.9/5</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">10K+ Users</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Why Choose Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Industry-leading AI technology</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>ATS-friendly templates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Regular updates and improvements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Excellent customer support</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        <div className="max-w-[600px] mx-auto">
          <div className="flex flex-col items-center gap-6 p-8 rounded-lg border bg-card">
            <Mail className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <p className="text-muted-foreground text-center">
              Send us a message and we'll respond as soon as possible.
            </p>
            <Link href="mailto:support@resumate.com">
              <Button size="lg">Email Us</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-6 p-8 rounded-lg border bg-card">
          <h2 className="text-3xl font-bold">Ready to Create Your Resume?</h2>
          <p className="max-w-[500px] text-muted-foreground">
            Join thousands of professionals who have already created their dream
            resumes with ResuMate.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
