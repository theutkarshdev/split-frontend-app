import { Label, Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useMemo } from "react";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--pie-chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--pie-chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--pie-chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--pie-chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--pie-chart-5)",
  },
} satisfies ChartConfig;

export function ChartPieDonutText() {
  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-full w-full"
    >
      <PieChart>
        <Pie
          data={chartData}
          dataKey="visitors"
          nameKey="browser"
          innerRadius={55}
          strokeWidth={5}
          paddingAngle={3}
          cornerRadius={5}
          cx={"25%"}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-xl font-bold"
                    >
                      ₹{" "}{totalVisitors.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total Paid
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>

        <ChartLegend
          verticalAlign="middle"
          layout="vertical"
          content={<ChartLegendContent nameKey="browser" />}
          className="grid grid-cols-1 gap-y-2"
          wrapperStyle={{
            position: "absolute",
            top: "50%",
            left: "75%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}
