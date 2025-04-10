import { formatDistanceToNow } from "date-fns";
import { FileText, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Resume {
  id: string;
  title: string;
  updatedAt: string;
}

const HomePage = async (): Promise<React.ReactElement> => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const searchParams = new URLSearchParams({
    limit: "5",
    order: "desc",
  });

  const response = await fetch(`/api/resumes?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recent resumes");
  }

  const recentResumes = (await response.json()) as Resume[];

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
            <Link href="/resume/new">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Button>
            </Link>
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
              recentResumes.map((resume: Resume) => (
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
