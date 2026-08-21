# Task 1 — React Native Environment Setup

> Sheet description: Install Node, JDK, Android Studio, emulator/device setup, and Xcode CLI tools where applicable

## The two routes, and which this project takes

| | Expo | Bare React Native CLI |
|---|------|----------------------|
| Android Studio needed | only for an emulator | always |
| Xcode needed | only for a simulator | always, and only on macOS |
| iOS from Windows/Linux | yes, via a real device or EAS Build | no |
| Native modules | anything with an Expo config plugin | anything at all |

This project uses **Expo**, because it's the only route where an iOS build is reachable without a
Mac — and most interns don't have one.

## Install

```bash
node --version          # 20 LTS or newer
npm install -g expo
npx create-expo-app@latest my-app
```

## Android

Android Studio → SDK Manager → install a platform SDK and the emulator image. Then:

```bash
# add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

adb devices             # is anything connected?
```

**React Native 0.87 requires JDK 17.** Not 11, not 21. A mismatched JDK produces a Gradle error
that names neither Java nor the version, which is why it's worth checking first:

```bash
java -version
```

## iOS (macOS only)

```bash
xcode-select --install
sudo gem install cocoapods
cd ios && pod install     # bare projects only — not needed with Expo Go
```

## The failure that wastes the most time

Expo Go scans the QR code and then nothing loads. Almost always the phone and the computer are on
different networks — or the computer's firewall is blocking Metro's port.

```bash
npx expo start --tunnel     # works across networks, slower
```

## What the screen shows

Runtime values read from `Platform` and `expo-constants`, so the version, OS and build profile
shown are the actual ones rather than what the docs assume.
