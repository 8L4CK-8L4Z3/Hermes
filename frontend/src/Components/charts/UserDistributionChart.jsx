import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const UserDistributionChart = ({ data }) => {
  // Sample data for user distribution
  const chartData = [
    { name: "Active Users", value: data.activeUsers },
    { name: "Inactive Users", value: data.totalUsers - data.activeUsers },
  ]

  const COLORS = ["#111827", "#E5E7EB"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [value.toLocaleString(), "Users"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default UserDistributionChart
