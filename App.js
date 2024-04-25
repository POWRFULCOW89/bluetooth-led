import React, { useEffect, useState } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { Button, View, Platform, StyleSheet, Alert, Image, ImageBackground, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { encode } from 'base-64';
import { base64Encode, requestBluetoothPermission, requestLocationPermission } from './utils';
import Slider from './Slider';
// import Slider from '@react-native-community/slider'
// import { useSharedValue } from 'react-native-reanimated';


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



  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    return () => {
      bleManager.destroy();
    };
  }, []);


  const scanForDevices = () => {
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        Alert.alert('Error scanning for devices:', error.reason);
        return;
      }
      if (scannedDevice.name === targetDevice) {
        manager.stopDeviceScan();
        console.log(targetDevice, "found")
        setDevice(scannedDevice);
      }
    });
  };

  const [services, setServices] = useState([]);

  const connectToDevice = async () => {
    if (!device) return;
    try {
      await device.connect();
      console.log('Connected to device:', device.name);
      // console.log(JSON.stringify(device))
      const deviceWithServices = await device.discoverAllServicesAndCharacteristics();
      // console.log('Discovered services:', deviceWithServices);
      const services = await deviceWithServices.services();

      for (let service of services) {
        // console.log('Service:', service.uuid);
        const characteristics = await service.characteristics();
        if (characteristics.length > 1) {
          // console.log('Characteristics:', characteristics);
          setServices(characteristics)
        }
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };

  useEffect(() => {
    if (device) {
      connectToDevice();
    }
  }, [device]);

  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ImageBackground source={require("./assets/background.png")} style={{ width: '100%', height: '100%', }}>
      <View style={{ justifyContent: "center", flex: 1 }}>

        {device && <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center", paddingTop: 40 }}>Estado: ON</Text>

          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "row", paddingHorizontal: 20 }}>
            <Image source={require("./assets/pico.png")} style={{ width: 100, flex: 1 }} resizeMode='contain' />
            <View style={{ flex: 1.5 }}>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>{targetDevice}</Text>

              <Text style={{ color: "white", marginTop: 10, fontSize: 14 }}>Estado: conectado</Text>
              <Text style={{ color: "white", fontSize: 14 }}>ID: {device.id}</Text>
              <Text style={{ color: "white", marginBottom: 10, fontSize: 14 }}>MTU: {device.mtu}</Text>

              <View>
                <Text style={{ color: "white", fontSize: 14 }}>Servicios</Text>

                {services.map((service, index) => <Text key={JSON.stringify(service)} style={{ color: "white", fontSize: 12 }}>{index + 1}. {service.uuid} - {service.isReadable ? "Lectura" : "Escritura"}</Text>)}
              </View>
            </View>
          </View>
        </View>}

        <View style={{ paddingHorizontal: 40, flex: 1, justifyContent: "center" }}>
          {device && <TouchableOpacity style={styles.button} onPress={() => {
            device.cancelConnection().then(() => {
              setDevice(null)
              setServices([])
            })
          }}>
            <Text style={styles.buttonText}>Olvidar</Text>
          </TouchableOpacity>
          }

          {/* <View style={{ alignItems: "center", flexDirection: "row" }}>
            <TextInput placeholder="Nombre del dispositivo" style={{ flex: 1, backgroundColor: "white", borderRadius: 10, padding: 10 }} value={payload} onChangeText={(text) => setPayload(text)} />
            <TouchableOpacity style={{ ...styles.button, marginLeft: 10 }} onPress={() => {
              if (device) {
                device.connect().then(device => {
                  return device.discoverAllServicesAndCharacteristics()
                }).then((device) => {

                  const serviceUUID = services[0].serviceUUID
                  const characteristicUUID = services.filter(service => service.isWritableWithoutResponse)[0].uuid

                  // device.writeCharacteristicWithoutResponseForService("6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", encode(payload))

                  console.log("serviceUUID", serviceUUID)
                  console.log("characteristicUUID", characteristicUUID)
                  console.log("payload", encode(payload))

                  device.writeCharacteristicWithoutResponseForService(serviceUUID, characteristicUUID, encode(payload))
                })
              }
            }}>
              <Text style={styles.buttonText}>Enviar payload</Text>
            </TouchableOpacity>
          </View> */}

          {/* <Slider style={{ width: 200, height: 40 }} minimumValue={0} maximumValue={255} value={led1Strength} onValueChange={value => setLed1Strength(value)} /> */}
          {/* <Slider
            style={styles.container}
            progress={led1Strength}
            minimumValue={min}
            maximumValue={max}
          /> */}


          <View style={{ gap: 10, marginBottom: 20 }}>
            <Slider minValue={0} maxValue={255} initialValue={127} onValueChange={(value) => {
              console.log("New LED 1 strength:", value)
              setLed1Strength(value)
            }} />

            <Slider minValue={0} maxValue={255} initialValue={127} onValueChange={(value) => {
              console.log("New LED 2 strength:", value)
              setLed2Strength(value)
            }} backgroundColor='yellow' textColor="black" />


            <Slider minValue={0} maxValue={255} initialValue={127} onValueChange={(value) => {
              console.log("New LED 3 strength:", value)
              setLed3Strength(value)
            }} backgroundColor='red' />
          </View>

          <View style={{ alignItems: "center", flexDirection: "row" }}>
            {/* <TextInput placeholder="Nombre del dispositivo" style={{ flex: 1, backgroundColor: "white", borderRadius: 10, padding: 10 }} value={payload} onChangeText={(text) => setPayload(text)} /> */}
            <TouchableOpacity style={{ ...styles.button, flex: 1 }} onPress={() => {
              if (device) {
                device.connect().then(device => {
                  return device.discoverAllServicesAndCharacteristics()
                }).then((device) => {

                  setPayload(`${led1Strength},${led2Strength},${led3Strength}`)
                  console.log(payload)


                  let ledPayload = `${Math.floor(led1Strength)},${Math.floor(led2Strength)},${Math.floor(led3Strength)}`

                  const serviceUUID = services[0].serviceUUID
                  const characteristicUUID = services.filter(service => service.isWritableWithoutResponse)[0].uuid

                  // device.writeCharacteristicWithoutResponseForService("6E400001-B5A3-F393-E0A9-E50E24DCCA9E", "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", encode(payload))

                  console.log("serviceUUID", serviceUUID)
                  console.log("characteristicUUID", characteristicUUID)
                  console.log("payload", encode(ledPayload))

                  device.writeCharacteristicWithoutResponseForService(serviceUUID, characteristicUUID, encode(ledPayload))
                })
              }
            }}>
              <Text style={styles.buttonText}>Actualizar LEDs</Text>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <TextInput placeholder="Nombre del dispositivo" style={{ flex: 1, backgroundColor: "white", borderRadius: 10, padding: 10 }} value={targetDevice} onChangeText={(text) => setTargetDevice(text)} />
            <TouchableOpacity style={{ ...styles.button, marginLeft: 10 }} onPress={scanForDevices}>
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => { setIsPermissionsModalVisible(true) }}>
            <Text style={styles.buttonText}>Permisos</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.button} onPress={() => { setIsConfigModalVisible(true) }}>
            <Text style={styles.buttonText}>Configuración</Text>
          </TouchableOpacity> */}
        </View>
      </View>
      <Modal visible={isPermissionsModalVisible} transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Permisos</Text>
            {/* <Text style={{ marginBottom: 10 }}>Bluetooth: Permitir</Text>
            <Text style={{ marginBottom: 10 }}>Ubicación: Permitir</Text> */}

            <Button title="Request Bluetooth Permission" onPress={requestBluetoothPermission} />
            <Button title="Request Coarse Location Permission" onPress={() => requestLocationPermission('coarse')} />
            <Button title="Request Fine Location Permission" onPress={() => requestLocationPermission('fine')} />


            <Button title="Cerrar" onPress={() => setIsPermissionsModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={isConfigModalVisible} transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Configuración</Text>
            <TextInput placeholder="Nombre" style={{ marginBottom: 10 }} />
            <TextInput placeholder="ID" style={{ marginBottom: 10 }} />
            <Button title="Guardar" onPress={() => setIsConfigModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ImageBackground>
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
