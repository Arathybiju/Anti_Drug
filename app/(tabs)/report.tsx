import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, FileText, Send, RotateCcw, X, Upload, Image as ImageIcon, Video, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function ReportScreen() {
  const [step, setStep] = useState(1);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Drug Activity',
    'Suspicious Behavior',
    'Public Safety',
    'Environmental Hazard',
    'Other'
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      if (!locationPermission?.granted) {
        const { status } = await requestLocationPermission();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to include incident location in reports.');
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get current location. You can still submit the report without location data.');
    }
  };

  const handleCameraPress = async () => {
    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture evidence.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleUploadPress = async () => {
    Alert.alert(
      'Select Media',
      'Choose the type of media to upload',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Photo', onPress: () => pickImage('photo') },
        { text: 'Video', onPress: () => pickImage('video') }
      ]
    );
  };

  const pickImage = async (type: 'photo' | 'video') => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to upload files.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 30, // 30 seconds max for videos
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedMedia(result.assets[0].uri);
        setMediaType(type);
        Alert.alert('Success', `${type === 'photo' ? 'Photo' : 'Video'} selected successfully!`);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media from gallery');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleTakePicture = async () => {
    // Simulate taking a picture
    setCapturedMedia('captured');
    setMediaType('photo');
    setShowCamera(false);
    Alert.alert('Success', 'Photo captured successfully!');
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitReport = async () => {
    if (!category || !description.trim()) {
      Alert.alert('Incomplete Report', 'Please select a category and provide a description.');
      return;
    }

    setIsSubmitting(true);

    // Prepare report data
    const reportData = {
      category,
      description,
      contactInfo,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString()
      } : null,
      media: capturedMedia ? {
        type: mediaType,
        uri: capturedMedia
      } : null,
      submittedAt: new Date().toISOString(),
      reportId: Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    try {
      // Submit to backend API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsSubmitting(false);
        
        // Check for hotspot alerts
        if (result.hotspotAlert) {
          Alert.alert(
            'Hotspot Alert Generated',
            `Multiple reports detected in this area. Authorities have been notified for immediate action.\n\nReport ID: #${result.reportId}\nHotspot ID: #${result.hotspotId}`,
            [
              {
                text: 'OK',
                onPress: () => resetForm()
              }
            ]
          );
        } else {
          Alert.alert(
            'Report Submitted Successfully',
            `Your anonymous report has been securely transmitted to local authorities. Thank you for helping keep our community safe.\n\nReport ID: #${result.reportId}`,
            [
              {
                text: 'OK',
                onPress: () => resetForm()
              }
            ]
          );
        }
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', 'Failed to submit report. Please try again.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setCapturedMedia(null);
    setMediaType(null);
    setDescription('');
    setCategory('');
    setContactInfo('');
  };

  if (showCamera && cameraPermission?.granted) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <RotateCcw size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <View style={styles.placeholder} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Submit Report</Text>
          <Text style={styles.headerSubtitle}>
            Step {step} of 3 - Your report will remain completely anonymous
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Capture Evidence</Text>
            <Text style={styles.stepDescription}>
              Take a photo/video or upload from your gallery (optional but helpful)
            </Text>

            <View style={styles.mediaOptionsContainer}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handleCameraPress}
              >
                <Camera size={32} color="#1E40AF" />
                <Text style={styles.mediaButtonText}>Take Photo/Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handleUploadPress}
              >
                <Upload size={32} color="#059669" />
                <Text style={styles.mediaButtonText}>Upload from Gallery</Text>
              </TouchableOpacity>
            </View>

            {capturedMedia && (
              <View style={styles.mediaConfirmation}>
                <View style={styles.mediaIcon}>
                  {mediaType === 'photo' ? (
                    <ImageIcon size={24} color="#059669" />
                  ) : (
                    <Video size={24} color="#059669" />
                  )}
                </View>
                <Text style={styles.mediaConfirmationText}>
                  {mediaType === 'photo' ? 'Photo' : 'Video'} captured successfully ✓
                </Text>
              </View>
            )}

            {/* Location Display */}
            <View style={styles.locationContainer}>
              <MapPin size={20} color="#059669" />
              <Text style={styles.locationText}>
                {location 
                  ? `Location: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
                  : 'Getting location...'
                }
              </Text>
            </View>

            <View style={styles.navigationContainer}>
              <View style={styles.placeholder} />
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextStep}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Report Details</Text>
            <Text style={styles.stepDescription}>
              Provide details about what you observed
            </Text>

            {/* Category Selection */}
            <Text style={styles.inputLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonSelected
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextSelected
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Description */}
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what you observed. Include time, people involved, activities, etc."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePreviousStep}
              >
                <ChevronLeft size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextStep}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Final Step</Text>
            <Text style={styles.stepDescription}>
              Review and submit your report
            </Text>

            {/* Optional Contact */}
            <Text style={styles.inputLabel}>Contact Information (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholder="Email or phone (only if you want follow-up)"
              placeholderTextColor="#9CA3AF"
            />

            {/* Report Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Report Summary</Text>
              <Text style={styles.summaryItem}>Category: {category}</Text>
              <Text style={styles.summaryItem}>
                Evidence: {capturedMedia ? `${mediaType === 'photo' ? 'Photo' : 'Video'} attached` : 'No media'}
              </Text>
              <Text style={styles.summaryItem}>Location: {location ? 'GPS coordinates included' : 'Not available'}</Text>
              <Text style={styles.summaryItem}>Description: {description.slice(0, 100)}...</Text>
            </View>

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyText}>
                🔒 Your report will be submitted anonymously to local authorities. We do not store any identifying information unless you choose to provide contact details.
              </Text>
            </View>

            {/* AI Clustering Notice */}
            <View style={styles.aiNotice}>
              <Text style={styles.aiNoticeText}>
                🤖 AI-powered clustering detects incident hotspots. If multiple reports come from the same area in a short time, authorities will be alerted for immediate action.
              </Text>
            </View>

            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePreviousStep}
              >
                <ChevronLeft size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReport}
                disabled={isSubmitting}
              >
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting to Authorities...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E40AF',
    borderRadius: 2,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  mediaOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mediaButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mediaButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  mediaConfirmation: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaIcon: {
    marginRight: 12,
  },
  mediaConfirmationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    marginLeft: 8,
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  placeholder: {
    width: 80,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    minHeight: 120,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  privacyNotice: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 20,
  },
  aiNotice: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  aiNoticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#166534',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 24,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    borderRadius: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E40AF',
  },
});