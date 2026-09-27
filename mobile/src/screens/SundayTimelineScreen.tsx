import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SundayService, AttendanceRecord } from '../types';

interface SundayTimelineProps {
  services: SundayService[];
  attendanceLogs: AttendanceRecord[];
}

export default function SundayTimelineScreen({ services, attendanceLogs }: SundayTimelineProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services.find((s) => s.is_active)?.id || services[0]?.id || ''
  );

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const serviceLogs = attendanceLogs.filter((l) => l.service_id === selectedServiceId);

  return (
    <View style={styles.container}>
      {/* Timeline Header */}
      <Text style={styles.title}>Sunday Service Timeline</Text>
      <Text style={styles.subtitle}>Select a Sunday to inspect check-in records</Text>

      {/* Horizontal Sunday Selector */}
      <FlatList
        data={services}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item: SundayService) => item.id}
        contentContainerStyle={styles.timelineList}
        renderItem={({ item }: { item: SundayService }) => {
          const isSelected = item.id === selectedServiceId;
          return (
            <TouchableOpacity
              style={[
                styles.sundayCard,
                isSelected && styles.sundayCardSelected,
                item.is_active && styles.activeIndicator,
              ]}
              onPress={() => setSelectedServiceId(item.id)}
            >
              <Text style={[styles.sundayDate, isSelected && styles.textWhite]}>
                {new Date(item.service_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={[styles.sundayTitle, isSelected && styles.textHighlight]}>
                {item.service_title}
              </Text>
              {item.is_active && (
                <View style={styles.liveTag}>
                  <Text style={styles.liveText}>● TODAY</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Selected Sunday Stats */}
      {selectedService && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{serviceLogs.length}</Text>
            <Text style={styles.statLabel}>Present Ushers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#10b981' }]}>
              {serviceLogs.filter((l) => l.status === 'present').length}
            </Text>
            <Text style={styles.statLabel}>On-Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#f59e0b' }]}>
              {serviceLogs.filter((l) => l.status === 'late').length}
            </Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>
      )}

      {/* Attendance List */}
      <FlatList
        data={serviceLogs}
        keyExtractor={(item: AttendanceRecord) => item.id}
        contentContainerStyle={styles.logsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No ushers logged yet for this Sunday</Text>
          </View>
        }
        renderItem={({ item }: { item: AttendanceRecord }) => (
          <View style={styles.logRow}>
            <View>
              <Text style={styles.logMemberName}>{item.member?.full_name || 'Usher Member'}</Text>
              <Text style={styles.logTeam}>{item.member?.team_name || 'General Team'}</Text>
            </View>
            <View style={styles.logRight}>
              <View
                style={[
                  styles.statusPill,
                  item.status === 'present' ? styles.pillPresent : styles.pillLate,
                ]}
              >
                <Text style={styles.statusPillText}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.logTime}>
                {new Date(item.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginTop: 10 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2, marginBottom: 16 },
  timelineList: { paddingBottom: 16, gap: 10 },
  sundayCard: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 16,
    width: 140,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sundayCardSelected: { borderColor: '#38bdf8', backgroundColor: '#1e3a5f' },
  activeIndicator: { borderColor: '#10b981' },
  sundayDate: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  sundayTitle: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  textWhite: { color: '#ffffff' },
  textHighlight: { color: '#38bdf8' },
  liveTag: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 6 },
  liveText: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  statBox: { flex: 1, backgroundColor: '#1e293b', padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  logsList: { gap: 10, paddingBottom: 20 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  logMemberName: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold' },
  logTeam: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  logRight: { alignItems: 'flex-end' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pillPresent: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  pillLate: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  statusPillText: { color: '#f8fafc', fontSize: 11, fontWeight: 'bold' },
  logTime: { color: '#64748b', fontSize: 11, marginTop: 4 },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
});
