import React, { createContext, useContext, useState, useEffect } from 'react';
import { AttendanceRecord, LeaveRequest } from '../types';
import { format } from 'date-fns';

interface DataContextType {
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  clockIn: (userId: string) => void;
  clockOut: (userId: string) => void;
  applyLeave: (leaveRequest: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  approveLeave: (leaveId: string, approvedBy: string) => void;
  rejectLeave: (leaveId: string, approvedBy: string) => void;
  getTodaysAttendance: (userId: string) => AttendanceRecord | null;
  getWeeklyHours: (userId: string) => number;
  getMonthlyAttendance: (userId: string, month: string) => AttendanceRecord[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data for demonstration
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    userId: '2',
    clockIn: '2024-01-20T09:00:00',
    clockOut: '2024-01-20T17:30:00',
    date: '2024-01-20',
    totalHours: 8.5,
    status: 'present'
  },
  {
    id: '2',
    userId: '3',
    clockIn: '2024-01-20T09:15:00',
    clockOut: '2024-01-20T17:45:00',
    date: '2024-01-20',
    totalHours: 8.5,
    status: 'late'
  }
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    type: 'casual',
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    reason: 'Personal work',
    status: 'pending',
    appliedDate: '2024-01-20'
  },
  {
    id: '2',
    userId: '3',
    type: 'sick',
    startDate: '2024-01-22',
    endDate: '2024-01-23',
    reason: 'Flu symptoms',
    status: 'approved',
    appliedDate: '2024-01-19',
    approvedBy: '1',
    approvedDate: '2024-01-20'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    // Load data from localStorage or use mock data
    const savedAttendance = localStorage.getItem('attendanceRecords');
    const savedLeaves = localStorage.getItem('leaveRequests');

    if (savedAttendance) {
      setAttendanceRecords(JSON.parse(savedAttendance));
    } else {
      setAttendanceRecords(mockAttendanceRecords);
    }

    if (savedLeaves) {
      setLeaveRequests(JSON.parse(savedLeaves));
    } else {
      setLeaveRequests(mockLeaveRequests);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  const clockIn = (userId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingRecord = attendanceRecords.find(record => 
      record.userId === userId && record.date === today
    );

    if (existingRecord && existingRecord.clockIn) {
      return; // Already clocked in
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId,
      clockIn: new Date().toISOString(),
      date: today,
      status: 'present'
    };

    setAttendanceRecords(prev => [...prev.filter(r => !(r.userId === userId && r.date === today)), newRecord]);
  };

  const clockOut = (userId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingRecord = attendanceRecords.find(record => 
      record.userId === userId && record.date === today
    );

    if (!existingRecord || !existingRecord.clockIn || existingRecord.clockOut) {
      return; // Not clocked in or already clocked out
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(existingRecord.clockIn);
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const updatedRecord: AttendanceRecord = {
      ...existingRecord,
      clockOut: clockOutTime.toISOString(),
      totalHours: Math.round(totalHours * 100) / 100
    };

    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === existingRecord.id ? updatedRecord : record
      )
    );
  };

  const applyLeave = (leaveRequest: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newLeaveRequest: LeaveRequest = {
      ...leaveRequest,
      id: Date.now().toString(),
      appliedDate: new Date().toISOString(),
      status: 'pending'
    };

    setLeaveRequests(prev => [...prev, newLeaveRequest]);
  };

  const approveLeave = (leaveId: string, approvedBy: string) => {
    setLeaveRequests(prev => 
      prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'approved', approvedBy, approvedDate: new Date().toISOString() }
          : leave
      )
    );
  };

  const rejectLeave = (leaveId: string, approvedBy: string) => {
    setLeaveRequests(prev => 
      prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'rejected', approvedBy, approvedDate: new Date().toISOString() }
          : leave
      )
    );
  };

  const getTodaysAttendance = (userId: string): AttendanceRecord | null => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return attendanceRecords.find(record => 
      record.userId === userId && record.date === today
    ) || null;
  };

  const getWeeklyHours = (userId: string): number => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weeklyRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return record.userId === userId && recordDate >= startOfWeek && recordDate <= today;
    });

    return weeklyRecords.reduce((total, record) => total + (record.totalHours || 0), 0);
  };

  const getMonthlyAttendance = (userId: string, month: string): AttendanceRecord[] => {
    return attendanceRecords.filter(record => 
      record.userId === userId && record.date.startsWith(month)
    );
  };

  return (
    <DataContext.Provider value={{
      attendanceRecords,
      leaveRequests,
      clockIn,
      clockOut,
      applyLeave,
      approveLeave,
      rejectLeave,
      getTodaysAttendance,
      getWeeklyHours,
      getMonthlyAttendance
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};