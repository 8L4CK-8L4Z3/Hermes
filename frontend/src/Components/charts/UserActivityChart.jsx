import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const UserActivityChart = ({ data }) => {
  // Format dates for better display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        <Line
          type="monotone"
          dataKey="users"
          name="Active Users"
          stroke="#111827"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        <Line type="monotone" dataKey="trips" name="New Trips" stroke="#4F46E5" strokeWidth={2} />
        <Line type="monotone" dataKey="reviews" name="New Reviews" stroke="#10B981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default UserActivityChart
