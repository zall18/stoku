"use server";

import { prisma } from "@/lib/prisma";
import { ReminderFrequency, ReminderSetting } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** Get reminder setting for current user */
export async function getReminderSetting(): Promise<ReminderSetting> {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  const existing = await prisma.reminderSetting.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  // Default setting
  return {
    userId,
    enabled: true,
    frequency: "DAILY_EVENING",
    reminderTime: "20:00",
    weekendReminderTime: "09:00",
    updatedAt: new Date(),
  };
}

/** Update reminder setting for current user */
export async function updateReminderSetting(data: {
  enabled?: boolean;
  frequency?: ReminderFrequency;
  reminderTime?: string;
  weekendReminderTime?: string;
}) {
  const user = await getCurrentUser();
  const userId = user?.id || "demo-user";

  await prisma.reminderSetting.upsert({
    where: { userId },
    create: {
      userId,
      enabled: data.enabled ?? true,
      frequency: data.frequency ?? "DAILY_EVENING",
      reminderTime: data.reminderTime ?? "20:00",
      weekendReminderTime: data.weekendReminderTime ?? "09:00",
    },
    update: {
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.reminderTime !== undefined && { reminderTime: data.reminderTime }),
      ...(data.weekendReminderTime !== undefined && {
        weekendReminderTime: data.weekendReminderTime,
      }),
    },
  });

  revalidatePath("/");
  revalidatePath("/inventaris");
}
