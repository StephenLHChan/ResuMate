"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ApplicationFormProps {
  application?: {
    id: string;
    company: string;
    position: string;
    jobDescription: string;
    requirements: string[];
    status: string;
    notes: string | null;
    jobUrl: string | null;
  };
  onSuccess: () => void;
  children: React.ReactNode;
}

const ApplicationForm = ({
  application,
  onSuccess,
  children,
}: ApplicationFormProps): React.ReactElement => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: application?.company || "",
    position: application?.position || "",
    jobDescription: application?.jobDescription || "",
    requirements: application?.requirements.join("\n") || "",
    status: application?.status || "pending",
    notes: application?.notes || "",
    jobUrl: application?.jobUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requirements = formData.requirements
        .split("\n")
        .filter(req => req.trim() !== "");

      const response = await fetch(
        application
          ? `/api/applications/${application.id}`
          : "/api/applications",
        {
          method: application ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company: formData.company,
            position: formData.position,
            jobDescription: formData.jobDescription,
            requirements,
            status: formData.status,
            notes: formData.notes || null,
            jobUrl: formData.jobUrl || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${application ? "update" : "create"} application`
        );
      }

      toast({
        title: "Success",
        description: `Application ${
          application ? "updated" : "created"
        } successfully`,
      });

      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving application:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          application ? "update" : "create"
        } application`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {application ? "Edit Application" : "Add New Application"}
          </DialogTitle>
          <DialogDescription>
            {application
              ? "Update the application details below."
              : "Fill in the job details below to create a new application."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <label htmlFor="company" className="text-sm font-medium">
              Company
            </label>
            <Input
              id="company"
              value={formData.company}
              onChange={e =>
                setFormData(prev => ({ ...prev, company: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="position" className="text-sm font-medium">
              Position
            </label>
            <Input
              id="position"
              value={formData.position}
              onChange={e =>
                setFormData(prev => ({ ...prev, position: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="jobDescription" className="text-sm font-medium">
              Job Description
            </label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  jobDescription: e.target.value,
                }))
              }
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="requirements" className="text-sm font-medium">
              Requirements (one per line)
            </label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={e =>
                setFormData(prev => ({ ...prev, requirements: e.target.value }))
              }
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="jobUrl" className="text-sm font-medium">
              Job URL
            </label>
            <Input
              id="jobUrl"
              type="url"
              value={formData.jobUrl}
              onChange={e =>
                setFormData(prev => ({ ...prev, jobUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e =>
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
              className="min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationForm;
