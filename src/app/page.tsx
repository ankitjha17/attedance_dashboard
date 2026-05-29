"use client";

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Percent } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const { students, attendance } = useAppContext();
  
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAttendance = attendance.filter((a) => a.date === today);
  
  const totalStudents = students.length;
  const presentToday = todayAttendance.filter((a) => a.status === "present").length;
  const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
  const markedToday = presentToday + absentToday;
  
  const attendancePercentage = markedToday > 0 
    ? Math.round((presentToday / markedToday) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of today's attendance ({format(new Date(), "MMMM d, yyyy")})
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {markedToday === 0 ? "No attendance marked yet" : ""}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Attendance %</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on marked students
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/attendance">
              <Button className="w-full justify-start" size="lg" variant="outline">
                <UserCheck className="mr-2 h-5 w-5 text-green-600" />
                Mark Today's Attendance
              </Button>
            </Link>
            <Link href="/students">
              <Button className="w-full justify-start" size="lg" variant="outline">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Manage Students
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missing Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {totalStudents - markedToday > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You haven't marked attendance for <span className="font-bold text-primary">{totalStudents - markedToday}</span> students today.
                </p>
                <Link href="/attendance">
                  <Button className="w-full">Complete Attendance</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">
                  Attendance has been marked for all {totalStudents} students today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
