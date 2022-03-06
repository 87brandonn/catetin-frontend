import React, { useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import CTSearchbar from '../../components/atoms/Searchbar';

function HomeScreen() {
  const [search, setSearch] = useState('');

  const updateSearch = (search: string) => {
    setSearch(search);
  };
  return (
    <View style={tw`flex-1 flex justify-center container bg-white`}>
      <CTSearchbar onChangeText={updateSearch} value={search} />
    </View>
  );
}

export default HomeScreen;
