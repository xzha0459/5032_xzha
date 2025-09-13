# Firebase Data Setup Guide

## Overview
This project stores data in Firestore, and I regularly export and import this data for development and testing purposes. Each export creates a new folder with a unique timestamp-based name.

## Current Data Version
**Version 1.3 Final Data Location: `firebase-export-1757761160949KbFcPw`

## Running the Project with Data

To run the website with the complete dataset (including user accounts, ratings, and other data), you need to run both the development server and the Firebase emulator with the imported data.

### Step 1: Start the Development Server
npm install
npm run dev

### Step 2: Start Firebase Emulator with Data Import

firebase emulators:start --import=./firebase-export-1757761160949KbFcPw --export-on-exit=./firebase-export-1757761160949KbFcPw

## Important Notes

- Both commands must be running simultaneously for the application to work properly with data
- The Firebase emulator will load all the exported data from the specified folder
- If you only run `npm run dev` without the emulator, the application will run but without any stored data
- The export folder name changes with each export due to Firebase's automatic timestamp naming convention

## Data Contents
The exported data includes:
- User accounts and authentication data
- User profiles and roles
- Strategy ratings and aggregated scores
- All other application data stored in Firestore

## Troubleshooting
- Check that the export folder path is correct
- Verify that Firebase CLI is properly installed and configured
