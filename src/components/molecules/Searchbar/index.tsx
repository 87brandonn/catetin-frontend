import React from 'react';
import { SearchBar } from 'react-native-elements';
import { SearchBarBaseProps } from 'react-native-elements/dist/searchbar/SearchBar';
import tw from 'twrnc';

const SafeSearchBar = SearchBar as unknown as React.FC<SearchBarBaseProps>;

function CTSearchbar({ ...rest }) {
  return (
    <SafeSearchBar
      placeholder="Search"
      platform={'default'}
      containerStyle={tw`border-b-transparent border-t-transparent bg-white p-0`}
      inputContainerStyle={tw`bg-gray-100`}
      {...rest}
    />
  );
}

export default CTSearchbar;
