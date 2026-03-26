"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { TaskHistoryCategory } from "@/services/dashboard/DashboardParams";
import { getColorForString } from "@/lib/ColourPalette";
import { useDashboardFilters } from "@/services/dashboard/DashboardContext";
import DateRangePicker from "@/components/_dashboardcomponents/DateRangePicker";

interface Props {
  data: TaskHistoryCategory[];
}

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 days", days: 7 },
  { label: "1 month", days: 30 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
  hoveredCategory,
  selectedCategory,
  onSelectCategory,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  hoveredCategory: string | null;
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
}) => {
  // Logic Change: If nothing is hovered and nothing is selected, don't show the tooltip.
  // This prevents the "all categories" view when just moving the mouse over the chart area.
  if (
    !active ||
    !payload ||
    !payload.length ||
    (!hoveredCategory && !selectedCategory)
  ) {
    return null;
  }

  // If a category is selected, focus on that. Otherwise, focus on what's currently hovered.
  const targetCategory = selectedCategory || hoveredCategory;
  const visibleEntries = payload.filter((p) => p.dataKey === targetCategory);

  if (!visibleEntries.length) return null;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 11,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        minWidth: 160,
      }}
    >
      <p style={{ color: "#888", marginBottom: 6, fontWeight: 500 }}>{label}</p>
      {visibleEntries.map((entry) => (
        <div
          key={entry.dataKey}
          onClick={() => onSelectCategory(entry.dataKey)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 6px",
            borderRadius: 4,
            cursor: "pointer",
            marginBottom: 2,
            background:
              selectedCategory === entry.dataKey
                ? `${entry.stroke}18`
                : "transparent",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.stroke,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#475569", flex: 1 }}>{entry.dataKey}</span>
          <span style={{ color: entry.stroke, fontWeight: 400 }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TaskHistoryChart = ({ data }: Props) => {
  const { setFilter } = useDashboardFilters();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>("7 days");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(undefined);
  const [tempTo, setTempTo] = useState<Date | undefined>(undefined);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory((prev) => (prev === cat ? null : cat));
  };

  const handlePreset = (preset: { label: string; days: number }) => {
    const today = new Date();
    const from =
      preset.days === 0
        ? format(today, "yyyy-MM-dd")
        : format(subDays(today, preset.days), "yyyy-MM-dd");
    const to = format(today, "yyyy-MM-dd");
    setActivePreset(preset.label);
    setFilter("dateRange", { from, to });
  };

  const handleApplyRange = () => {
    if (!tempFrom || !tempTo) return;
    setFilter("dateRange", {
      from: format(tempFrom, "yyyy-MM-dd"),
      to: format(tempTo, "yyyy-MM-dd"),
    });
    setActivePreset(null);
    setIsPickerOpen(false);
  };

  const { categories, chartData } = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {};
    const categorySet = new Set<string>();

    data.forEach((item) => {
      const date = item.EndDate.split("T")[0];
      if (!byDate[date]) byDate[date] = {};
      byDate[date][item.Category] = Number(item.ActiveTasks) || 0;
      categorySet.add(item.Category);
    });

    const categories = Array.from(categorySet);
    const chartData = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cats]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        ...cats,
      }));

    return { categories, chartData };
  }, [data]);

  const getLineOpacity = (cat: string) => {
    if (!selectedCategory && !hoveredCategory) return 1;
    if (selectedCategory) return selectedCategory === cat ? 1 : 0.1;
    return hoveredCategory === cat ? 1 : 0.3;
  };

  const getLineWidth = (cat: string) => {
    if (selectedCategory === cat || hoveredCategory === cat) return 3;
    return 1.5;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              style={{
                fontSize: 10,
                padding: "3px 10px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: activePreset === preset.label ? 400 : 400,
                background:
                  activePreset === preset.label ? "#ffffff" : "transparent",
                color: activePreset === preset.label ? "#1e293b" : "#94a3b8",
                boxShadow:
                  activePreset === preset.label
                    ? "0 1px 3px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <DateRangePicker
          isMainPopoverOpen={isPickerOpen}
          setIsMainPopoverOpen={setIsPickerOpen}
          viewType={activePreset === null ? "Custom" : "Preset"}
          tempFrom={tempFrom}
          setTempFrom={setTempFrom}
          tempTo={tempTo}
          setTempTo={setTempTo}
          handleApplyRange={handleApplyRange}
        />
      </div>

      {/* Chart */}
      <div
        style={{ flex: 1, cursor: "default" }}
        onClick={(e) => {
          if ((e.target as SVGElement).tagName === "svg")
            setSelectedCategory(null);
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -30, bottom: 10 }}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            // In TaskHistoryChart, replace the XAxis with this:
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              interval={0}
              ticks={(() => {
                if (chartData.length <= 7) return chartData.map((d) => d.date);

                const totalTicks = 7; // total ticks including first and last
                const step = (chartData.length - 1) / (totalTicks - 1);

                return Array.from(
                  { length: totalTicks },
                  (_, i) => chartData[Math.round(i * step)].date,
                );
              })()}
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
            <Tooltip
              content={
                <CustomTooltip
                  hoveredCategory={hoveredCategory}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                />
              }
              // This is key: triggering only when we actually have a target
              cursor={{
                stroke:
                  selectedCategory || hoveredCategory
                    ? "rgba(128,128,128,0.3)"
                    : "transparent",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: "10px" }}
              iconSize={8}
              iconType="plainline"
              onClick={(e) => handleSelectCategory(e.dataKey as string)}
              formatter={(value) => (
                <span
                  style={{
                    color:
                      selectedCategory && selectedCategory !== value
                        ? "#cbd5e1"
                        : "#475569",
                    fontWeight:
                      selectedCategory === value || hoveredCategory === value
                        ? 400
                        : 400,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredCategory(value)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {value}
                </span>
              )}
            />
            {categories.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={getColorForString(cat)}
                strokeWidth={getLineWidth(cat)}
                strokeOpacity={getLineOpacity(cat)}
                dot={false}
                activeDot={{
                  r: selectedCategory && selectedCategory !== cat ? 0 : 4,
                  strokeWidth: 0,
                }}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => handleSelectCategory(cat)}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {selectedCategory && (
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "#94a3b8",
            paddingBottom: 4,
            cursor: "pointer",
          }}
          onClick={() => setSelectedCategory(null)}
        >
          ✕ Click to clear selection
        </div>
      )}
    </div>
  );
};
