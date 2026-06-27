import { z } from "zod";

export const loginSchema = z.object({
  employeeCode: z
    .string()
    .min(1, "Employee ID is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<
  typeof loginSchema
>;

const roleEnum = z.enum(
  ["super_admin", "store_manager", "supervisor", "worker"],
  { message: "Please select a role" }
);

export const employeeCreateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),

  email: z
    .string()
    .email("Please enter a valid email address"),

  role: roleEnum,

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be under 72 characters"),
});

export type EmployeeCreateFormData = z.infer<
  typeof employeeCreateSchema
>;

export const employeeEditSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),

  email: z
    .string()
    .email("Please enter a valid email address"),

  role: roleEnum,
});

export type EmployeeEditFormData = z.infer<
  typeof employeeEditSchema
>;

/* ──────────────── Material Schemas ──────────────── */

export const materialCreateSchema = z.object({
  material_type: z
    .string()
    .min(1, "Material type is required")
    .max(100, "Material type must be under 100 characters"),

  material_size: z
    .string()
    .min(1, "Size / specification is required")
    .max(100, "Size must be under 100 characters"),

  unit: z
    .string()
    .min(1, "Unit is required")
    .max(30, "Unit must be under 30 characters"),

  minimum_stock: z
    .number({ message: "Minimum stock must be a number" })
    .min(0, "Minimum stock cannot be negative"),

  current_quantity: z
    .number({ message: "Initial stock must be a number" })
    .min(0, "Initial stock cannot be negative")
    .optional(),

  location: z
    .string()
    .max(200, "Location must be under 200 characters")
    .optional()
    .or(z.literal("")),
});

export type MaterialCreateFormData = z.infer<
  typeof materialCreateSchema
>;

export const materialEditSchema = z.object({
  material_type: z
    .string()
    .min(1, "Material type is required")
    .max(100, "Material type must be under 100 characters"),

  material_size: z
    .string()
    .min(1, "Size / specification is required")
    .max(100, "Size must be under 100 characters"),

  unit: z
    .string()
    .min(1, "Unit is required")
    .max(30, "Unit must be under 30 characters"),

  minimum_stock: z
    .number({ message: "Minimum stock must be a number" })
    .min(0, "Minimum stock cannot be negative"),

  location: z
    .string()
    .max(200, "Location must be under 200 characters")
    .optional()
    .or(z.literal("")),
});

export type MaterialEditFormData = z.infer<
  typeof materialEditSchema
>;