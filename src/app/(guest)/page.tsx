"use client";

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
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const HomePage = (): React.ReactElement => (
  <div className="flex flex-col gap-16 py-8">
    {/* Hero Section */}
    <section className="flex flex-col items-center text-center gap-6 pt-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/5"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Create Professional Resumes with{" "}
          <span className="text-primary">AI</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-[600px] mx-auto">
          Build stunning resumes in minutes with our AI-powered resume builder.
          Get personalized suggestions and professional templates.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="hover:bg-accent/50">
              Learn More
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Features Section */}
    <section id="features" className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Everything you need to create a professional resume that stands out
        </p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-3"
      >
        {[
          {
            icon: <Sparkles className="h-6 w-6 text-primary" />,
            title: "AI-Powered Suggestions",
            description:
              "Get intelligent recommendations for your resume content and formatting.",
          },
          {
            icon: <FileText className="h-6 w-6 text-primary" />,
            title: "Professional Templates",
            description:
              "Choose from a variety of modern, ATS-friendly resume templates.",
          },
          {
            icon: <Zap className="h-6 w-6 text-primary" />,
            title: "Quick & Easy",
            description:
              "Create your perfect resume in minutes with our intuitive interface.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <div className="p-3 rounded-full bg-primary/10">{feature.icon}</div>
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>

    {/* Pricing Section */}
    <section id="pricing" className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Choose the plan that's right for you
        </p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-2"
      >
        {[
          {
            name: "Free",
            price: "$0",
            features: ["Basic Templates", "1 Resume", "Basic AI Suggestions"],
            buttonText: "Get Started",
            buttonVariant: "default",
          },
          {
            name: "Pro",
            price: "$9.99",
            period: "/month",
            badge: "Popular",
            features: [
              "All Templates",
              "Unlimited Resumes",
              "Advanced AI Features",
              "Priority Support",
            ],
            buttonText: "Get Pro",
            buttonVariant: "primary",
          },
        ].map((plan, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className={cn(
              "flex flex-col p-6 rounded-lg border bg-card relative",
              plan.badge && "border-primary"
            )}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
                {plan.badge}
              </div>
            )}
            <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
            <div className="text-3xl font-bold mb-4">
              {plan.price}
              {plan.period && (
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button
                className={cn(
                  "w-full",
                  plan.buttonVariant === "primary" &&
                    "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
              >
                {plan.buttonText}
              </Button>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>

    {/* About Section */}
    <section id="about" className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">About ResuMate</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          We're on a mission to help everyone create professional resumes that
          get them hired
        </p>
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-2"
      >
        <motion.div variants={fadeInUp} className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Our Story</h3>
          <p className="text-muted-foreground">
            ResuMate was founded with a simple idea: everyone deserves a
            professional resume that showcases their skills and experience. Our
            AI-powered platform makes it easy to create stunning resumes that
            stand out to employers.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-semibold">4.9/5</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">10K+ Users</span>
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Why Choose Us</h3>
          <ul className="space-y-3">
            {[
              "Industry-leading AI technology",
              "ATS-friendly templates",
              "Regular updates and improvements",
              "Excellent customer support",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>

    {/* Contact Section */}
    <section id="contact" className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Have questions? We'd love to hear from you.
        </p>
      </motion.div>
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-[600px] mx-auto"
      >
        <div className="flex flex-col items-center gap-6 p-8 rounded-lg border bg-card">
          <Mail className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-semibold">Contact Us</h3>
          <p className="text-muted-foreground text-center">
            Send us a message and we'll respond as soon as possible.
          </p>
          <Link href="mailto:support@resumate.com">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              Email Us
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>

    {/* CTA Section */}
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4"
    >
      <div className="flex flex-col items-center text-center gap-6 p-8 rounded-lg border bg-card">
        <h2 className="text-3xl font-bold">Ready to Create Your Resume?</h2>
        <p className="max-w-[500px] text-muted-foreground">
          Join thousands of professionals who have already created their dream
          resumes with ResuMate.
        </p>
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.section>
  </div>
);

export default HomePage;
