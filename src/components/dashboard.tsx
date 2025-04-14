"use client";

import { type Job, type Resume } from "@prisma/client";
import { motion } from "framer-motion";
import { FileText, Plus, BarChart2, Briefcase, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type APIResponse } from "@/lib/types";
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

interface DashboardProps {
  recentResumes: Resume[];
}

interface Stats {
  totalResumes: number;
  totalJobs: number;
  totalApplications: number;
}

const Dashboard = ({ recentResumes }: DashboardProps): React.ReactElement => {
  const [stats, setStats] = useState<Stats>({
    totalResumes: 0,
    totalJobs: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const jobsResponse = await fetch("/api/jobs");
        if (!jobsResponse.ok) {
          throw new Error("Failed to fetch stats");
        }
        const jobsData: APIResponse<Job> = await jobsResponse.json();
        const numOfJobs = jobsData.totalCount;

        const applicationsResponse = await fetch("/api/applications");
        if (!applicationsResponse.ok) {
          throw new Error("Failed to fetch stats");
        }
        const applicationsData = await applicationsResponse.json();
        const numOfApplications = applicationsData.totalCount;

        const resumesResponse = await fetch("/api/resumes");
        if (!resumesResponse.ok) {
          throw new Error("Failed to fetch stats");
        }
        const resumesData = await resumesResponse.json();
        const numOfResumes = resumesData.totalCount;

        setStats({
          totalResumes: numOfResumes,
          totalJobs: numOfJobs,
          totalApplications: numOfApplications,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    void fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Resumes",
      value: stats.totalResumes.toString(),
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs.toString(),
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Applications",
      value: stats.totalApplications.toString(),
      icon: Send,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your resumes today.
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {statCards.map((stat, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Resumes */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResumes.map(resume => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{resume.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link href={`/resume/${resume.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/resume/new">
                <Button className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Resume
                </Button>
              </Link>
              <Link href="/resume/templates">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Browse Templates
                </Button>
              </Link>
              <Link href="/resume/analytics">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <BarChart2 className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Created",
                  title: "Software Engineer Resume",
                  time: "2 hours ago",
                },
                {
                  action: "Updated",
                  title: "Product Manager Resume",
                  time: "5 hours ago",
                },
                {
                  action: "Shared",
                  title: "Data Scientist Resume",
                  time: "1 day ago",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>{" "}
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
