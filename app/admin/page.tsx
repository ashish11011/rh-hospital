import { 
  getTodayStats, 
  getUserGrowthData, 
  getRevenueData, 
  getRecentWorkshopAnalytics 
} from "@/actions/dashboardActions";
import { UserGrowthChart, RevenueChart, WorkshopAnalyticsChart } from "./DashboardCharts";
import { Users, IndianRupee, BookOpen, GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, userGrowth, revenueData, workshopAnalytics] = await Promise.all([
    getTodayStats(),
    getUserGrowthData(),
    getRevenueData(),
    getRecentWorkshopAnalytics(),
  ]);

  return (
    <div className="w-full space-y-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your key metrics and recent performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshop Registrations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workshopRegistrations}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seminar Registrations</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.seminarRegistrations}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <UserGrowthChart data={userGrowth} />
        <RevenueChart data={revenueData} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <WorkshopAnalyticsChart data={workshopAnalytics} />
      </div>
    </div>
  );
}
