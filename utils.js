import { PermissionsAndroid } from 'react-native';

export const requestBluetoothPermission = async () => {
    if (Platform.OS === 'ios') {
        return true
    }
    if (Platform.OS === 'android' && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
        const apiLevel = parseInt(Platform.Version.toString(), 10)

        if (apiLevel < 31) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            return granted === PermissionsAndroid.RESULTS.GRANTED
        }
        if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN && PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ])

            return (
                result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
            )
        }
    }

    this.showErrorToast('Permission have not been granted')

    return false
}

export const requestLocationPermission = async (permissionType) => {
    try {
        let permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
        if (permissionType === 'coarse') {
            permission = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
        }
        const granted = await PermissionsAndroid.request(permission, {
            title: `${permissionType === 'coarse' ? 'Coarse' : 'Fine'} Location Permission`,
            message: `This app needs access to ${permissionType === 'coarse' ? 'coarse' : 'fine'} location to scan for BLE devices.`,
            buttonPositive: 'OK',
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log(`${permissionType === 'coarse' ? 'Coarse' : 'Fine'} location permission granted`);
        } else {
            console.log(`${permissionType === 'coarse' ? 'Coarse' : 'Fine'} location permission denied`);
        }
    } catch (err) {
        console.warn(err);
    }
};

export const base64Encode = (str) => {
    const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = '';
    let i = 0;

    while (i < str.length) {
        const char1 = str.charCodeAt(i++);
        const char2 = str.charCodeAt(i++);
        const char3 = str.charCodeAt(i++);

        const byte1 = char1 >> 2;
        const byte2 = ((char1 & 0x3) << 4) | (char2 >> 4);
        const byte3 = ((char2 & 0xF) << 2) | (char3 >> 6);
        const byte4 = char3 & 0x3F;

        result += base64Chars[byte1] + base64Chars[byte2] + base64Chars[byte3] + base64Chars[byte4];
    }

    // Pad with '=' if necessary
    const padding = str.length % 3;
    if (padding === 1) {
        result += '==';
    } else if (padding === 2) {
        result += '=';
    }

    return result;
};