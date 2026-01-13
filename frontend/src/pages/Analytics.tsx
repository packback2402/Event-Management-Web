import React, { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

const Analytics: React.FC = () => {
  const [approvedLast5Months, setApprovedLast5Months] = useState(0);
  const [approvedNext3Months, setApprovedNext3Months] = useState(0);
  const [attendeesLastMonth, setAttendeesLastMonth] = useState(0);
  const [revenueLastMonth, setRevenueLastMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          approved5,
          approved3,
          attendees,
          revenue,
        ] = await Promise.all([
          apiClient.get(API_ENDPOINTS.USER.STATS.APPROVED_LAST_5_MONTHS),
          apiClient.get(API_ENDPOINTS.USER.STATS.APPROVED_NEXT_3_MONTHS),
          apiClient.get(API_ENDPOINTS.USER.STATS.ATTENDEES_LAST_MONTH),
          apiClient.get(API_ENDPOINTS.USER.STATS.REVENUE_LAST_MONTH),
        ]);

        setApprovedLast5Months(approved5.data.total);
        setApprovedNext3Months(approved3.data.total);
        setAttendeesLastMonth(attendees.data.totalAttendees);
        setRevenueLastMonth(revenue.data.totalRevenue);
      } catch (error) {
        console.error("Fetch analytics error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  const chartData = [
    { name: "Passed Events (Past 5M)", value: approvedLast5Months },
    { name: "Upcoming Events (Next 3M)", value: approvedNext3Months },
    { name: "Attendees (3M)", value: attendeesLastMonth },
    { name: "Revenue (3M)", value: revenueLastMonth },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Passed Events  (Last 5 Months)" value={approvedLast5Months} />
        <StatCard title="Upcoming Events (Next 3 Months)" value={approvedNext3Months} />
        <StatCard title="Total Attendees (Last 3 Months)" value={attendeesLastMonth} />
        <StatCard title="Total Revenue (Last 3 Months)" value={`$${revenueLastMonth}`} />
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistics Summary</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
