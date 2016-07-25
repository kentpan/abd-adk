/**
 * abd sdk
 * https://github.com/kentpan/abd.git
 * @flow
 */
'use strict';
import React, {
  Component,
} from 'react';

import {
  Platform,
  Alert,
  NativeModules,
} from 'react-native';

var SdkApi = {
  ios: 'UIManager',
  android: 'RCTNavigator',
}
if (!NativeModules[SdkApi[Platform.OS]]) {
    var RnSdk = {
        getInfo: () => {},
        report: () => {},
    }
    console.log(Platform.OS + ': ' + SdkApi[Platform.OS] + ' API call failed!');
} else {
  var RnSdk = {
    getInfo: (url, data, cb) => {
      console.log(Platform.OS + ': getInfo method调取成功!!!');
      return fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
          console.log(Platform.OS + ': ' + url + ' 请求回调成功!!!');
          return cb(responseData);
        })
        .done();
    },
    report: (act, args) => {
      let os = Platform.OS;
          console.log(os + ': report method调取成功!!!');
      switch (os) {
        case 'ios':
          return RnSdk._alert(os);
        case 'android':
          return RnSdk._alert(os);
      }
    },
    _alert: (os) => {
      return  Alert.alert(
                '啦啦啦' + typeof location,
                '成功调用 JS SDK --- React Native ' + os + '!!!'
            );
    },
  }
}
module.exports = RnSdk;