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
Install the required packages by running:
npm install

