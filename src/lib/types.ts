export type Student = {
  id: string;
  name: string;
  createdAt: string;
};

export type AttendanceStatus = 'present' | 'absent';

export type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
  timestamp: string; // ISO string
};

export type DashboardStats = {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
};
