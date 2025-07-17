import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { FileText, Download, Calendar, Users, Clock, TrendingUp, BarChart3, PieChart } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { attendanceRecords, leaveRequests } = useData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reportType, setReportType] = useState<'attendance' | 'leave' | 'summary'>('attendance');

  // Mock employee data
  const employees = [
    { id: '1', name: 'Admin User', department: 'HR' },
    { id: '2', name: 'John Doe', department: 'Engineering' },
    { id: '3', name: 'Jane Smith', department: 'Marketing' },
    { id: '4', name: 'Mike Johnson', department: 'Sales' },
    { id: '5', name: 'Sarah Wilson', department: 'Finance' }
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const getMonthlyStats = () => {
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));
    const workingDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
      .filter(day => day.getDay() !== 0 && day.getDay() !== 6).length;

    let filteredRecords = attendanceRecords.filter(record => 
      record.date.startsWith(selectedMonth)
    );

    if (selectedEmployee) {
      filteredRecords = filteredRecords.filter(record => record.userId === selectedEmployee);
    }

    const totalHours = filteredRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const presentDays = filteredRecords.length;
    const avgHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0;

    return {
      workingDays,
      presentDays,
      totalHours,
      avgHoursPerDay,
      attendanceRate: workingDays > 0 ? (presentDays / workingDays) * 100 : 0
    };
  };

  const getLeaveStats = () => {
    let filteredLeaves = leaveRequests.filter(leave => 
      leave.startDate.startsWith(selectedMonth) || leave.endDate.startsWith(selectedMonth)
    );

    if (selectedEmployee) {
      filteredLeaves = filteredLeaves.filter(leave => leave.userId === selectedEmployee);
    }

    const totalLeaves = filteredLeaves.length;
    const approvedLeaves = filteredLeaves.filter(leave => leave.status === 'approved').length;
    const pendingLeaves = filteredLeaves.filter(leave => leave.status === 'pending').length;
    const rejectedLeaves = filteredLeaves.filter(leave => leave.status === 'rejected').length;

    return {
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves
    };
  };

  const monthlyStats = getMonthlyStats();
  const leaveStats = getLeaveStats();

  const handleExportCSV = () => {
    // Mock CSV export functionality
    const csvData = attendanceRecords
      .filter(record => record.date.startsWith(selectedMonth))
      .map(record => {
        const employee = employees.find(emp => emp.id === record.userId);
        return {
          employee: employee?.name || 'Unknown',
          date: record.date,
          clockIn: record.clockIn ? format(new Date(record.clockIn), 'HH:mm') : '--',
          clockOut: record.clockOut ? format(new Date(record.clockOut), 'HH:mm') : '--',
          totalHours: record.totalHours || 0,
          status: record.status
        };
      });

    console.log('CSV Export Data:', csvData);
    alert('CSV export functionality would be implemented here');
  };

  const handleExportPDF = () => {
    // Mock PDF export functionality
    alert('PDF export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and export attendance reports
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Report Filters</span>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Report Type:</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="attendance">Attendance</option>
                  <option value="leave">Leave</option>
                  <option value="summary">Summary</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Employee:</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                  <dd className="text-lg font-medium text-gray-900">{monthlyStats.totalHours.toFixed(1)}h</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Present Days</dt>
                  <dd className="text-lg font-medium text-gray-900">{monthlyStats.presentDays}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Hours/Day</dt>
                  <dd className="text-lg font-medium text-gray-900">{monthlyStats.avgHoursPerDay.toFixed(1)}h</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{monthlyStats.attendanceRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'attendance' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Report</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords
                  .filter(record => record.date.startsWith(selectedMonth))
                  .filter(record => !selectedEmployee || record.userId === selectedEmployee)
                  .map((record) => {
                    const employee = employees.find(emp => emp.id === record.userId);
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clockIn ? format(new Date(record.clockIn), 'h:mm a') : '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clockOut ? format(new Date(record.clockOut), 'h:mm a') : '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'leave' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Leave Report</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{leaveStats.totalLeaves}</div>
                <div className="text-sm text-blue-600">Total Leaves</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{leaveStats.approvedLeaves}</div>
                <div className="text-sm text-green-600">Approved</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{leaveStats.pendingLeaves}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{leaveStats.rejectedLeaves}</div>
                <div className="text-sm text-red-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'summary' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monthly Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Attendance Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Working Days</span>
                    <span className="text-sm font-medium">{monthlyStats.workingDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Present Days</span>
                    <span className="text-sm font-medium">{monthlyStats.presentDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Hours</span>
                    <span className="text-sm font-medium">{monthlyStats.totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className="text-sm font-medium">{monthlyStats.attendanceRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Leave Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Leaves</span>
                    <span className="text-sm font-medium">{leaveStats.totalLeaves}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="text-sm font-medium">{leaveStats.approvedLeaves}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-medium">{leaveStats.pendingLeaves}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="text-sm font-medium">{leaveStats.rejectedLeaves}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;