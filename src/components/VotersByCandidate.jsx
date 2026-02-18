import { useMemo } from "react";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const COLORS = [
  "#e18100",
  "#ff9500",
  "#ffb84d",
  "#ffd699",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#ffeaa7",
  "#dfe6e9",
];

export const VotersByCandidate = ({ data = [] }) => {
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.voterCount, 0);
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ["Sin datos"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e0e0e0"],
            borderColor: ["#e0e0e0"],
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = data.map((item) => item.candidateName);
    const values = data.map((item) => item.voterCount);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: COLORS.slice(0, data.length),
          borderColor: COLORS.slice(0, data.length),
          borderWidth: 1,
          label: "Votantes",
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: true,
        text: "Votantes por Candidato",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(2) : 0;
            return `${label}: ${value} votantes (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: data.length > 0,
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value) => {
          if (total === 0) return "0%";
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div style={{ position: "relative", height: "340px" }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};
