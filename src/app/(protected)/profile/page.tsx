"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  GraduationCap,
  ChevronRight,
  Link as LinkIcon,
  Trash2,
  Award,
  Code2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillRating } from "@/components/ui/skill-rating";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { canadaProvinces } from "@/lib/data/canada-provinces";
import { countries } from "@/lib/data/countries";
import { usStates } from "@/lib/data/us-states";
import {
  profileSchema,
  type ProfileFormValues,
  type SkillFormValues,
} from "@/lib/schemas/profile";

interface StateType {
  code: string;
  name: string;
}

const ProfilePage = (): React.ReactElement => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showPreferredNameFields, setShowPreferredNameFields] = useState(false);
  const [skills, setSkills] = useState<SkillFormValues[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillRating, setNewSkillRating] = useState<number | undefined>(
    undefined
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      legalFirstName: "",
      legalLastName: "",
      hasPreferredName: false,
      preferredFirstName: "",
      preferredLastName: "",
      title: "",
      bio: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      location: "",
      phone: "",
      website: "",
      linkedin: "",
      github: "",
      skills: [],
    },
  });

  // Watch for changes in form values
  const watchCountry = form.watch("country");
  const watchState = form.watch("state");
  const watchCity = form.watch("city");
  const watchLegalFirstName = form.watch("legalFirstName");
  const watchLegalLastName = form.watch("legalLastName");
  const watchHasPreferredName = form.watch("hasPreferredName");

  // Update preferred name visibility
  useEffect(() => {
    setShowPreferredNameFields(watchHasPreferredName);

    // If user checks the preferred name box, prefill with legal name
    if (watchHasPreferredName) {
      // Only prefill if the fields are empty
      if (!form.getValues("preferredFirstName")) {
        form.setValue("preferredFirstName", watchLegalFirstName);
      }
      if (!form.getValues("preferredLastName")) {
        form.setValue("preferredLastName", watchLegalLastName);
      }
    }
  }, [watchHasPreferredName, watchLegalFirstName, watchLegalLastName, form]);

  // Load profile data on component mount
  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();

          // Format skills array for the form
          const skillsArray = data.skills
            ? data.skills.map((skill: { name: string; rating?: number }) => ({
                name: skill.name,
                rating: skill.rating,
              }))
            : [];

          // Update form state
          form.reset({
            legalFirstName: data.legalFirstName || "",
            legalLastName: data.legalLastName || "",
            hasPreferredName: data.hasPreferredName || false,
            preferredFirstName: data.preferredFirstName || "",
            preferredLastName: data.preferredLastName || "",
            title: data.title || "",
            bio: data.bio || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            country: data.country || "",
            location: data.location || "",
            phone: data.phone || "",
            website: data.website || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
          });

          // Update UI state
          setShowPreferredNameFields(data.hasPreferredName || false);
          setSkills(skillsArray);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProfile();
  }, [form, toast]);

  // TODO: Update city and state when zip code changes

  // Update public location when city, state or country changes
  useEffect(() => {
    if (watchCity && (watchState || watchCountry)) {
      // Construct public location string depending on what's available
      let locationString = watchCity;

      if (watchState) {
        locationString += `, ${watchState}`;
      }

      if (
        watchCountry &&
        watchCountry !== "United States" &&
        watchCountry !== "Canada"
      ) {
        locationString += `, ${watchCountry}`;
      }

      form.setValue("location", locationString);
    }
  }, [watchCity, watchState, watchCountry, form]);

  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        skills: skills.map(skill => ({
          name: skill.name,
          rating: skill.rating,
        })),
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (value: string): void => {
    form.setValue("country", value);
    form.setValue("state", "");
  };

  // Update the skills section in the form
  const handleAddSkill = (): void => {
    if (newSkill.trim()) {
      setSkills([
        ...skills,
        {
          name: newSkill.trim(),
          rating: newSkillRating,
        },
      ]);
      setNewSkill("");
      setNewSkillRating(undefined);
    }
  };

  const handleRemoveSkill = (index: number): void => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleUpdateSkillRating = (
    index: number,
    rating: number | undefined
  ): void => {
    setSkills(prevSkills =>
      prevSkills.map((skill, i) => (i === index ? { ...skill, rating } : skill))
    );
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {fetchLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-10" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your profile information will be used in your resumes and
                  applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Legal Name</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="legalFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="First name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legalLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="hasPreferredName"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I have a preferred name</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {showPreferredNameFields && (
                        <>
                          <h3 className="text-lg font-medium">
                            Preferred Name
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="preferredFirstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Preferred first name"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="preferredLastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Preferred last name"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Professional Details
                      </h3>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Software Engineer"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself"
                                {...field}
                                value={field.value || ""}
                                className="min-h-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Address</h3>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Street address"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ZIP or postal code"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              {watchCountry === "United States" ? (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {usStates.map((state: StateType) => (
                                      <SelectItem
                                        key={state.name}
                                        value={state.name}
                                      >
                                        {state.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : watchCountry === "Canada" ? (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a province" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {canadaProvinces.map(
                                      (province: StateType) => (
                                        <SelectItem
                                          key={province.name}
                                          value={province.name}
                                        >
                                          {province.name}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <FormControl>
                                  <Input
                                    placeholder="State or province"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select
                                onValueChange={handleCountryChange}
                                value={field.value || undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map(country => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. San Francisco, CA"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              This will be shown on your resume (e.g. San
                              Francisco, CA)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Contact Information
                      </h3>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. +1 (555) 123-4567"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Online Presence</h3>
                      <FormDescription>
                        Add links to your online profiles and websites
                      </FormDescription>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0">
                            <div className="w-10 flex-shrink-0">
                              <LinkIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-grow space-y-1">
                              <FormLabel>Personal Website</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. https://yourwebsite.com"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0">
                            <div className="w-10 flex-shrink-0">
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                              </svg>
                            </div>
                            <div className="flex-grow space-y-1">
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. https://linkedin.com/in/yourusername"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="github"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-4 space-y-0">
                            <div className="w-10 flex-shrink-0">
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </div>
                            <div className="flex-grow space-y-1">
                              <FormLabel>GitHub</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. https://github.com/yourusername"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Skills</h3>
                      <div className="space-y-4">
                        {skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input value={skill.name} disabled />
                            </div>
                            <SkillRating
                              value={skill.rating}
                              onChange={rating =>
                                handleUpdateSkillRating(index, rating)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSkill(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Input
                              placeholder="Add a new skill"
                              value={newSkill}
                              onChange={e => setNewSkill(e.target.value)}
                            />
                          </div>
                          <SkillRating
                            value={newSkillRating}
                            onChange={setNewSkillRating}
                          />
                          <Button
                            variant="outline"
                            onClick={handleAddSkill}
                            disabled={!newSkill.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              {
                title: "Work Experience",
                description: "Add your work history to strengthen your profile",
                href: "/profile/experience",
                icon: Briefcase,
              },
              {
                title: "Education",
                description: "Add your educational background",
                href: "/profile/education",
                icon: GraduationCap,
              },
              {
                title: "Certifications",
                description: "Add your certifications",
                href: "/profile/certifications",
                icon: Award,
              },
              {
                title: "Projects",
                description: "Add your projects",
                href: "/profile/projects",
                icon: Code2,
              },
            ].map((item, index) => {
              if (fetchLoading) {
                return (
                  <Card key={index}>
                    <CardHeader>
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                );
              } else {
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link
                          href={item.href}
                          className="flex justify-between w-full"
                        >
                          Manage {item.title}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
