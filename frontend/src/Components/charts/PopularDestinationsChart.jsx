import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const PopularDestinationsChart = ({ data }) => {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.name.split(",")[0], // Just take the city name for cleaner display
    visits: item.visits,
    growth: item.growth,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          scale="point"
          padding={{ left: 10, right: 10 }}
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={{ stroke: "#E5E7EB" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={{ stroke: "#E5E7EB" }}
        />
        <Tooltip
          formatter={(value) => [value.toLocaleString(), "Visits"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Bar dataKey="visits" fill="#111827" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default PopularDestinationsChart
