import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, FileText } from 'lucide-react-native';

export default function HistoryScreen() {
  // Empty state - reports will be added here after users submit them
  const reports: any[] = [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report History</Text>
        <Text style={styles.headerSubtitle}>
          Track your submitted reports and their status
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <FileText size={64} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyDescription}>
            Your submitted reports will appear here once you start reporting incidents. Each report will show its status and tracking information.
          </Text>
          <View style={styles.emptyFeatures}>
            <View style={styles.featureItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.featureText}>Track submission status</Text>
            </View>
            <View style={styles.featureItem}>
              <FileText size={16} color="#6B7280" />
              <Text style={styles.featureText}>View report details</Text>
            </View>
          </View>
        </View>

        {/* Future Implementation Note */}
        <View style={styles.implementationNote}>
          <Text style={styles.noteTitle}>Coming Soon</Text>
          <Text style={styles.noteText}>
            Once you submit your first report, you'll be able to:
            {'\n'}• View report status (Submitted, Under Review, Resolved)
            {'\n'}• See timestamps and locations
            {'\n'}• Track community impact statistics
            {'\n'}• Access report reference numbers
          </Text>
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    backgroundColor: '#F3F4F6',
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emptyFeatures: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  implementationNote: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
});