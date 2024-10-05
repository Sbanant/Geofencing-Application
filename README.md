# Geofencing App with React Native and Expo

This project is a **Geofencing App** built using **React Native** and **Expo**. The app allows users to set geofenced locations and receive notifications when they exit these locations. The app works in the background using Expo’s `Location` and `TaskManager` APIs and allows users to manage up to five geofences at a time. 

## Features

- **Real-time Geofencing**: Set geofenced areas and receive push notifications when exiting.
- **Background Location Tracking**: Continuously tracks user location in the background to detect geofence exits.
- **Location Editing and Removal**: Easily add, edit, or remove geofences.
- **Push Notifications**: Notifications triggered when exiting geofences.
- **Simple UI**: A clean and simple interface to manage geofenced locations.

---

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Project Structure](#project-structure)
3. [Key Features](#key-features)
    - [Geofencing with Background Tasks](#geofencing-with-background-tasks)
    - [Notifications](#notifications)
    - [Map and User Interface](#map-and-user-interface)
4. [Geofence Algorithm](#geofence-algorithm)
5. [Further Improvements](#further-improvements)

---

## Installation and Setup

Follow these steps to get the app running locally:

### 1. Prerequisites
Make sure you have the following installed:
- **Node.js** (v14 or higher)
- **Expo CLI**: You can install it globally by running:
    ```bash
    npm install -g expo-cli
    ```
- **React Native** environment set up.

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/geofencing-app.git
cd geofencing-app
```
**Install the required packages by running:** 
```bash
npm install
```
**Start the Expo server**
```bash 
expo start
```
**Running on Your Device:** 
Use the Expo Go app to scan the QR code provided by the Expo CLI or connect your Android/iOS simulator.

## Project Structure 
```bash 
.
├── assets/                  # App assets like icons, images, etc.
├── components/              # Reusable components
├── App.js                   # Main app file
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```
## Key Features
**Geofencing with Background Tasks**
The app uses Expo’s TaskManager and Location API to continuously track the user’s location in the background. The key task is defined in the LOCATION_TASK_NAME, which triggers every time the location is updated and checks if the user is inside or outside any geofenced area.
```bash 
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    checkGeofences(locations[0].coords);  // Geofence check happens here
  }
});
```
Once a user exits a geofence, the app will trigger a notification.

## Notifications
Expo Notifications API is used to notify users when they leave a geofenced area. The triggerNotification function sends a notification with the name of the geofence the user exited:
```bash 
const triggerNotification = async (message) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Geofence Alert',
      body: message,
    },
    trigger: null,
  });
};
```
The app prompts users for both foreground and background location permissions during the setup process.

## Map and User Interface

The MapView component from react-native-maps is used to display a map where users can set and view their geofenced locations. The geofences are displayed as red circles, with the user’s current location marked in green. Users can tap the map to create new geofences or view and edit existing ones.

```bash
<MapView
  style={styles.map}
  initialRegion={initialRegion}
  onPress={handleMapPress}>
  {/* Markers and Geofences displayed */}
</MapView>
```
The app limits users to five geofences for simplicity and clarity.
