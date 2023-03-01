import { useEffect, useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as Geolocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const FENCING_TASK = 'fencergeo';
const regions = [
  {
    latitude: 22.757865, // degrees
    longitude: 86.210025,
    radius: 30, // meters
  },
];

export default function App() {
  const [lat, setLat] = useState(() => 0.0);
  const [long, setLong] = useState(() => 0.0);
  const [acc, setAcc] = useState(() => 0.0);
  const [out, setOut] = useState(() => true);
  let watchId;

  const startGeofencing = async () => {
    let foreground = await Geolocation.requestForegroundPermissionsAsync();
    if (!foreground.granted) {
      // Permission to access location was denied
      console.log('foreground failed');
      return;
    }

    let background = await Geolocation.requestBackgroundPermissionsAsync();
    if (!background.granted) {
      // Permission to access location was denied
      console.log('background failed');
      return;
    }

    await Geolocation.enableNetworkProviderAsync();

    watchId = await Geolocation.watchPositionAsync({}, (location) => {
      setLat(location.coords.latitude);
      setLong(location.coords.longitude);
      setAcc(location.coords.accuracy);
    });

    Geolocation.startGeofencingAsync(FENCING_TASK, regions).then(() => {
      TaskManager.defineTask(FENCING_TASK, ({ data: { eventType, region }, error }) => {
        if (error) {
          // check `error.message` for more details.
          return;
        }
        if (eventType === Geolocation.GeofencingEventType.Enter) {
          setOut(false);
          console.log(region.latitude, region.longitude);
        } else if (eventType === Geolocation.GeofencingEventType.Exit) {
          setOut(true);
        }
      });
    }).catch(error => {
      // TODO
    });
  };

  useEffect(() => {
    startGeofencing();

    return async () => {
      await Geolocation.stopGeofencingAsync(FENCING_TASK);
      watchId();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Geolocation Api</Text>
      <View>
        <Text>Accuracy: {acc} meter(s)</Text>
      </View>
      <View>
        <Text>{lat} {long}</Text>
      </View>
      <View>
        <Text style={out ? styles.outside : styles.inside}>{out ? 'Outside' : 'Inside'} Fahad's House</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 24
  },
  inside: {
    color: 'green'
  },
  outside: {
    color: 'red'
  }
});
