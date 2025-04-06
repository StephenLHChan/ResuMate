import { Star } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface SkillRatingProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
}

export const SkillRating = ({
  value,
  onChange,
  className,
}: SkillRatingProps) => {
  const handleClick = (rating: number) => {
    // If clicking the same rating, remove the rating
    if (rating === value) {
      onChange(undefined);
    } else {
      onChange(rating);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map(rating => (
        <Button
          key={rating}
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={() => handleClick(rating)}
        >
          <Star
            className={cn(
              "h-4 w-4",
              value && rating <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        </Button>
      ))}
    </div>
  );
};
