import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';

function InputDateScreen({ value, onChange }: { value: Date; onChange: (date: Date | undefined) => void }) {
  return <DateTimePicker display="spinner" mode="datetime" value={value} onChange={(event, date) => onChange(date)} />;
}

export default InputDateScreen;
