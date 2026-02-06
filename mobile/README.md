# Transhub Mobile App - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Android Studio** (for Android development)
- **JDK** (Java Development Kit 17 or higher)

## Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

This will install all required packages including:

- React Native
- React Navigation
- Supabase client
- Vector icons
- Image picker
- And all other dependencies

### 2. Configure Environment

Copy the example environment file and add your Supabase credentials:

```bash
copy .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Link Native Dependencies

Some packages require native linking. Run:

```bash
# For vector icons
npx react-native-asset
```

### 4. Android Setup

#### Install Android Studio

1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio → SDK Manager
3. Install Android SDK Platform 33 (or latest)
4. Install Android SDK Build-Tools
5. Install Android Emulator

#### Configure Environment Variables

Add to your system environment variables:

```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

### 5. Run the App

#### Start Metro Bundler

```bash
npm start
```

#### Run on Android (in a new terminal)

```bash
npm run android
```

Or manually:

```bash
npx react-native run-android
```

## Current IDE Errors

The TypeScript errors you're seeing are **expected** and will be resolved after
running `npm install`. The errors are:

- ❌ `Cannot find module 'react-native'` - Missing dependency
- ❌ `Cannot find module '@react-navigation/bottom-tabs'` - Missing dependency
- ❌ `Cannot find module 'react-native-vector-icons'` - Missing dependency

**Solution:** Run `npm install` in the `mobile` directory.

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # All screen components
│   │   ├── auth/         # Login, Signup
│   │   ├── client/       # Customer screens
│   │   └── vendor/       # Vendor screens
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services (Supabase, Auth, Cars)
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom hooks (useAuth)
│   ├── utils/            # Utilities and theme
│   └── types/            # TypeScript definitions
├── android/              # Android native code
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## Features Implemented

✅ **Authentication**

- Login screen
- Signup screen with role selection (customer/vendor)
- Session persistence with AsyncStorage

✅ **Navigation**

- Role-based routing (client vs vendor)
- Bottom tab navigation for both roles
- Stack navigation for auth flow

✅ **Services**

- Supabase client configured for React Native
- Auth service (sign up, sign in, profile management)
- Cars service (CRUD operations, search, image upload)

✅ **Screens**

- Login/Signup (fully functional)
- Client: Home, Inventory, Profile (placeholders)
- Vendor: Dashboard, Manage Inventory, Add Vehicle, Profile (placeholders)

## Next Steps

1. **Install dependencies** (see step 1 above)
2. **Configure environment** (see step 2 above)
3. **Set up Android Studio** (see step 4 above)
4. **Run the app** (see step 5 above)
5. **Build out feature screens** (currently placeholders)

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Android Build Fails

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Admin Functionality

⚠️ **Note:** Admin features are **NOT** included in the mobile app. Admin
functionality remains web-only for security and complexity reasons.

## Support

For issues or questions, refer to:

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
