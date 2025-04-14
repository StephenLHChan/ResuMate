"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Certification } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Award,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  certificationSchema,
  type CertificationFormValues,
} from "@/lib/schemas/certification";
import { cn } from "@/lib/utils";

import type { APIResponse } from "@/lib/types";

const CertificationsPage = (): React.ReactElement => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: "",
      issuer: "",
      issueDate: undefined,
      expiryDate: null,
      credentialId: "",
      credentialUrl: "",
      description: "",
    },
  });

  // Load certification data on component mount
  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async (): Promise<void> => {
    setFetchLoading(true);
    try {
      const response = await fetch("/api/profile/certification");
      if (response.ok) {
        const data: APIResponse<Certification> = await response.json();
        setCertifications(data.items);
      }
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast.error("Failed to load certification data");
    } finally {
      setFetchLoading(false);
    }
  };

  // Sort certifications by issue date (most recent first)
  const sortedCertifications = [...certifications].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  // Handle form submission
  const onSubmit = async (values: CertificationFormValues): Promise<void> => {
    setLoading(true);
    try {
      const endpoint =
        isEditing && currentId
          ? `/api/profile/certification/${currentId}`
          : "/api/profile/certification";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(
          isEditing ? "Certification updated" : "Certification added"
        );
        form.reset({
          name: "",
          issuer: "",
          issueDate: undefined,
          expiryDate: undefined,
          credentialId: "",
          credentialUrl: "",
          description: "",
        });
        setIsEditing(false);
        setCurrentId(null);
        fetchCertifications();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save certification");
      }
    } catch (error) {
      console.error("Error saving certification:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert: Certification): void => {
    setIsEditing(true);
    setCurrentId(cert.id);
    form.reset({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: new Date(cert.issueDate),
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
      credentialId: cert.credentialId || "",
      credentialUrl: cert.credentialUrl || "",
      description: cert.description || "",
    });
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm("Are you sure you want to delete this certification?")) {
      try {
        const response = await fetch(`/api/profile/certification/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Certification deleted");
          fetchCertifications();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to delete certification");
        }
      } catch (error) {
        console.error("Error deleting certification:", error);
        toast.error("Something went wrong");
      }
    }
  };

  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return "Present";
    return format(new Date(dateString), "MMM yyyy");
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Award className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Certifications</h1>
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
      ) : certifications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedCertifications.map(cert => (
                <div
                  key={cert.id}
                  className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Award className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">{cert.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <h4 className="text-md">{cert.issuer}</h4>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <p className="text-sm">
                          {formatDate(cert.issueDate)} -{" "}
                          {formatDate(cert.expiryDate)}
                        </p>
                      </div>

                      {cert.credentialId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <p className="text-sm">ID: {cert.credentialId}</p>
                        </div>
                      )}

                      {cert.credentialUrl && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Credential
                          </a>
                        </div>
                      )}

                      {cert.description && (
                        <p className="text-sm text-muted-foreground">
                          {cert.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(cert)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cert.id)}
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
            {isEditing ? "Edit Certification" : "Add New Certification"}
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
                    <FormLabel>Certification Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. AWS Certified Solutions Architect"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Organization</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Amazon Web Services"
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
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
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
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date (Optional)</FormLabel>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="credentialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credential ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AWS-123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credentialUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credential URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add details about the certification, skills acquired, etc."
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
                    "Update Certification"
                  ) : (
                    "Add Certification"
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
                        issuer: "",
                        issueDate: undefined,
                        expiryDate: undefined,
                        credentialId: "",
                        credentialUrl: "",
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

export default CertificationsPage;
