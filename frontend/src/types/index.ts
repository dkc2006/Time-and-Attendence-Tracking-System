export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  department?: string;
  joinDate: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  clockIn?: string;
  clockOut?: string;
  date: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'casual' | 'annual' | 'maternity' | 'emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}