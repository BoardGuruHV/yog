import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from 'date-fns';
import { PracticeLog } from '@/types';

interface StreakCalendarProps {
  practiceLogs: PracticeLog[];
  currentMonth?: Date;
}

export function StreakCalendar({
  practiceLogs,
  currentMonth = new Date(),
}: StreakCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get padding for the first week
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array(startDayOfWeek).fill(null);

  // Create a set of practice dates for quick lookup
  const practiceDates = new Set(
    practiceLogs.map((log) => format(new Date(log.completedAt), 'yyyy-MM-dd'))
  );

  const isPracticeDay = (date: Date) => {
    return practiceDates.has(format(date, 'yyyy-MM-dd'));
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekDays}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {/* Padding for first week */}
        {paddingDays.map((_, index) => (
          <View key={`pad-${index}`} style={styles.dayCell} />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const practiced = isPracticeDay(day);
          const today = isToday(day);

          return (
            <View key={day.toISOString()} style={styles.dayCell}>
              <View
                style={[
                  styles.dayCircle,
                  practiced && styles.practicedDay,
                  today && styles.todayDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    practiced && styles.practicedDayText,
                    today && styles.todayDayText,
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.practicedDay]} />
          <Text style={styles.legendText}>Practiced</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.todayDay]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: '100%',
    maxWidth: 36,
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#64748b',
  },
  practicedDay: {
    backgroundColor: '#dcfce7',
  },
  practicedDayText: {
    color: '#166534',
    fontWeight: '600',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  todayDayText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default StreakCalendar;
