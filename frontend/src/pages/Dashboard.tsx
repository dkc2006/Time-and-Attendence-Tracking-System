import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Clock, PlayCircle, PauseCircle, Calendar, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    getTodaysAttendance, 
    getWeeklyHours, 
    clockIn, 
    clockOut, 
    leaveRequests, 
    attendanceRecords 
  } = useData();

  const todaysAttendance = getTodaysAttendance(user?.id || '');
  const weeklyHours = getWeeklyHours(user?.id || '');
  const isAdmin = user?.role === 'admin';

  const handleClockIn = () => {
    if (user?.id) {
      clockIn(user.id);
    }
  };

  const handleClockOut = () => {
    if (user?.id) {
      clockOut(user.id);
    }
  };

  const canClockIn = !todaysAttendance?.clockIn;
  const canClockOut = todaysAttendance?.clockIn && !todaysAttendance?.clockOut;

  // Admin stats
  const totalEmployees = isAdmin ? 3 : 0; // Mock data
  const pendingLeaves = isAdmin ? leaveRequests.filter(leave => leave.status === 'pending').length : 0;
  const todayAttendance = isAdmin ? attendanceRecords.filter(record => 
    record.date === format(new Date(), 'yyyy-MM-dd')
  ).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!isAdmin && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Hours</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {todaysAttendance?.totalHours?.toFixed(1) || '0.0'}h
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Weekly Hours</dt>
                      <dd className="text-lg font-medium text-gray-900">{weeklyHours.toFixed(1)}h</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                      <dd className="text-lg font-medium text-gray-900">{totalEmployees}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Leaves</dt>
                      <dd className="text-lg font-medium text-gray-900">{pendingLeaves}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Attendance</dt>
                      <dd className="text-lg font-medium text-gray-900">{todayAttendance}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Clock In/Out Section - Only for employees */}
      {!isAdmin && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Time Tracking</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleClockIn}
                disabled={!canClockIn}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  canClockIn
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <PlayCircle className="h-5 w-5" />
                <span>Clock In</span>
              </button>

              <button
                onClick={handleClockOut}
                disabled={!canClockOut}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  canClockOut
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <PauseCircle className="h-5 w-5" />
                <span>Clock Out</span>
              </button>
            </div>

            {todaysAttendance && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Activity</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {todaysAttendance.clockIn && (
                    <div>Clock In: {format(new Date(todaysAttendance.clockIn), 'h:mm a')}</div>
                  )}
                  {todaysAttendance.clockOut && (
                    <div>Clock Out: {format(new Date(todaysAttendance.clockOut), 'h:mm a')}</div>
                  )}
                  {todaysAttendance.totalHours && (
                    <div className="font-medium">Total Hours: {todaysAttendance.totalHours.toFixed(1)}h</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isAdmin ? 'Recent Activity' : 'Your Recent Activity'}
          </h3>
        </div>
        <div className="p-6">
          {isAdmin ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between py-2">
                  <span>John Doe clocked in at 9:00 AM</span>
                  <span className="text-gray-400">Today</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Jane Smith applied for leave</span>
                  <span className="text-gray-400">Yesterday</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Monthly report generated</span>
                  <span className="text-gray-400">2 days ago</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {todaysAttendance?.clockIn ? (
                  <div>You clocked in at {format(new Date(todaysAttendance.clockIn), 'h:mm a')} today</div>
                ) : (
                  <div>You haven't clocked in today</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;