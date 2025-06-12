import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const EngagementChart = ({ data }) => {
  // Calculate engagement rate for each day
  const engagementData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rate: ((item.reviews / item.users) * 100).toFixed(1),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={engagementData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={{ stroke: "#E5E7EB" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={{ stroke: "#E5E7EB" }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Engagement Rate"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Area type="monotone" dataKey="rate" stroke="#111827" fill="rgba(17, 24, 39, 0.1)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default EngagementChart
