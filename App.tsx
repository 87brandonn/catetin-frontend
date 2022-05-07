import RootNavigation from './src/navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/store';
import tw from 'twrnc';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://b3198868359a4ac4b036021af6a1d6a5@o1235697.ingest.sentry.io/6385694',
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

// Access any @sentry/react-native exports via:
Sentry.Native.captureException('message');

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={tw`flex-1`}>
          <RootNavigation />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
