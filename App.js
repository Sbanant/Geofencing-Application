import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, TouchableOpacity, Text, TextInput, Modal } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Icon } from 'react-native-elements';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    checkGeofences(locations[0].coords);
  }
});

const startLocationUpdates = async () => {
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 10,
    deferredUpdatesInterval: 1000,
    foregroundService: {
      notificationTitle: 'Using your location',
      notificationBody: 'To detect if you move outside of the geofenced area.',
    },
  });
};

const checkGeofences = (currentLocation) => {
  Object.values(geofences).forEach((geo) => {
    const distance = getDistance(
      { latitude: geo.latitude, longitude: geo.longitude },
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
    );

    if (distance > geo.radius) {
      triggerNotification(`You have exited the geofence for ${geo.name}`);
    }
  });
};

const triggerNotification = async (message) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Geofence Alert',
      body: message,
    },
    trigger: null,
  });
};

const getDistance = (point1, point2) => {
  const R = 6371e3; // metres
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

export default function App() {
  const [screen, setScreen] = useState('map');
  const [location, setLocation] = useState(null);
  const [geofences, setGeofences] = useState({});
  const [isSettingLocation, setIsSettingLocation] = useState(false);
  const [temporaryLocation, setTemporaryLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    (async () => {
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Alert.alert('Permission to access background location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      promptForCurrentLocation(loc.coords);
    })();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    startLocationUpdates();
  }, []);

  const promptForCurrentLocation = (coords) => {
    Alert.alert(
      'Set Geofence',
      'Do you want to set your current location as the geofence?',
      [
        { text: 'No', onPress: () => setIsSettingLocation(true) },
        { text: 'Yes', onPress: () => handleLocationSelection(coords) },
      ],
      { cancelable: false }
    );
  };

  const handleLocationSelection = (coords) => {
    setTemporaryLocation(coords);
    setModalVisible(true);
  };

  const confirmLocation = () => {
    if (locationName.trim() === '') {
      Alert.alert('Error', 'Please enter a name for the location.');
      return;
    }

    const coords = temporaryLocation;
    const name = locationName.trim();
    setGeofences((prev) => ({
      ...prev,
      [name]: {
        ...coords,
        radius: 500,
      },
    }));
    setTemporaryLocation(null);
    setLocationName('');
    setModalVisible(false);
    setScreen('options');
    Alert.alert('Location set with 500m radius');
  };

  const handleMapPress = (e) => {
    if (isSettingLocation) {
      const coords = e.nativeEvent.coordinate;
      handleLocationSelection(coords);
    }
  };

  const removeGeofence = (name) => {
    Alert.alert(
      'Remove Location',
      `Are you sure you want to remove the location set for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setGeofences((prev) => {
              const updatedGeofences = { ...prev };
              delete updatedGeofences[name];
              return updatedGeofences;
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const editGeofence = (name) => {
    Alert.alert(
      'Edit Location',
      'Do you want to edit this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setTemporaryLocation(geofences[name]);
            setIsSettingLocation(true);
            setScreen('map');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const addMoreLocations = async () => {
    if (Object.keys(geofences).length < 5) {
      setScreen('map');
      setIsSettingLocation(false);
      let loc = await Location.getCurrentPositionAsync({});
      promptForCurrentLocation(loc.coords);
    } else {
      Alert.alert('Limit Reached', 'You can only set up to 5 geofences.');
    }
  };

  const renderOptionsScreen = () => (
    <View style={styles.background}>
      <View style={styles.optionsOverlay}>
        {Object.keys(geofences).map((name) => (
          <View key={name} style={styles.optionItem}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: 'green' }]}
              onPress={() => editGeofence(name)}
            >
              <Text style={styles.optionText}>{name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.trashButton}
              onPress={() => removeGeofence(name)}
            >
              <Icon name="trash" type="font-awesome" color="red" />
            </TouchableOpacity>
          </View>
        ))}
        {Object.keys(geofences).length < 5 && (
          <Button title="Add More Locations" onPress={addMoreLocations} />
        )}
      </View>
    </View>
  );

  const renderMapScreen = () => (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={[styles.map, isSettingLocation && styles.settingLocationCursor]}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              pinColor="green"
            />
          )}
          {Object.values(geofences).map((geo, index) => (
            <React.Fragment key={index}>
              <Marker coordinate={{ latitude: geo.latitude, longitude: geo.longitude }} pinColor="red" />
              <Circle
                center={{ latitude: geo.latitude, longitude: geo.longitude }}
                radius={geo.radius}
                strokeColor="rgba(0,0,255,0.5)"
                fillColor="rgba(0,0,255,0.2)"
              />
            </React.Fragment>
          ))}
          {temporaryLocation && (
            <>
              <Marker coordinate={{ latitude: temporaryLocation.latitude, longitude: temporaryLocation.longitude }} pinColor="red" />
              <Circle
                center={{ latitude: temporaryLocation.latitude, longitude: temporaryLocation.longitude }}
                radius={500}
                strokeColor="rgba(0,0,255,0.5)"
                fillColor="rgba(0,0,255,0.2)"
              />
            </>
          )}
        </MapView>
      )}
      <View style={styles.backButtonContainer}>
        <Button
          title="View Locations"
          onPress={() => setScreen('options')}
        />
      </View>

      {/* Modal for entering location name */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Location Name</Text>
            <TextInput
              style={styles.input}
              value={locationName}
              onChangeText={setLocationName}
              placeholder="Location Name"
            />
            <Button title="Confirm" onPress={confirmLocation} />
          </View>
        </View>
      </Modal>
    </View>
  );

  return screen === 'map' ? renderMapScreen() : renderOptionsScreen();
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trashButton: {
    marginLeft: 10,
  },
  map: {
    flex: 1,
  },
  settingLocationCursor: {
    cursor: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDE4IDE4Ij4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iOSIgc3Ryb2tlPSJsaWdodGJsdWUiIHN0cm9rZS13aWR0aD0iMCIgZmlsbD0ibm9uZSIgLz4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iMTAwIiBzdHJva2U9ImxpZ2h0Ymx1ZSIgc3Ryb2tlLXdpZHRoPSIwIiBmaWxsPSJsaWdodGJsdWUiIGZpbGwtb3BhY2l0eT0iMC4yIiAvPgogIDxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSI1IiBmaWxsPSJyZWQiIC8+Cjwvc3ZnPgo=), auto',
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
  },
});
//securestore store based on user id 
//where am i, it will tell how far the nearest geofence location are 