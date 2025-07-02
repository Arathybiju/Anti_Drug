import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, TriangleAlert as AlertTriangle, Users, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  
  // Initialize with zero values - these will be updated as users submit reports
  const [stats, setStats] = useState([
    { label: 'Reports Submitted', value: '0', icon: Shield },
    { label: 'Incidents Recorded', value: '0', icon: AlertTriangle },
    { label: 'Community Members', value: '0', icon: Users },
  ]);

  // This would typically fetch from your backend/database
  useEffect(() => {
    // Simulate fetching real-time stats from server
    // In production, this would be an API call to your backend
    const fetchCommunityStats = async () => {
      try {
        // Example: const response = await fetch('/api/community-stats');
        // const data = await response.json();
        // setStats(data);
        
        // For now, keeping initial zero values
        // Stats will update as users submit reports through your backend system
      } catch (error) {
        console.error('Error fetching community stats:', error);
      }
    };

    fetchCommunityStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community Safety</Text>
          <Text style={styles.headerSubtitle}>Together we make our community safer</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#1E40AF', '#3B82F6']}
            style={styles.heroGradient}
          >
            <Shield size={48} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Anonymous Reporting</Text>
            <Text style={styles.heroSubtitle}>
              Report incidents safely and anonymously to help keep our community secure
            </Text>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => router.push('/report')}
            >
              <Text style={styles.reportButtonText}>Make a Report</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <Text style={styles.statsDescription}>
            Real-time statistics updated as community members submit reports
          </Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <stat.icon size={24} color="#1E40AF" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <AlertTriangle size={20} color="#F97316" />
              <Text style={styles.tipTitle}>Reporting Guidelines</Text>
            </View>
            <Text style={styles.tipText}>
              • Only report what you observe directly{'\n'}
              • Include location details when possible{'\n'}
              • Never confront suspicious individuals{'\n'}
              • Your identity remains completely anonymous{'\n'}
              • Reports are sent to local authorities for review
            </Text>
          </View>
        </View>

        {/* Report Destination Info */}
        <View style={styles.destinationSection}>
          <Text style={styles.sectionTitle}>Where Your Reports Go</Text>
          <View style={styles.destinationCard}>
            <MapPin size={24} color="#059669" />
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationTitle}>Local Authorities</Text>
              <Text style={styles.destinationText}>
                All reports are securely transmitted to the appropriate local law enforcement agencies and community safety departments for review and action.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  heroSection: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  reportButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  statsDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  destinationSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  destinationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
});