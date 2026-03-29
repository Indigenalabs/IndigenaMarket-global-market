'use client';

import { useState } from 'react';
import { 
  TrendingUp,
  Users,
  BookOpen,
  Star,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Activity,
  Globe
} from 'lucide-react';
import Link from 'next/link';

// Mock analytics data
const analyticsData = {
  overview: {
    totalStudents: 2341,
    totalRevenue: 156000,
    totalCourses: 8,
    avgRating: 4.8,
    completionRate: 73,
    studentGrowth: 23,
    revenueGrowth: 18,
    engagementRate: 68
  },
  monthlyRevenue: [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 15000 },
    { month: 'Mar', amount: 13500 },
    { month: 'Apr', amount: 18000 },
    { month: 'May', amount: 22000 },
    { month: 'Jun', amount: 19500 },
    { month: 'Jul', amount: 25000 },
    { month: 'Aug', amount: 28000 },
  ],
  coursePerformance: [
    { id: '1', title: 'Navajo Weaving Masterclass', students: 1234, revenue: 184000, rating: 4.9, completion: 78 },
    { id: '2', title: 'Lakota Language Fundamentals', students: 892, revenue: 178000, rating: 4.8, completion: 65 },
    { id: '3', title: 'Traditional Pottery Techniques', students: 567, revenue: 73000, rating: 4.7, completion: 82 },
    { id: '4', title: 'Indigenous Entrepreneurship', students: 445, revenue: 89000, rating: 4.6, completion: 71 },
  ],
  studentDemographics: {
    byCountry: [
      { country: 'United States', percentage: 45 },
      { country: 'Canada', percentage: 25 },
      { country: 'Mexico', percentage: 12 },
      { country: 'Australia', percentage: 8 },
      { country: 'Others', percentage: 10 },
    ],
    byDevice: [
      { device: 'Desktop', percentage: 52 },
      { device: 'Mobile', percentage: 38 },
      { device: 'Tablet', percentage: 10 },
    ],
    byAge: [
      { range: '18-24', percentage: 15 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 28 },
      { range: '45-54', percentage: 15 },
      { range: '55+', percentage: 7 },
    ]
  },
  recentActivity: [
    { id: '1', action: 'New enrollment', course: 'Navajo Weaving Masterclass', student: 'Sarah Johnson', time: '2 minutes ago' },
    { id: '2', action: 'Course completed', course: 'Traditional Pottery Techniques', student: 'Mike Chen', time: '15 minutes ago' },
    { id: '3', action: 'New review', course: 'Lakota Language Fundamentals', student: 'Emma Wilson', time: '1 hour ago' },
    { id: '4', action: 'Quiz submitted', course: 'Indigenous Entrepreneurship', student: 'James Brown', time: '2 hours ago' },
    { id: '5', action: 'New enrollment', course: 'Navajo Weaving Masterclass', student: 'Lisa Davis', time: '3 hours ago' },
  ]
};

export default function InstructorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const maxRevenue = Math.max(...analyticsData.monthlyRevenue.map(m => m.amount));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 text-sm">Track your teaching performance and student engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors text-sm">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: analyticsData.overview.totalStudents.toLocaleString(), icon: Users, color: '#d4af37', growth: analyticsData.overview.studentGrowth },
            { label: 'Total Revenue', value: `${analyticsData.overview.totalRevenue.toLocaleString()} INDI`, icon: DollarSign, color: '#22c55e', growth: analyticsData.overview.revenueGrowth },
            { label: 'Avg Rating', value: analyticsData.overview.avgRating.toString(), icon: Star, color: '#f59e0b', growth: null },
            { label: 'Completion Rate', value: `${analyticsData.overview.completionRate}%`, icon: Target, color: '#DC143C', growth: null },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#141414] rounded-xl p-5 border border-[#d4af37]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                {stat.growth !== null && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <ArrowUpRight size={14} />
                    <span>{stat.growth}%</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} />
                <span>Last 8 Months</span>
              </div>
            </div>
            
            <div className="h-64 flex items-end gap-3">
              {analyticsData.monthlyRevenue.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-[#d4af37] to-[#f4e4a6] rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(month.amount / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-gray-400">{month.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Student Demographics</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-gray-400 mb-3">By Country</h4>
                <div className="space-y-2">
                  {analyticsData.studentDemographics.byCountry.slice(0, 3).map((item) => (
                    <div key={item.country} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-24">{item.country}</span>
                      <div className="flex-1 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#d4af37] rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-10 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-3">By Device</h4>
                <div className="flex gap-2">
                  {analyticsData.studentDemographics.byDevice.map((item) => (
                    <div key={item.device} className="flex-1 bg-[#0a0a0a] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-[#d4af37]">{item.percentage}%</p>
                      <p className="text-xs text-gray-400">{item.device}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Course Performance</h3>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Courses</option>
              {analyticsData.coursePerformance.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#d4af37]/10">
                  <th className="pb-3 text-sm font-medium text-gray-400">Course</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Students</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Revenue</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Rating</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Completion</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/10">
                {analyticsData.coursePerformance.map((course) => (
                  <tr key={course.id} className="group">
                    <td className="py-4">
                      <Link href={`/courses/${course.id}`} className="text-white hover:text-[#d4af37] transition-colors">
                        {course.title}
                      </Link>
                    </td>
                    <td className="py-4 text-gray-300">{course.students.toLocaleString()}</td>
                    <td className="py-4 text-[#d4af37]">{course.revenue.toLocaleString()} INDI</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                        <span className="text-white">{course.rating}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] rounded-full"
                            style={{ width: `${course.completion}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">{course.completion}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-green-400">
                        <ArrowUpRight size={16} />
                        <span className="text-sm">+12%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-[#0a0a0a] rounded-lg">
                  <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                    <Activity size={18} className="text-[#d4af37]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.action}</span>
                      {' '}in{' '}
                      <Link href={`/courses/${activity.course}`} className="text-[#d4af37] hover:underline">
                        {activity.course}
                      </Link>
                    </p>
                    <p className="text-gray-400 text-xs">by {activity.student}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#0a0a0a] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={18} className="text-[#d4af37]" />
                  <span className="text-gray-400 text-sm">Avg. Watch Time</span>
                </div>
                <p className="text-2xl font-bold text-white">12m 34s</p>
                <p className="text-green-400 text-xs">+8% from last month</p>
              </div>

              <div className="p-4 bg-[#0a0a0a] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={18} className="text-[#d4af37]" />
                  <span className="text-gray-400 text-sm">Certificates Issued</span>
                </div>
                <p className="text-2xl font-bold text-white">847</p>
                <p className="text-green-400 text-xs">+15% from last month</p>
              </div>

              <div className="p-4 bg-[#0a0a0a] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={18} className="text-[#d4af37]" />
                  <span className="text-gray-400 text-sm">Countries Reached</span>
                </div>
                <p className="text-2xl font-bold text-white">23</p>
                <p className="text-gray-500 text-xs">Across 5 continents</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
