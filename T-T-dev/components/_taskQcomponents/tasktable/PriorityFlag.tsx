"use client";

import React from "react";

function TwoColorFlag({
  className,
  color,
  title,
}: {
  className: string;
  color: string;
  title: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
    >
      {/* Pole */}
      <rect x="3" y="2" width="2" height="20" fill="#121212" />
      {/* Flag Body */}
      <path d="M5 3H18L14 8L18 13H5V3Z" fill={color} />
    </svg>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ffcd43",
  Medium: "#2986CC",
  Low: "#059669",
};

export default function PriorityFlag({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority];
  if (!color) return null;

  return (
    <TwoColorFlag
      className="w-3.5 h-3.5"
      color={color}
      title={`${priority} Priority`}
    />
  );
}
