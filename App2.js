import React, { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { Button, View, Platform, StyleSheet, Alert, Image, ImageBackground, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { encode } from 'base-64';
import { base64Encode, requestBluetoothPermission, requestLocationPermission } from './utils';
import { Slider } from '@react-native-assets/slider';
// import { Slider } from '@miblanchard/react-native-slider';
// import Slider from '@react-native-community/slider'
// import { useSharedValue } from 'react-native-reanimated';

<Slider minValue={0} maxValue={100} initialValue={50} onValueChange={(value) => console.log(value)} />
const App = () => {
  const [manager, setManager] = useState(null);
  const [device, setDevice] = useState(null);
  const [isPermissionsModalVisible, setIsPermissionsModalVisible] = useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [targetDevice, setTargetDevice] = useState("solanum");
  const [payload, setPayload] = useState("toggle\r\n");

  const [led1Strength, setLed1Strength] = useState(0);
  const [led2Strength, setLed2Strength] = useState(0);
  const [led3Strength, setLed3Strength] = useState(0);

  // const led1Strength = useSharedValue(30);
  // const min = useSharedValue(0);
  // const max = useSharedValue(100);




  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    {/* <ImageBackground source={require("./assets/background.png")} style={{ width: '100%', height: '100%', }}>
      <View style={{ justifyContent: "center", flex: 1 }}> */}
    <Slider
      value={led1Strength}
      onSlidingStart={(value) => console.log("start:", value)}
      onSlidingComplete={(value) => console.log("complete:", value)}
      onValueChange={(value) => setLed1Strength(value)}
      // style={styles.slider}
      // inverted={true}
      // slideOnTap={false}
      minimumValue={0}
      maximumValue={255}
    />
  </View>

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
  button: {
    backgroundColor: "#21b2b2",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
