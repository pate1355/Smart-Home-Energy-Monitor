import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { EnergyDataPoint, TimePeriod } from "../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  energyData: EnergyDataPoint[];
  deviceStats: Array<{
    id: string;
    name: string;
    type: string;
    consumption: number;
    percentage: number;
  }>;
  currentPeriod: TimePeriod;
  billForecast: number;
}

const COLORS = [
  "#10b981", // primary
  "#3b82f6", // secondary
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
];

const Dashboard: React.FC<DashboardProps> = ({
  energyData,
  deviceStats,
  currentPeriod,
}) => {
  // Prepare chart data
  const consumptionChartData = energyData.map((data) => {
    const date = new Date(data.timestamp);
    let timeLabel = "";

    if (currentPeriod === "today") {
      timeLabel = `${date.getHours()}:00`;
    } else if (currentPeriod === "week") {
      timeLabel = date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      timeLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return {
      time: timeLabel,
      consumption: parseFloat(data.consumption.toFixed(3)),
      cost: parseFloat(data.cost.toFixed(2)),
    };
  });

  // Aggregate data for better visualization on week/month view
  const aggregatedData =
    currentPeriod === "today"
      ? consumptionChartData
      : consumptionChartData.reduce((acc: any[], curr, index) => {
          if (index % (currentPeriod === "week" ? 24 : 24) === 0) {
            acc.push(curr);
          } else if (acc.length > 0) {
            const last = acc[acc.length - 1];
            last.consumption += curr.consumption;
            last.cost += curr.cost;
          }
          return acc;
        }, []);

  // Prepare device breakdown data
  const deviceChartData = deviceStats.slice(0, 6).map((stat, index) => ({
    name: stat.name,
    value: parseFloat(stat.consumption.toFixed(2)),
    percentage: parseFloat(stat.percentage.toFixed(1)),
    color: COLORS[index % COLORS.length],
  }));

  // Hourly comparison data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = energyData.filter(
      (d) => new Date(d.timestamp).getHours() === hour
    );
    const avg =
      hourData.length > 0
        ? hourData.reduce((sum, d) => sum + d.consumption, 0) / hourData.length
        : 0;

    return {
      hour: `${hour}:00`,
      consumption: parseFloat(avg.toFixed(3)),
    };
  });

  // Line Chart Configuration
  const lineChartData = {
    labels: aggregatedData.map((d) => d.time),
    datasets: [
      {
        label: "Consumption (kWh)",
        data: aggregatedData.map((d) => d.consumption),
        borderColor: "#10b981",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
          gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#10b981",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#6b7280",
          font: { size: 12, weight: "bold" },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#6b7280",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return ` ${context.dataset.label}: ${value.toFixed(3)} kWh`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 11, weight: 500 },
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 11, weight: 500 },
        },
        title: {
          display: true,
          text: "kWh",
          color: "#6b7280",
          font: { size: 12, weight: "bold" },
        },
      },
    },
  };

  // Doughnut Chart Configuration (Device Breakdown)
  const doughnutChartData = {
    labels: deviceChartData.map((d) => d.name),
    datasets: [
      {
        data: deviceChartData.map((d) => d.value),
        backgroundColor: deviceChartData.map((d) => d.color),
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutChartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll show custom legend below
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#6b7280",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const device = deviceChartData[context.dataIndex];
            return ` ${device.name}: ${device.value.toFixed(
              2
            )} kWh (${device.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  // Bar Chart Configuration (Hourly Pattern)
  const barChartData = {
    labels: hourlyData.map((d) => d.hour),
    datasets: [
      {
        label: "Avg Consumption (kWh)",
        data: hourlyData.map((d) => d.consumption),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.6)");
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 50,
      },
    ],
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#6b7280",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return ` Avg: ${value.toFixed(3)} kWh`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 10, weight: 500 },
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 10,
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 11, weight: 500 },
        },
        title: {
          display: true,
          text: "kWh",
          color: "#6b7280",
          font: { size: 12, weight: "bold" },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Main Consumption Chart */}
      <div className="card animate-slide-up p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Energy Consumption Over Time
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time monitoring • Updated every 5 seconds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-dot status-online" />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Live
            </span>
          </div>
        </div>
        <div style={{ height: "320px" }}>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Full-Width Device Energy Breakdown */}
      <div
        className="card animate-slide-up p-6"
        style={{ animationDelay: "50ms" }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Device Energy Breakdown
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Distribution by device type
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Doughnut Chart */}
          <div
            style={{
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>

          {/* Device Legend/List */}
          <div className="space-y-3">
            {deviceChartData.map((device, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {device.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold number-display text-gray-900 dark:text-white">
                    {device.value.toFixed(2)} kWh
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {device.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Consumption Pattern */}
      <div
        className="card animate-slide-up p-6"
        style={{ animationDelay: "100ms" }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Average Hourly Pattern
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Peak usage identification
          </p>
        </div>
        <div style={{ height: "280px" }}>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
