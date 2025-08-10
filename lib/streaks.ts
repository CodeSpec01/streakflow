import { IActivity } from "@/models/Activity";

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  activeDays: number;
  totalDays: number;
}

export function calculateStreaks(activities: IActivity[]): StreakData {
  if (activities.length === 0) {
    return { currentStreak: 0, maxStreak: 0, activeDays: 0, totalDays: 0 };
  }

  // Create a map of dates to activity status
  const activityMap = new Map<string, boolean>();

  activities.forEach((activity) => {
    const hasActiveEntry = activity.entries.some(
      (entry) =>
        entry.level === "partially_active" || entry.level === "super_active"
    );
    activityMap.set(activity.date, hasActiveEntry);
  });

  // Get sorted dates
  const sortedDates = Array.from(activityMap.keys()).sort();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0, activeDays: 0, totalDays: 0 };
  }

  // Calculate active days
  const activeDays = Array.from(activityMap.values()).filter(Boolean).length;

  // Calculate current streak (from today backwards)
  const today = new Date().toISOString().split("T")[0];
  let currentStreak = 0;
  const currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() - 1);

  // Only start counting if today is active
  while (true) {
    const dateStr = currentDate.toISOString().split("T")[0];
    if (activityMap.get(dateStr) === true) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate max streak
  let maxStreak = 0;
  let tempStreak = 0;

  // Set startDate to January 1 of the current year
  const currentYear = new Date(today).getFullYear();
  const startDate = new Date(`${currentYear}-01-01`);
  const endDate = new Date(today);
  const checkDate = new Date(startDate);

  while (checkDate <= endDate) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const isActive = activityMap.get(dateStr) || false;

    if (isActive) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  // Calculate total days as the number of days between January 1 and today (inclusive)
  let totalDays = 0;
  if (sortedDates.length > 0) {
    // startDate and endDate already set above
    totalDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
  }

  return {
    currentStreak,
    maxStreak,
    activeDays,
    totalDays,
  };
}

export function getHeatmapData(
  activities: IActivity[],
  year: number,
  categoryId?: string
) {
  const yearStr = year.toString();
  const filteredActivities = activities.filter((activity) =>
    activity.date.startsWith(yearStr)
  );

  return filteredActivities.map((activity) => {
    let count = 0;

    if (categoryId) {
      // Filter by specific category
      const categoryEntry = activity.entries.find(
        (entry) => entry.categoryId.toString() === categoryId
      );

      if (categoryEntry) {
        if (categoryEntry.level === "partially_active") count = 1;
        else if (categoryEntry.level === "super_active") count = 2;
      }
    } else {
      // Count all active entries
      const activeEntries = activity.entries.filter(
        (entry) =>
          entry.level === "partially_active" || entry.level === "super_active"
      );

      if (activeEntries.length > 0) {
        const superActiveCount = activeEntries.filter(
          (entry) => entry.level === "super_active"
        ).length;
        count = superActiveCount > 0 ? 2 : 1;
      }
    }

    return {
      date: activity.date,
      count,
    };
  });
}
