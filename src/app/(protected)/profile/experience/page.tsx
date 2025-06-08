"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Experience } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

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
import { useToast } from "@/components/ui/use-toast";
import {
  experienceSchema,
  type ExperienceFormValues,
} from "@/lib/schemas/experience";
import { type APIResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const ExperiencePage = (): React.ReactElement => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      company: "",
      position: "",
      startDate: undefined,
      endDate: undefined,
      currentlyWorking: false,
      description: "",
    },
  });

  // Watch for changes in the currentlyWorking field
  const isCurrentlyWorking = form.watch("currentlyWorking");

  const fetchExperience = useCallback(async (): Promise<void> => {
    setFetchLoading(true);
    try {
      const response = await fetch("/api/profile/experience");
      if (response.ok) {
        const data: APIResponse<Experience> = await response.json();
        setExperience(data.items);
      }
    } catch (error) {
      console.error("Error fetching experience:", error);
      toast({
        title: "Error",
        description: "Failed to load experience data",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  }, [toast]);

  // Load experience data on component mount
  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  // Sort experiences by end date (most recent first) with current jobs appearing first
  const sortedExperiences = [...experience].sort((a, b) => {
    // Current job (no end date) should appear first
    if (!a.endDate && b.endDate) return -1;
    if (a.endDate && !b.endDate) return 1;

    // If both are current jobs or both have end dates, compare dates
    if (!a.endDate && !b.endDate) {
      // Both are current jobs, sort by start date (most recent first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }

    // Both have end dates, sort by end date (most recent first)
    return (
      new Date(b.endDate?.toString() ?? "").getTime() -
      new Date(a.endDate?.toString() ?? "").getTime()
    );
  });

  // Handle form submission
  const onSubmit = async (values: ExperienceFormValues): Promise<void> => {
    setLoading(true);
    try {
      // If currently working, set endDate to null
      const dataToSubmit = {
        ...values,
        endDate: values.currentlyWorking ? null : values.endDate,
      };

      const endpoint =
        isEditing && currentId
          ? `/api/profile/experience/${currentId}`
          : "/api/profile/experience";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: isEditing ? "Experience updated" : "Experience added",
        });
        form.reset({
          company: "",
          position: "",
          startDate: undefined,
          endDate: undefined,
          currentlyWorking: false,
          description: "",
        });
        setIsEditing(false);
        setCurrentId(null);
        fetchExperience();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save experience",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp: Experience): void => {
    setIsEditing(true);
    setCurrentId(exp.id);
    form.reset({
      company: exp.company,
      position: exp.position,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      currentlyWorking: !exp.endDate,
      description: exp.description || "",
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm("Are you sure you want to delete this experience?")) {
      try {
        const response = await fetch(`/api/profile/experience/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Experience deleted",
          });
          fetchExperience();
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.message || "Failed to delete experience",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting experience:", error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    }
  };

  const ExperienceCard = ({
    experience,
  }: {
    experience: Experience;
  }): React.ReactElement => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <div>
          <CardTitle className="text-xl font-bold">
            {experience.position}
          </CardTitle>
          <div className="text-sm font-medium mt-1">{experience.company}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(experience.startDate), "MMM yyyy")} -{" "}
            {experience.endDate
              ? format(new Date(experience.endDate), "MMM yyyy")
              : "Present"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(experience)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(experience.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-line">{experience.description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Work Experience</h1>
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
      ) : experience.length > 0 ? (
        <Card>
          <CardContent>
            <div className="space-y-6">
              {sortedExperiences.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Experience" : "Add New Experience"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Your job title" {...field} />
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
                        <FormLabel>I currently work here</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {!isCurrentlyWorking && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements"
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
                    "Update Experience"
                  ) : (
                    "Add Experience"
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
                        company: "",
                        position: "",
                        startDate: undefined,
                        endDate: undefined,
                        currentlyWorking: false,
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
};

export default ExperiencePage;
