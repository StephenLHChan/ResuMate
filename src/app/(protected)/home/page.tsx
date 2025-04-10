import { auth } from "@/auth";
import HomePage from "@/components/home-page";

const Page = async (): Promise<React.ReactElement> => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const searchParams = new URLSearchParams({
    limit: "5",
    order: "desc",
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/resumes?${searchParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recent resumes");
  }

  const recentResumes = await response.json();

  return <HomePage recentResumes={recentResumes} />;
};

export default Page;
