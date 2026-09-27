import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { UsherProfile, AttendanceRecord } from '../types';
import { verifyAndRecordAttendance } from '../lib/supabase';

interface ScannerScreenProps {
  currentLeaderId: string;
  activeServiceId: string;
  serviceTitle: string;
}

export default function ScannerScreen({
  currentLeaderId,
  activeServiceId,
  serviceTitle,
}: ScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Scanned result modal state
  const [scanResult, setScanResult] = useState<{
    member: UsherProfile;
    isDuplicate: boolean;
    timestamp: string;
  } | null>(null);

  // Play audio chime on success
  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3' } // Crisp chime
      );
      await sound.playAsync();
    } catch (e) {
      console.log('Audio playback error', e);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate(100);

      // Verify and record in database
      const result = await verifyAndRecordAttendance({
        qrIdentifier: data.trim(),
        serviceId: activeServiceId,
        scannedById: currentLeaderId,
      });

      await playSuccessSound();

      setScanResult({
        member: result.member,
        isDuplicate: result.alreadyRecorded,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert(error.message || 'QR Scan Failed');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const closeResultModal = () => {
    setScanResult(null);
    setScanned(false);
  };

  if (!permission) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Camera permission is required to scan QR codes</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerSubtitle}>ACTIVE SUNDAY SERVICE</Text>
        <Text style={styles.headerTitle}>{serviceTitle}</Text>
      </View>

      {/* Camera Scanner View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={isTorchOn}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Target Reticle Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanTarget}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Text style={styles.scanPrompt}>Align Usher QR code inside the frame</Text>
        </View>

        {/* Torch & Reset Controls */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, isTorchOn && styles.controlBtnActive]}
            onPress={() => setIsTorchOn(!isTorchOn)}
          >
            <Text style={styles.controlBtnText}>{isTorchOn ? '🔦 Flash On' : '🔦 Flash Off'}</Text>
          </TouchableOpacity>

          {scanned && !scanResult && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
              <Text style={styles.btnText}>Tap to Scan Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Success / Verification Modal Card */}
      <Modal visible={!!scanResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <View style={[styles.statusBadge, scanResult?.isDuplicate ? styles.badgeWarning : styles.badgeSuccess]}>
              <Text style={styles.statusBadgeText}>
                {scanResult?.isDuplicate ? 'ALREADY RECORDED' : 'PRESENT & VERIFIED'}
              </Text>
            </View>

            <Image
              source={{ uri: scanResult?.member.avatar_url || 'https://via.placeholder.com/100' }}
              style={styles.memberAvatar}
            />

            <Text style={styles.memberName}>{scanResult?.member.full_name}</Text>
            <Text style={styles.memberRole}>
              {scanResult?.member.role === 'primary_leader' && '⭐ Primary Leader'}
              {scanResult?.member.role === 'assistant_leader' && '🎖️ Assistant Leader'}
              {scanResult?.member.role === 'regular_member' && '👤 Usher Member'}
            </Text>
            <Text style={styles.memberTeam}>{scanResult?.member.team_name}</Text>

            <View style={styles.timeInfoBox}>
              <Text style={styles.timeInfoLabel}>Check-in Time</Text>
              <Text style={styles.timeInfoVal}>{scanResult?.timestamp}</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={closeResultModal}>
              <Text style={styles.doneBtnText}>Scan Next Usher</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0f172a' },
  permissionText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  headerBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 14,
    borderRadius: 16,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSubtitle: { color: '#38bdf8', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTarget: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#38bdf8',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  scanPrompt: { color: '#f1f5f9', fontSize: 13, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  controlRow: { position: 'absolute', bottom: 50, flexDirection: 'row', gap: 12 },
  controlBtn: { backgroundColor: 'rgba(30, 41, 59, 0.8)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  controlBtnActive: { backgroundColor: '#eab308' },
  controlBtnText: { color: '#fff', fontWeight: '600' },
  rescanBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  primaryBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultCard: { width: '100%', maxWidth: 340, backgroundColor: '#1e293b', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  badgeSuccess: { backgroundColor: '#059669' },
  badgeWarning: { backgroundColor: '#d97706' },
  statusBadgeText: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  memberAvatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: '#38bdf8', marginBottom: 12 },
  memberName: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center' },
  memberRole: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  memberTeam: { fontSize: 13, color: '#cbd5e1', marginTop: 2, fontStyle: 'italic' },
  timeInfoBox: { width: '100%', backgroundColor: '#0f172a', padding: 12, borderRadius: 12, marginTop: 16, alignItems: 'center' },
  timeInfoLabel: { color: '#64748b', fontSize: 12 },
  timeInfoVal: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  doneBtn: { width: '100%', backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  doneBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});
