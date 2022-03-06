import React, { useEffect, useState } from 'react';
import { TextInput, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import tw from 'twrnc';

WebBrowser.maybeCompleteAuthSession();

function Login() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '478756255587-1hsqks41ku9r9qp8qumvoe199oehu2v5.apps.googleusercontent.com',
    iosClientId: '478756255587-9mnonnev35sl3tn0pd7i2hmnjjsuiivi.apps.googleusercontent.com',
    androidClientId: '478756255587-v7qv1rvfemqarqad2jik5j03r6ubdoj8.apps.googleusercontent.com',
  });

  const [userInfo, setUserInfo] = useState({});

  const [requestFb, responseFb, promptAsyncFb] = Facebook.useAuthRequest({
    clientId: '709036773596885',
    responseType: ResponseType.Code,
  });

  useEffect(() => {
    if (responseFb?.type === 'success') {
      const { code } = responseFb.params;
      console.log(code);
    }
  }, [responseFb]);

  const getUserInfo = async (token: string | undefined) => {
    const userInfo = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const serialized = await userInfo.json();
    setUserInfo(serialized);
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      getUserInfo(authentication?.accessToken);
    }
  }, [response]);
  return (
    <SafeAreaView style={tw`px-2 flex-1 justify-center`}>
      <View>
        <TextInput placeholder="Enter your username" style={tw`border border-gray-300 px-4 py-3 rounded mb-3`} />
      </View>
      <View>
        <TextInput placeholder="Enter your password" style={tw`border border-gray-300 px-4 py-3 rounded mb-3`} />
      </View>
      <View style={tw`flex flex-row items-center mb-3`}>
        <Text style={tw`text-gray-400 mr-1`}>Don&apos;t have an account?</Text>
        <Text style={tw`text-blue-400`}>Registers</Text>
      </View>
      <View>
        <Text>{JSON.stringify(userInfo)}</Text>
      </View>
      <Button
        disabled={!request}
        title="Login"
        buttonStyle={tw`bg-blue-500 rounded-[8px]`}
        onPress={() =>
          promptAsync({
            showInRecents: true,
          })
        }
      />
      <Button
        disabled={!requestFb}
        title="Login with Facebook"
        buttonStyle={tw`bg-blue-500 rounded-[8px] mt-4`}
        onPress={() => {
          promptAsyncFb();
        }}
      />
    </SafeAreaView>
  );
}

export default Login;
