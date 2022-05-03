import React from 'react';
import Toast from 'react-native-toast-message';

function CatetinToast(status = 500, type = 'default', message = 'Terjadi kesalahan oleh sistem') {
  return Toast.show({
    type: (type === 'error' && 'customErrorToast') || 'customToast',
    text2: status === 403 ? 'Your session has been expired. Please login again' : message,
    position: 'bottom',
  });
}

export default CatetinToast;
