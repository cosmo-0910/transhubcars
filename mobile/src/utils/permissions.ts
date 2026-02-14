import { Platform, PermissionsAndroid, Alert } from 'react-native';

/**
 * Checks and requests appropriate media permissions based on Android version.
 * - Android 13+ (SDK 33+): Requests READ_MEDIA_IMAGES
 * - Android 12- (SDK < 33): Requests READ_EXTERNAL_STORAGE
 * 
 * @returns {Promise<boolean>} true if permission granted, false otherwise
 */
export const checkMediaPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const sdkVersion = Platform.Version;
    // Android 13 is SDK 33. REACT_NATIVE_VERSION check isn't enough, we need runtime check.
    // Casting Platform.Version to number as it is number on Android.
    const androidSDK = typeof sdkVersion === 'number' ? sdkVersion : parseInt(sdkVersion, 10);

    let permissionToRequest;
    let permissionName;

    if (androidSDK >= 33) {
      permissionToRequest = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      permissionName = 'Photos and Videos';
    } else {
      permissionToRequest = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      permissionName = 'Storage';
    }

    // Check if we already have permission
    const hasPermission = await PermissionsAndroid.check(permissionToRequest);
    if (hasPermission) return true;

    // Request permission
    const startStatus = await PermissionsAndroid.request(
      permissionToRequest,
      {
        title: `${permissionName} Permission`,
        message: `Transhub needs access to your ${permissionName.toLowerCase()} to let you upload images.`,
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (startStatus === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Permission Denied', 
        `${permissionName} permission is required to select photos. Please enable it in settings.`
      );
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
