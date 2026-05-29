"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Student, AttendanceRecord } from "@/lib/types";
import { toast } from "sonner";

interface AppContextType {
  students: Student[];
  attendance: AttendanceRecord[];
  addStudent: (name: string, joiningDate?: string) => void;
  updateStudent: (id: string, name: string, joiningDate?: string) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (studentId: string, date: string, status: 'present' | 'absent') => void;
  deleteAttendanceRecord: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync data to Cloud (Vercel Redis)
  const syncToCloud = async (newStudents: Student[], newAttendance: AttendanceRecord[]) => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: newStudents, attendance: newAttendance }),
      });
    } catch (e) {
      console.error("Failed to sync to cloud", e);
    }
  };

  // Load from Cloud, fallback to localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/sync');
        const data = await response.json();
        
        let loadedStudents = [];
        let loadedAttendance = [];

        // Check if Cloud has data
        if (data && !data.error && data.students && data.students.length > 0) {
          loadedStudents = data.students;
          loadedAttendance = data.attendance || [];
          console.log("Loaded from Cloud DB");
        } else {
          // Fallback to local storage
          console.log("Falling back to local storage");
          const savedStudents = localStorage.getItem("students");
          const savedAttendance = localStorage.getItem("attendance");

          if (savedStudents && JSON.parse(savedStudents).length > 0) {
            loadedStudents = JSON.parse(savedStudents);
          } else {
            // Initial Sample Data
            loadedStudents = [
              { id: "1", name: "Alice Smith", createdAt: new Date().toISOString() },
              { id: "2", name: "Bob Jones", createdAt: new Date().toISOString() },
            ];
          }

          if (savedAttendance && JSON.parse(savedAttendance).length > 0) {
            loadedAttendance = JSON.parse(savedAttendance);
          } else {
            const today = new Date().toISOString().split('T')[0];
            loadedAttendance = [
              { id: "101", studentId: "1", date: today, status: "present", timestamp: new Date().toISOString() },
            ];
          }
        }

        setStudents(loadedStudents);
        setAttendance(loadedAttendance);
        localStorage.setItem("students", JSON.stringify(loadedStudents));
        localStorage.setItem("attendance", JSON.stringify(loadedAttendance));

      } catch (e) {
        console.error("Initialization error", e);
      } finally {
        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  const addStudent = (name: string, joiningDate?: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: name.trim(),
      joiningDate,
      createdAt: new Date().toISOString(),
    };
    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    localStorage.setItem("students", JSON.stringify(newStudents));
    syncToCloud(newStudents, attendance);
    toast.success("Student added successfully");
  };

  const updateStudent = (id: string, name: string, joiningDate?: string) => {
    const newStudents = students.map((student) =>
      student.id === id ? { ...student, name: name.trim(), joiningDate } : student
    );
    setStudents(newStudents);
    localStorage.setItem("students", JSON.stringify(newStudents));
    syncToCloud(newStudents, attendance);
    toast.success("Student updated successfully");
  };

  const deleteStudent = (id: string) => {
    const newStudents = students.filter((student) => student.id !== id);
    const newAttendance = attendance.filter((record) => record.studentId !== id);
    
    setStudents(newStudents);
    setAttendance(newAttendance);
    
    localStorage.setItem("students", JSON.stringify(newStudents));
    localStorage.setItem("attendance", JSON.stringify(newAttendance));
    
    syncToCloud(newStudents, newAttendance);
    toast.success("Student deleted successfully");
  };

  const markAttendance = (studentId: string, date: string, status: 'present' | 'absent') => {
    const existingRecordIndex = attendance.findIndex(
      (r) => r.studentId === studentId && r.date === date
    );

    let newAttendance = [...attendance];
    
    if (existingRecordIndex >= 0) {
      newAttendance[existingRecordIndex] = {
        ...newAttendance[existingRecordIndex],
        status,
        timestamp: new Date().toISOString(),
      };
    } else {
      newAttendance.push({
        id: crypto.randomUUID(),
        studentId,
        date,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    setAttendance(newAttendance);
    localStorage.setItem("attendance", JSON.stringify(newAttendance));
    syncToCloud(students, newAttendance);
  };

  const deleteAttendanceRecord = (id: string) => {
    const newAttendance = attendance.filter((record) => record.id !== id);
    setAttendance(newAttendance);
    localStorage.setItem("attendance", JSON.stringify(newAttendance));
    syncToCloud(students, newAttendance);
  };

  if (!isInitialized) return null;

  return (
    <AppContext.Provider
      value={{
        students,
        attendance,
        addStudent,
        updateStudent,
        deleteStudent,
        markAttendance,
        deleteAttendanceRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
