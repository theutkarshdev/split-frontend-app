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
import { PieChart as PieChartIcon } from "lucide-react";

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
  const [selectedPie, setSelectedPie] = useState<string | null>(null);

  const { chartConfig, pieData, total } = useMemo(() => {
    const empty = {
      chartConfig: { visitors: { label: "Amount" } } as ChartConfig,
      pieData: [] as Array<{
        username: string;
        fullName: string;
        visitors: number;
        fill: string;
        type: string;
      }>,
      total: 0,
    };

    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      return empty;
    }

    const config: ChartConfig = { visitors: { label: "Amount" } };

    const mapped = data.data.map((item, idx) => {
      const colorVar = PIE_COLORS[idx % PIE_COLORS.length];
      config[item.username] = {
        label: item.fullName.split(" ")[0] || item.username,
        color: colorVar,
      };
      return {
        username: item.username,
        fullName: item.fullName,
        visitors: Math.max(0, Number(item.amount) || 0),
        fill: colorVar,
        type: item.type,
      };
    });

    const filteredData = selectedPie
      ? mapped.filter((item) => item.username === selectedPie)
      : mapped;

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
      <div className="h-full w-full grid grid-cols-[1.1fr_0.9fr] items-center p-3">
        <div className="flex items-center justify-center">
          <div className="relative size-32">
            <Skeleton className="h-full w-full rounded-full" />
            <div className="absolute inset-6 bg-card rounded-full" />
          </div>
        </div>
        <div className="px-2 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!pieData.length) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
        <div className="size-10 rounded-full bg-muted/60 grid place-content-center text-muted-foreground mb-2">
          <PieChartIcon className="size-5" />
        </div>
        <p className="text-xs font-medium text-foreground/80">All settled up</p>
        <p className="text-[11px] text-muted-foreground">No active balance with friends</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square h-full w-full max-h-[190px]"
    >
      <PieChart>
        <Pie
          data={pieData}
          dataKey="visitors"
          nameKey="username"
          innerRadius={48}
          outerRadius={68}
          strokeWidth={3}
          stroke="var(--color-card)"
          paddingAngle={4}
          cornerRadius={4}
          cx={"32%"}
          cy={"50%"}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                let paidType = data?.type;
                if (selectedPie && data?.data) {
                  const selectedUser = data.data.find(
                    (item) => item.username === selectedPie
                  );
                  if (selectedUser) {
                    paidType = selectedUser.type;
                  }
                }
                const isPaid = paidType === "paid";

                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 8}
                      className={`text-base font-extrabold tracking-tight ${
                        isPaid ? "fill-emerald-500 dark:fill-emerald-400" : "fill-rose-500 dark:fill-rose-400"
                      }`}
                    >
                      ₹{total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 12}
                      className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
                    >
                      {isPaid ? "Paid" : "Owed"}
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
                const isPaid = sliceType === "paid";
                return (
                  <div className="flex justify-between items-center gap-4 w-full">
                    <span className="font-medium text-xs">
                      {item?.payload?.fullName?.split(" ")[0] || item?.payload?.username}
                    </span>
                    <span
                      className={`font-semibold text-xs tabular-nums ${
                        isPaid ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                      }`}
                    >
                      ₹{amt.toLocaleString()}
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
            <div className="max-h-[140px] overflow-y-auto pr-1">
              <ul className="space-y-1">
                {data?.data?.map((user, index) => {
                  const isActive = selectedPie === user.username;
                  const isFiltered =
                    selectedPie && selectedPie !== user.username;

                  return (
                    <li
                      onClick={() => {
                        if (selectedPie === user.username) {
                          setSelectedPie(null);
                        } else {
                          setSelectedPie(user.username);
                        }
                      }}
                      key={`item-${user.username}`}
                      className={`flex items-center justify-between gap-1.5 cursor-pointer py-1 px-2 rounded-lg text-xs transition-all duration-150 ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : isFiltered
                          ? "opacity-35 hover:opacity-75"
                          : "hover:bg-muted/50 text-foreground/80"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span className="truncate max-w-[65px]">
                          {user.fullName?.split(" ")[0] || user.username}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium opacity-80 shrink-0">
                        ₹{Number(user.amount || 0).toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          wrapperStyle={{
            position: "absolute",
            top: "50%",
            left: "65%",
            width: "35%",
            transform: "translateY(-50%)",
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}
