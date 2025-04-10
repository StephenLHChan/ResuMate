"use client";

import { type Resume } from "@prisma/client";
import { useEffect, useState } from "react";

import HomePage from "@/components/home-page";

const Page = (): React.ReactElement => {
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);

  useEffect(() => {
    const fetchRecentResumes = async (): Promise<Resume[]> => {
      const searchParams = new URLSearchParams();
      searchParams.set("limit", "5");
      searchParams.set("order", "desc");

      const response = await fetch(`/api/resumes?${searchParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recent resumes");
      }

      const data = await response.json();
      return data;
    };

    fetchRecentResumes().then(data => setRecentResumes(data));
  }, []);

  return <HomePage recentResumes={recentResumes} />;
};

export default Page;
