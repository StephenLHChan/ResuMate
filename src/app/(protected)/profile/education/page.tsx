"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { educationSchema, EducationFormValues } from "@/lib/schemas/education";
import { Skeleton } from "@/components/ui/skeleton";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export default function EducationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [education, setEducation] = useState<Education[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      field: "",
      description: "",
      currentlyStudying: false,
    },
  });

  // Watch for changes in the currentlyStudying field
  const isCurrentlyStudying = form.watch("currentlyStudying");

  // Load education data on component mount
  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch("/api/profile/education");
      if (response.ok) {
        const data = await response.json();
        setEducation(data);
      }
    } catch (error) {
      console.error("Error fetching education:", error);
      toast.error("Failed to load education data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Sort education by end date (most recent first) with current studies appearing first
  const sortedEducation = [...education].sort((a, b) => {
    // Current studies (no end date) should appear first
    if (!a.endDate && b.endDate) return -1;
    if (a.endDate && !b.endDate) return 1;

    // If both are current studies or both have end dates, compare dates
    if (!a.endDate && !b.endDate) {
      // Both are current studies, sort by start date (most recent first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }

    // Both have end dates, sort by end date (most recent first)
    return new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime();
  });

  // Handle form submission
  const onSubmit = async (values: EducationFormValues) => {
    setLoading(true);
    try {
      // If currently studying, set endDate to null
      const dataToSubmit = {
        ...values,
        endDate: values.currentlyStudying ? null : values.endDate,
      };

      const endpoint =
        isEditing && currentId
          ? `/api/profile/education/${currentId}`
          : "/api/profile/education";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        toast.success(isEditing ? "Education updated" : "Education added");
        form.reset({
          institution: "",
          degree: "",
          field: "",
          startDate: undefined,
          endDate: undefined,
          currentlyStudying: false,
          description: "",
        });
        setIsEditing(false);
        setCurrentId(null);
        fetchEducation();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save education");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (edu: Education) => {
    setIsEditing(true);
    setCurrentId(edu.id);
    form.reset({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: new Date(edu.startDate),
      endDate: edu.endDate ? new Date(edu.endDate) : undefined,
      currentlyStudying: !edu.endDate,
      description: edu.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this education?")) {
      try {
        const response = await fetch(`/api/profile/education/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Education deleted");
          fetchEducation();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to delete education");
        }
      } catch (error) {
        console.error("Error deleting education:", error);
        toast.error("Something went wrong");
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";
    return format(new Date(dateString), "MMM yyyy");
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Education</h1>
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
      ) : (
        <>
          {education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sortedEducation.map(edu => (
                    <div
                      key={edu.id}
                      className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <GraduationCap className="h-5 w-5" />
                            <h3 className="text-lg font-semibold">
                              {edu.degree} in {edu.field}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <h4 className="text-md">{edu.institution}</h4>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <p className="text-sm">
                              {formatDate(edu.startDate)} -{" "}
                              {formatDate(edu.endDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(edu)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(edu.id)}
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>

                      {edu.description && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-sm whitespace-pre-line">
                            {edu.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Education" : "Add New Education"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="School or university name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Bachelor's, Master's"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                            selected={field.value}
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
                  name="currentlyStudying"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I am currently studying here</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {!isCurrentlyStudying && (
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
                            selected={field.value}
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add details about your studies, achievements, etc."
                        {...field}
                        className="min-h-[120px]"
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
                    "Update Education"
                  ) : (
                    "Add Education"
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
                        institution: "",
                        degree: "",
                        field: "",
                        startDate: undefined,
                        endDate: undefined,
                        currentlyStudying: false,
                        description: "",
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
}
