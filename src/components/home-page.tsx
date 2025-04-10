"use client";

import { type Resume } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HomePageProps {
  recentResumes: Resume[];
}

const HomePage = ({ recentResumes }: HomePageProps): React.ReactElement => {
  const router = useRouter();

  const handleCreateResume = async (): Promise<void> => {
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Resume",
          content: "{}",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create resume");
      }

      const resume = await response.json();
      router.push(`/resume/${resume.id}`);
    } catch (error) {
      console.error("Error creating resume:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Let&apos;s continue building your professional resume
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create New Resume
            </CardTitle>
            <CardDescription>
              Start from scratch with a new resume template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleCreateResume}>
              <Plus className="mr-2 h-4 w-4" />
              Create Resume
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Resumes
            </CardTitle>
            <CardDescription>
              View and manage your existing resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/resume">
              <Button variant="outline" className="w-full">
                View Resumes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Edit Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest resume updates and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentResumes.length > 0 ? (
              recentResumes.map(resume => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{resume.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated{" "}
                      {formatDistanceToNow(new Date(resume.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Link href={`/resume/${resume.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to show
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
