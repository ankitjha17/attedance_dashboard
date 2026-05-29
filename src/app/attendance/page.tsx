"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const { students, attendance, markAttendance } = useAppContext();
  const [date, setDate] = useState<Date>(new Date());
  
  const dateString = format(date, "yyyy-MM-dd");
  
  // Filter attendance records for selected date
  const recordsForDate = attendance.filter(a => a.date === dateString);

  const getStudentStatus = (studentId: string) => {
    const record = recordsForDate.find(r => r.studentId === studentId);
    return record?.status; // 'present' | 'absent' | undefined
  };

  const markAll = (status: 'present' | 'absent') => {
    students.forEach(student => {
      markAttendance(student.id, dateString, status);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mark Attendance</h2>
          <p className="text-muted-foreground mt-2">
            Record student attendance for the selected date.
          </p>
        </div>

        <Popover>
          <PopoverTrigger 
            render={
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              disabled={(d) => d > new Date()} // Prevent future dates
            />
          </PopoverContent>
        </Popover>
      </div>

      {students.length === 0 ? (
        <div className="text-center p-12 rounded-lg border border-dashed">
          <h3 className="text-lg font-semibold">No students found</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            You need to add students before marking attendance.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={() => markAll('present')}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark All Present
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => markAll('absent')}>
              <XCircle className="mr-2 h-4 w-4" /> Mark All Absent
            </Button>
          </div>
          
          <div className="rounded-md border bg-white dark:bg-gray-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center w-[120px]">Present</TableHead>
                  <TableHead className="text-center w-[120px]">Absent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const status = getStudentStatus(student.id);
                  
                  return (
                    <TableRow key={student.id} className={
                      status === 'present' ? 'bg-green-50/50 dark:bg-green-900/10' : 
                      status === 'absent' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                    }>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant={status === 'present' ? "default" : "outline"}
                          size="sm"
                          className={cn("w-full", status === 'present' && "bg-green-600 hover:bg-green-700 text-white")}
                          onClick={() => markAttendance(student.id, dateString, 'present')}
                        >
                          <CheckCircle2 className={cn("h-4 w-4", status === 'present' ? "mr-2" : "")} />
                          {status === 'present' && "Present"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant={status === 'absent' ? "default" : "outline"}
                          size="sm"
                          className={cn("w-full", status === 'absent' && "bg-red-600 hover:bg-red-700 text-white")}
                          onClick={() => markAttendance(student.id, dateString, 'absent')}
                        >
                          <XCircle className={cn("h-4 w-4", status === 'absent' ? "mr-2" : "")} />
                          {status === 'absent' && "Absent"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
