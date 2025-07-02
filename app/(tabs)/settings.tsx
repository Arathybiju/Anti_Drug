import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Shield, Bell, MapPin, Eye, Phone, ExternalLink, ChevronRight, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Community Safety App Privacy Policy\n\n' +
      '1. Data Collection: We collect minimal data necessary for incident reporting.\n\n' +
      '2. Anonymity: All reports are processed anonymously unless you provide contact information.\n\n' +
      '3. Location Data: GPS coordinates are used only for incident location and are not linked to your identity.\n\n' +
      '4. Data Storage: Reports are securely transmitted to authorities and stored with encryption.\n\n' +
      '5. Third Parties: We do not share personal data with third parties except law enforcement when required.\n\n' +
      '6. Your Rights: You can request data deletion by contacting support.',
      [{ text: 'I Understand', style: 'default' }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Community Safety App Terms of Service\n\n' +
      '1. Accurate Reporting: Users must report only truthful, observed incidents.\n\n' +
      '2. Prohibited Use: Do not use this app for false reports, harassment, or illegal activities.\n\n' +
      '3. Emergency Situations: For immediate emergencies, call emergency services directly.\n\n' +
      '4. Liability: The app supplements but does not replace official emergency services.\n\n' +
      '5. Account Suspension: Misuse may result in app access restrictions.\n\n' +
      '6. Updates: Terms may be updated periodically with user notification.',
      [{ text: 'I Agree', style: 'default' }]
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      Alert.alert(
        'Notifications Enabled',
        'You will receive updates about your report status and important community safety alerts.'
      );
    } else {
      Alert.alert(
        'Notifications Disabled',
        'You will not receive push notifications. You can still check report status in the History section.'
      );
    }
  };

  const handleLocationToggle = (value: boolean) => {
    setLocationEnabled(value);
    if (value) {
      Alert.alert(
        'Location Services Enabled',
        'GPS coordinates will be included in your reports to help authorities locate incidents accurately.'
      );
    } else {
      Alert.alert(
        'Location Services Disabled',
        'Reports will be submitted without GPS coordinates. You can still manually describe the location.'
      );
    }
  };

  const handleAnalyticsToggle = (value: boolean) => {
    setAnalyticsEnabled(value);
    if (value) {
      Alert.alert(
        'Analytics Enabled',
        'Anonymous usage data will help us improve the app. No personal information is collected.'
      );
    } else {
      Alert.alert(
        'Analytics Disabled',
        'No usage data will be collected. This may limit our ability to improve the app experience.'
      );
    }
  };

  const emergencyContacts = [
    { name: 'Control Room', number: '0471-2730067', type: 'control' },
    { name: 'National Emergency', number: '112', type: 'emergency' },
    { name: 'Police', number: '100', type: 'police' },
    { name: 'Crime Stopper', number: '1090', type: 'crime' },
    { name: 'Pink Petrol', number: '1515', type: 'safety' },
  ];

  const handleEmergencyCall = (number: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Do you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(err => {
              Alert.alert('Error', 'Unable to make phone call');
            });
          }
        }
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    showChevron = true
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={switchValue ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : showChevron ? (
        <ChevronRight size={20} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your privacy and app preferences
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon={<Shield size={20} color="#1E40AF" />}
            title="Anonymous Reporting"
            subtitle="All reports are submitted without personal identification"
            showChevron={false}
          />
          <SettingsItem
            icon={<MapPin size={20} color="#059669" />}
            title="Location Services"
            subtitle="Include GPS coordinates in reports"
            showSwitch={true}
            switchValue={locationEnabled}
            onSwitchChange={handleLocationToggle}
          />
          <SettingsItem
            icon={<Eye size={20} color="#6B7280" />}
            title="Usage Analytics"
            subtitle="Help improve the app with anonymous usage data"
            showSwitch={true}
            switchValue={analyticsEnabled}
            onSwitchChange={handleAnalyticsToggle}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Bell size={20} color="#F59E0B" />}
            title="Push Notifications"
            subtitle="Receive updates about your reports and safety alerts"
            showSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchChange={handleNotificationToggle}
          />
        </SettingsSection>

        <SettingsSection title="Emergency Contacts">
          {emergencyContacts.map((contact, index) => (
            <SettingsItem
              key={index}
              icon={<Phone size={20} color="#DC2626" />}
              title={contact.name}
              subtitle={contact.number}
              onPress={() => handleEmergencyCall(contact.number, contact.name)}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Legal">
          <SettingsItem
            icon={<Shield size={20} color="#4B5563" />}
            title="Privacy Policy"
            subtitle="How we protect your data and ensure anonymity"
            onPress={handlePrivacyPolicy}
          />
          <SettingsItem
            icon={<ExternalLink size={20} color="#4B5563" />}
            title="Terms of Service"
            subtitle="App usage guidelines and user responsibilities"
            onPress={handleTermsOfService}
          />
        </SettingsSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appInfoHeader}>
            <Shield size={32} color="#1E40AF" />
            <View style={styles.appInfoText}>
              <Text style={styles.appName}>Community Safety</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.appDescription}>
            Empowering communities through anonymous reporting and collective safety awareness. Reports are securely transmitted to local authorities for review and action.
          </Text>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeContainer}>
          <Info size={20} color="#F59E0B" />
          <Text style={styles.noticeText}>
            This app is designed to supplement, not replace, emergency services. For immediate emergencies, always call the appropriate emergency number directly.
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingsItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  appInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appInfoText: {
    marginLeft: 16,
  },
  appName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  appDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  noticeContainer: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});