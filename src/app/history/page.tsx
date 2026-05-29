"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { students, attendance } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Helper for CSV Export
  const downloadCSV = () => {
    let csv = "Student Name,Date,Status\n";
    attendance.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      if (student) {
        csv += `${student.name},${record.date},${record.status}\n`;
      }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `attendance_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Student stats calculation
  const getStudentStats = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId);
    const present = studentRecords.filter(a => a.status === 'present').length;
    const absent = studentRecords.filter(a => a.status === 'absent').length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percentage };
  };

  // Month filtering for specific student
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  const studentMonthlyRecords = selectedStudentId ? attendance.filter(a => 
    a.studentId === selectedStudentId && 
    isWithinInterval(parseISO(a.date), { start: monthStart, end: monthEnd })
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & History</h2>
          <p className="text-muted-foreground mt-2">
            View attendance statistics and export records.
          </p>
        </div>
        <Button onClick={downloadCSV} variant="outline" className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-date">By Date</TabsTrigger>
          <TabsTrigger value="by-student">By Student</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Student Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Total Days</TableHead>
                    <TableHead className="text-center text-green-600">Present</TableHead>
                    <TableHead className="text-center text-red-600">Absent</TableHead>
                    <TableHead className="text-right">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => {
                    const stats = getStudentStats(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                          {student.joiningDate && (
                            <span className="text-muted-foreground text-sm font-normal ml-2">
                              ({format(new Date(student.joiningDate), "MMM yyyy")})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{stats.total}</TableCell>
                        <TableCell className="text-center text-green-600 font-medium">{stats.present}</TableCell>
                        <TableCell className="text-center text-red-600 font-medium">{stats.absent}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            stats.percentage >= 75 ? "bg-green-100 text-green-800" : 
                            stats.percentage >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                          )}>
                            {stats.percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No students data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-date" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>History by Date</CardTitle>
              <Popover>
                <PopoverTrigger render={<Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal")} />}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => {
                    const dateStr = format(selectedDate, "yyyy-MM-dd");
                    const record = attendance.find(a => a.studentId === student.id && a.date === dateStr);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                          {student.joiningDate && (
                            <span className="text-muted-foreground text-sm font-normal ml-2">
                              ({format(new Date(student.joiningDate), "MMM yyyy")})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {record ? (
                            record.status === 'present' ? (
                              <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm font-medium">
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm font-medium">
                                <XCircle className="mr-1 h-4 w-4" /> Absent
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Not Marked</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-student" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-4">
              <CardTitle>History by Student</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedStudentId} onValueChange={(val) => val && setSelectedStudentId(val)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger render={<Button variant="outline" className="w-[160px] justify-start text-left font-normal" />}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedMonth, "MMMM yyyy")}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 12 }, (_, i) => {
                          const d = new Date(new Date().getFullYear(), i, 1);
                          return (
                            <Button
                              key={i}
                              variant={selectedMonth.getMonth() === i ? "default" : "outline"}
                              onClick={() => setSelectedMonth(d)}
                              className="text-sm"
                            >
                              {format(d, "MMM")}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedStudentId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a student to view their history.
                </div>
              ) : studentMonthlyRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found for this student in {format(selectedMonth, "MMMM yyyy")}.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Monthly summary for student */}
                  <div className="grid grid-cols-3 gap-4 border rounded-lg p-4 bg-muted/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Present</p>
                      <p className="text-2xl font-bold text-green-600">
                        {studentMonthlyRecords.filter(r => r.status === 'present').length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Absent</p>
                      <p className="text-2xl font-bold text-red-600">
                        {studentMonthlyRecords.filter(r => r.status === 'absent').length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Marked</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {studentMonthlyRecords.length}
                      </p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentMonthlyRecords.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {format(parseISO(record.date), "EEEE, MMMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            {record.status === 'present' ? (
                              <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm font-medium">
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm font-medium">
                                <XCircle className="mr-1 h-4 w-4" /> Absent
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
