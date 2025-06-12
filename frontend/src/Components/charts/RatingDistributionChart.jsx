import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"

const RatingDistributionChart = ({ places }) => {
  // Create data for radar chart based on ratings
  const chartData = [
    { category: "5★", value: places.filter((p) => p.rating >= 4.8).length },
    { category: "4.5★", value: places.filter((p) => p.rating >= 4.5 && p.rating < 4.8).length },
    { category: "4★", value: places.filter((p) => p.rating >= 4.0 && p.rating < 4.5).length },
    { category: "3.5★", value: places.filter((p) => p.rating >= 3.5 && p.rating < 4.0).length },
    { category: "3★", value: places.filter((p) => p.rating < 3.5).length },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey="category" tick={{ fill: "#6B7280", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={{ fill: "#6B7280", fontSize: 12 }} />
        <Radar name="Places" dataKey="value" stroke="#111827" fill="#111827" fillOpacity={0.6} />
        <Tooltip
          formatter={(value) => [value, "Places"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default RatingDistributionChart
