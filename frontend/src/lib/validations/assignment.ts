import { z } from "zod";

export const assignmentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(160, "Title cannot exceed 160 characters"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(120, "Subject cannot exceed 120 characters"),
  course_name: z
    .string()
    .trim()
    .max(120, "Course name cannot exceed 120 characters")
    .nullish()
    .transform((val) => val || ""),
  description: z
    .string()
    .trim()
    .nullish()
    .transform((val) => val || ""),
  learning_objectives: z
    .array(z.string().trim().min(1, "Objective cannot be empty"))
    .min(1, "At least one learning objective is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  due_at: z
    .string()
    .nullish()
    .refine(
      (val) => {
        if (!val) return true;
        const parsed = Date.parse(val);
        return !isNaN(parsed);
      },
      { message: "Please provide a valid date and time" }
    ),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export interface AssignmentRecord {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  course_name?: string | null;
  description?: string | null;
  learning_objectives: string[];
  difficulty: "easy" | "medium" | "hard";
  due_at?: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}
