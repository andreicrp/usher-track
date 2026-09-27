import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { UsherProfile } from '../types';

interface MemberBadgeScreenProps {
  member: UsherProfile;
}

export default function MemberBadgeScreen({ member }: MemberBadgeScreenProps) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Usher QR ID Badge for ${member.full_name} (${member.role}). Identifier: ${member.qr_identifier}`,
      });
    } catch (error) {
      console.log('Share error', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'primary_leader':
        return '⭐ PRIMARY LEADER';
      case 'assistant_leader':
        return '🎖️ ASSISTANT LEADER';
      default:
        return '👤 REGULAR USHER';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'primary_leader':
        return styles.badgePrimary;
      case 'assistant_leader':
        return styles.badgeAssistant;
      default:
        return styles.badgeRegular;
    }
  };

  return (
    <View style={styles.container}>
      {/* Digital ID Card Container */}
      <View style={styles.idCard}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.ministryTitle}>USHER MINISTRY</Text>
          <Text style={styles.cardSubtitle}>OFFICIAL DIGITAL BADGE</Text>
        </View>

        {/* Member Avatar & Role */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: member.avatar_url || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <Text style={styles.memberName}>{member.full_name}</Text>
          <View style={[styles.roleTag, getRoleBadgeStyle(member.role)]}>
            <Text style={styles.roleTagText}>{getRoleLabel(member.role)}</Text>
          </View>
          <Text style={styles.teamName}>{member.team_name}</Text>
          {member.assigned_leader_name && (
            <Text style={styles.leaderText}>Lead: {member.assigned_leader_name}</Text>
          )}
        </View>

        {/* High-Contrast QR Code */}
        <View style={styles.qrWrapper}>
          <QRCode
            value={member.qr_identifier}
            size={180}
            backgroundColor="#ffffff"
            color="#0f172a"
          />
        </View>

        <Text style={styles.qrCodeText}>{member.qr_identifier}</Text>
        <Text style={styles.qrInstruction}>Present this QR code to the scanner on Sunday</Text>
      </View>

      {/* Share / Save Button */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>📤 Share / Save Badge</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center', padding: 20 },
  idCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155', width: '100%', paddingBottom: 12, marginBottom: 16 },
  ministryTitle: { color: '#38bdf8', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 },
  cardSubtitle: { color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  profileSection: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#38bdf8', marginBottom: 8 },
  memberName: { color: '#ffffff', fontSize: 19, fontWeight: 'bold', textAlign: 'center' },
  roleTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
  badgePrimary: { backgroundColor: '#7c3aed' },
  badgeAssistant: { backgroundColor: '#2563eb' },
  badgeRegular: { backgroundColor: '#334155' },
  roleTagText: { color: '#ffffff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  teamName: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  leaderText: { color: '#64748b', fontSize: 12, marginTop: 2 },
  qrWrapper: { backgroundColor: '#ffffff', padding: 14, borderRadius: 16, marginTop: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  qrCodeText: { color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginTop: 10, letterSpacing: 1 },
  qrInstruction: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 6 },
  shareBtn: { marginTop: 20, backgroundColor: '#334155', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  shareBtnText: { color: '#f8fafc', fontWeight: '600' },
});
