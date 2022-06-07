import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinButton from '../../components/molecules/Button';
import { useAppSelector } from '../../hooks';
import useDeleteStoreUser from '../../hooks/useDeleteStoreUser';
import useProfile from '../../hooks/useProfile';
import useStoreUsers from '../../hooks/useStoreUsers';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';

function StoreUserScreen() {
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const { data: storeData, isLoading: loadingStore } = useStoreUsers(activeStore);
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();

  const { mutate: deleteAccess, isLoading: isLoadingDelete } = useDeleteStoreUser();

  const { navigate } = useNavigation();

  return (
    <AppLayout header isBackEnabled headerTitle="Manage People">
      <CatetinScrollView style={tw`flex-1 px-3`}>
        <View>
          <View style={tw`flex justify-between items-center flex-row mb-5`}>
            <Text style={tw`text-xl mb-3`}>People</Text>
            <CatetinButton
              title="Add"
              onPress={() => {
                navigate('AddUserStoreScreen');
              }}
            ></CatetinButton>
          </View>
          {storeData?.map((data, index) => (
            <View key={index} style={tw`flex flex-row items-center justify-between mb-4`}>
              <View style={tw`flex flex-row items-center`}>
                <Icon name="user" tvParallaxProperties="" type="feather" style={tw`mr-2`} />
                <View>
                  <Text style={tw.style(`text-lg`)}>{data.User.Profile?.displayName}</Text>
                  <Text style={tw`text-base`}>{data.User.username.slice(0, 20)}</Text>
                  <Text style={tw`text-base`}>{data.User.email}</Text>
                </View>
              </View>
              <View>
                <Text style={tw`text-lg mb-1`}>{data.grant}</Text>
                {data.User.email !== profileData?.email && (
                  <CatetinButton
                    theme="danger"
                    title="Revoke"
                    disabled={isLoadingDelete}
                    onPress={() => {
                      Alert.alert(
                        'Revoke access',
                        `You are about to revoke access for user ${data.User.email}. You have to reinvite them again in the future if you wish to do so. Are you sure wish to revoke this access?`,
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'OK',
                            onPress: async () => {
                              deleteAccess({
                                userId: data.User.id,
                                id: activeStore,
                              });
                            },
                          },
                        ],
                      );
                    }}
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default StoreUserScreen;
