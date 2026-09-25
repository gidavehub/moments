import { Redirect } from 'expo-router';

/** Launcher: every cold start plays the splash, which hands off to onboarding or Home. */
export default function Launch() {
  return <Redirect href="/splash" />;
}
