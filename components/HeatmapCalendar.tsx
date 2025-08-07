"use client";

import { useMemo } from "react";
//@ts-ignore
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

interface HeatmapValue {
  date: string;
  count: number;
}

interface HeatmapCalendarProps {
  values: HeatmapValue[];
  startDate: Date;
  endDate: Date;
  showWeekdayLabels?: boolean;
}

export function HeatmapCalendar({
  values,
  startDate,
  endDate,
  showWeekdayLabels = true,
}: HeatmapCalendarProps) {
  // Keep date as string for CalendarHeatmap compatibility
  const processedValues = useMemo(() => values, [values]);

  const getClassForValue = (value: { count: number } | null) => {
    if (!value || value.count === 0) {
      return "color-empty";
    }
    if (value.count === 1) {
      return "color-scale-1";
    }
    return "color-scale-2";
  };

  return (
    <div className="w-full">
      <style jsx global>{`
        .react-calendar-heatmap .color-empty {
          fill: hsl(var(--muted));
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: hsl(142 76% 36%);
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: hsl(142 72% 29%);
        }
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: hsl(var(--muted-foreground));
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          font-size: 10px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-month-label {
          font-size: 10px;
        }
        .react-calendar-heatmap rect:hover {
          stroke: hsl(var(--ring));
          stroke-width: 1px;
        }
      `}</style>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={processedValues}
        classForValue={getClassForValue}
        showWeekdayLabels={showWeekdayLabels}
        gutterSize={2}
      />
    </div>
  );
}
