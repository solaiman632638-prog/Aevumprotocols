# Putting Aevum in the App Store

The iPhone app lives in `ios/`. It opens the live site, so every push to
`main` updates the app as well, with no resubmission needed. The native shell
adds Apple Health: inside the app, the Today page's **Connect** button asks
for Health access and reads resting heart rate, HRV, and breathing rate each
time the app opens. No Shortcut is needed there.

## What only you can do

1. **Apple Developer Program.** Enroll at developer.apple.com/programs
   ($99 US a year). It needs your Apple ID, legal name, and ID check. As a
   business, enroll the company instead (needs a D-U-N-S number).
2. **Install Xcode** from the Mac App Store (free, about 10 GB).
3. In Xcode, open **Settings → Accounts** and sign in with that Apple ID.

## Build and upload

1. Run `npx cap sync ios` in the project, then `npx cap open ios`.
2. In Xcode, click **App** in the left sidebar, then **Signing & Capabilities**:
   - Team: pick your developer team.
   - Bundle identifier: `ca.aevumperformance.app`.
   - Click **+ Capability** and add **HealthKit** (the entitlement file is
     already there; this registers it with Apple).
3. Pick an iPhone simulator and press ▶ to try it. Then plug in your iPhone,
   pick it, and press ▶ to try Apple Health for real.
4. Choose **Product → Archive**, then **Distribute App → App Store Connect**.

## App Store Connect listing

At appstoreconnect.apple.com, create the app with bundle ID
`ca.aevumperformance.app`. You need:

- Screenshots from a 6.7-inch iPhone (take them in the simulator).
- Privacy policy URL: https://www.aevumperformance.ca/privacy
- App Privacy answers: health and fitness data, linked to the user, used for
  app functionality, not for tracking. Email address for the account. Photos
  only if they use body analysis (sent for processing, not stored).
- A demo account for the reviewer (Apple requires one because of the login).

## Review risk to know about

Apple's guideline 1.4.1 says apps that calculate drug doses must come from a
drug maker, pharmacy, hospital, or another approved body, or have FDA
clearance. Aevum's peptide starting amounts and reconstitution calculator are
likely to be flagged. If Apple rejects it, the usual fix is a build that hides
dosing inside the app and keeps it on the website.
