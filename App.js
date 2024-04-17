import React, { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { Button, View, Platform, StyleSheet, Alert } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { encode } from 'base-64';

const App = () => {
  const [manager, setManager] = useState(null);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    return () => {
      bleManager.destroy();
    };
  }, []);

  const requestBluetoothPermission = async () => {
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

  const scanForDevices = () => {
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        Alert.alert('Error scanning for devices:', error);
        return;
      }
      // Check if this is the device you're interested in
      if (scannedDevice.name === 'solanum') {
        manager.stopDeviceScan();
        console.log("solanum found")
        setDevice(scannedDevice);
      }
    });
  };

  const connectToDevice = async () => {
    if (!device) return;
    try {
      await device.connect();
      console.log('Connected to device:', device.name);
      // Now you can interact with the device
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };

  useEffect(() => {
    if (device) {
      connectToDevice();
    }
  }, [device]);

  const requestLocationPermission = async (permissionType) => {
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

  const base64Encode = (str) => {
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


  useEffect(() => {
    manager.state().then(console.log)
  }, [manager])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Scan for Devices" onPress={scanForDevices} />
      {Platform.OS === 'android' && (
        <>
          <Button title="Send toggle" onPress={() => {
            if (device) {
              device.connect().then(device => {
                return device.discoverAllServicesAndCharacteristics()
              }).then((device) => {
                console.log("sending", base64Encode("toggle\r\n"))

                device.writeCharacteristicWithoutResponseForService("6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
                  // "toggle\r\n"
                  encode("toggle\r\n")
                )
              })
            }
          }} />
          {device && <Button title='Forget' onPress={async () => {
            await device.cancelConnection()
            console.log("Device disconnected")
          }} />}
          <Button title="Request Bluetooth Permission" onPress={requestBluetoothPermission} />
          <Button title="Request Coarse Location Permission" onPress={() => requestLocationPermission('coarse')} />
          <Button title="Request Fine Location Permission" onPress={() => requestLocationPermission('fine')} />
        </>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
