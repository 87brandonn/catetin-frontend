import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import * as Sentry from 'sentry-expo';
import AppWrapper from './src/AppWrapper';
import { store } from './src/store';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

Sentry.init({
  dsn: 'https://b3198868359a4ac4b036021af6a1d6a5@o1235697.ingest.sentry.io/6385694',
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

// Access any @sentry/react-native exports via:
Sentry.Native.captureException('message');

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AppWrapper />
      </Provider>
    </QueryClientProvider>
  );
}
