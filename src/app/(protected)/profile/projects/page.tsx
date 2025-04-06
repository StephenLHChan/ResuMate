"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Code2,
  Loader2,
  ExternalLink,
  Github,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { projectSchema, type ProjectFormValues } from "@/lib/schemas/project";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  technologies: string[];
  projectUrl: string | null;
  githubUrl: string | null;
}

const ProjectsPage = (): React.ReactElement => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      technologies: [],
      startDate: undefined,
      endDate: null,
      projectUrl: undefined,
      githubUrl: undefined,
      currentlyWorking: false,
    },
  });

  // Watch for changes in the currentlyWorking field
  const isCurrentlyWorking = form.watch("currentlyWorking");

  // Load project data on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (): Promise<void> => {
    setFetchLoading(true);
    try {
      const response = await fetch("/api/profile/project");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load project data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Sort projects by end date (most recent first) with current projects appearing first
  const sortedProjects = [...projects].sort((a, b) => {
    // Current project (no end date) should appear first
    if (!a.endDate && b.endDate) return -1;
    if (a.endDate && !b.endDate) return 1;

    // If both are current projects or both have end dates, compare dates
    if (!a.endDate && !b.endDate) {
      // Both are current projects, sort by start date (most recent first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }

    // Both have end dates, sort by end date (most recent first)
    return (
      new Date(b.endDate as string).getTime() -
      new Date(a.endDate as string).getTime()
    );
  });

  // Handle form submission
  const onSubmit = async (values: ProjectFormValues): Promise<void> => {
    setLoading(true);
    try {
      // If currently working, set endDate to null
      // const dataToSubmit = {
      //   ...values,
      //   endDate: values.currentlyWorking ? null : values.endDate,
      // };

      const endpoint =
        isEditing && currentId
          ? `/api/profile/project/${currentId}`
          : "/api/profile/project";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(isEditing ? "Project updated" : "Project added");
        form.reset({
          name: "",
          description: "",
          startDate: undefined,
          endDate: null,
          technologies: [],
          projectUrl: undefined,
          githubUrl: undefined,
          currentlyWorking: false,
        });
        setIsEditing(false);
        setCurrentId(null);
        fetchProjects();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project): void => {
    setIsEditing(true);
    setCurrentId(project.id);
    form.reset({
      name: project.name,
      description: project.description,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : undefined,
      technologies: project.technologies,
      projectUrl: project.projectUrl || undefined,
      githubUrl: project.githubUrl || undefined,
      currentlyWorking: !project.endDate,
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/profile/project/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Project deleted");
          fetchProjects();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Something went wrong");
      }
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Present";
    return format(new Date(dateString), "MMM yyyy");
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Side Projects</h1>
        </div>
        <Button onClick={() => router.push("/profile")} variant="outline">
          Back to Profile
        </Button>
      </div>

      {fetchLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="border rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="mt-4 border-t pt-3">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : projects.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedProjects.map(project => (
                <div
                  key={project.id}
                  className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Code2 className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">
                          {project.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <p className="text-sm">
                          {formatDate(project.startDate)} -{" "}
                          {formatDate(project.endDate)}
                        </p>
                      </div>

                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map(tech => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {project.description && (
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}

                      <div className="flex gap-4">
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Project
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Github className="h-4 w-4" />
                            View Code
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Project" : "Add New Project"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Personal Portfolio Website"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project, its features, and your role"
                        {...field}
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMMM yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentlyWorking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I am currently working on this project
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {!isCurrentlyWorking && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMMM yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="technologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technologies Used (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                        {...field}
                        onChange={e => {
                          const techs = e.target.value
                            .split(",")
                            .map(tech => tech.trim())
                            .filter(tech => tech.length > 0);
                          field.onChange(techs);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Saving..."}
                    </>
                  ) : isEditing ? (
                    "Update Project"
                  ) : (
                    "Add Project"
                  )}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentId(null);
                      form.reset({
                        name: "",
                        description: "",
                        startDate: undefined,
                        endDate: undefined,
                        technologies: [],
                        projectUrl: "",
                        githubUrl: "",
                        currentlyWorking: false,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsPage;
