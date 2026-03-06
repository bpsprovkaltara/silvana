import { z } from "zod";
import { ServiceType, VisitorCategory, TicketSource, ProfessionType } from "@/generated/prisma";

// Auth
export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  professionType: z.nativeEnum(ProfessionType),
  nik: z.string().length(16, "NIK harus 16 digit"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit"),
  instansi: z.string().optional(),
});

// Ticket
export const createTicketSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  needs: z.string().optional(),
  guestName: z.string().min(2, "Nama minimal 2 karakter"),
  guestNik: z.string().optional(),
  guestContact: z.string().optional(),
  guestInstansi: z.string().optional(),
  category: z.nativeEnum(VisitorCategory).default(VisitorCategory.REGULAR),
  source: z.nativeEnum(TicketSource).default(TicketSource.WALK_IN),
});

// Schedule
export const createScheduleSchema = z.object({
  operatorId: z.string().cuid("ID Operator tidak valid"),
  scheduleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

// Feedback
export const feedbackSchema = z.object({
  ticketId: z.string().cuid("ID Tiket tidak valid"),
  rating: z.number().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().optional(),
});
