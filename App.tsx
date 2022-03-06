import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import tw from 'twrnc';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={tw`bg-red-500 flex flex-row justify-center rounded-lg py-2 px-5`}>
        <View>
          <Text style={tw`text-red-200 text-3xl`}>CatetinApp</Text>
        </View>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
