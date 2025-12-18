import { Label, Pie, PieChart } from "recharts";
import { useMemo, useState } from "react";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardEntry = {
  username: string;
  fullName: string;
  amount: number;
  type: "owed" | "paid" | string;
};

type DashboardPayload = {
  totalAmount: number;
  type: "owed" | "paid" | string;
  data: DashboardEntry[];
} | null;

const PIE_COLORS = [
  "var(--pie-chart-1)",
  "var(--pie-chart-2)",
  "var(--pie-chart-3)",
  "var(--pie-chart-4)",
  "var(--pie-chart-5)",
];

export function ChartPieDonutText({
  loading,
  data,
}: {
  loading: boolean;
  data: DashboardPayload;
}) {
  // Build dynamic chart config and data from payload
  const [selectedPie, setSelectedPie] = useState<string | null>(null);

  const { chartConfig, pieData, total } = useMemo(() => {
    const empty = {
      chartConfig: { visitors: { label: "Amount" } } as ChartConfig,
      pieData: [] as Array<{
        username: string;
        visitors: number;
        fill: string;
      }>,
      total: 0,
    };

    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      return empty;
    }

    const config: ChartConfig = { visitors: { label: "Amount" } };

    // Assign a color per entry (cycle through palette if needed)
    const mapped = data.data.map((item, idx) => {
      const colorVar = PIE_COLORS[idx % PIE_COLORS.length];
      // ChartStyle maps --color-<key> from config.color
      config[item.username] = {
        label: item.fullName.split(" ")[0] || item.username,
        color: colorVar,
      };
      return {
        username: item.username,
        fullName: item.fullName,
        visitors: Math.max(0, Number(item.amount) || 0),
        fill: `var(--color-${item.username})`,
        type: item.type,
      };
    });

    // Filter data based on selectedPie
    const filteredData = selectedPie
      ? mapped.filter((item) => item.username === selectedPie)
      : mapped;

    // Calculate total for filtered data
    const filteredTotal = selectedPie
      ? filteredData.reduce((a, c) => a + (c.visitors || 0), 0)
      : typeof data.totalAmount === "number"
      ? data.totalAmount
      : mapped.reduce((a, c) => a + (c.visitors || 0), 0);

    return {
      chartConfig: config,
      pieData: filteredData,
      total: filteredTotal,
    };
  }, [data, selectedPie]);

  if (loading) {
    return (
      <div className="h-full w-full grid grid-cols-[1fr_1fr] items-center">
        <div className="flex items-center justify-center">
          <div className="relative h-40 w-40">
            <Skeleton className="h-full w-full rounded-full" />
            <div className="absolute inset-10">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </div>
        </div>
        <div className="px-4">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-sm" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pieData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-full w-full"
    >
      <PieChart>
        <Pie
          data={pieData}
          dataKey="visitors"
          nameKey="username"
          innerRadius={55}
          strokeWidth={5}
          paddingAngle={3}
          cornerRadius={5}
          cx={"25%"}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                // Determine color based on selected data type if a pie is selected
                let paidType = data?.type;
                if (selectedPie && data?.data) {
                  const selectedUser = data.data.find(
                    (item) => item.username === selectedPie
                  );
                  if (selectedUser) {
                    paidType = selectedUser.type;
                  }
                }
                const colorClass =
                  paidType === "paid" ? "fill-green-500" : "fill-red-400";
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
                      className={`text-lg font-bold ${colorClass}`}
                    >
                      ₹ {total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      {paidType === "owed" ? "Total Owed" : "Total Paid"}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>

        <ChartTooltip
          cursor={{ fill: "transparent" }}
          content={
            <ChartTooltipContent
              nameKey="username"
              formatter={(value: any, _name, item) => {
                const amt =
                  typeof value === "number" ? value : Number(value) || 0;
                const sliceType = (item && (item.payload as any)?.type) as
                  | string
                  | undefined;
                const colorClass =
                  sliceType === "paid" ? "text-green-500" : "text-red-400";
                return (
                  <div className="flex justify-between w-full">
                    <span>{item?.payload?.fullName.split(" ")[0]}</span>
                    <span
                      className={`font-mono font-medium tabular-nums ${colorClass}`}
                    >
                      ₹ {amt.toLocaleString()}
                    </span>
                  </div>
                );
              }}
            />
          }
        />

        <ChartLegend
          verticalAlign="middle"
          layout="vertical"
          content={() => (
            <div>
              <ul>
                {data?.data?.map((user, index) => {
                  const isActive = selectedPie === user.username;
                  const isFiltered =
                    selectedPie && selectedPie !== user.username;

                  return (
                    <li
                      onClick={() => {
                        if (selectedPie === user.username) {
                          setSelectedPie(null); // Reset if clicking the same item
                        } else {
                          setSelectedPie(user.username);
                        }
                      }}
                      key={`item-${user.username}`}
                      className={`flex items-center gap-2 cursor-pointer p-1 rounded transition-all ${
                        isActive
                          ? "shadow-sm"
                          : isFiltered
                          ? "opacity-40 hover:opacity-70"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className="size-2 rounded-xs shrink-0"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs">
                        {user.fullName.split(" ")[0] || user.username}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
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
