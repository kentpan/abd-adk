/**
 * abd sdk
 * https://github.com/kentpan/abd.git
 * @getInfo(url, data, callback)
 * @report(action, args)
 */
'use strict';
;
(function () {
    try {
        var faces = ['getInfo', 'report'];
        var React = require('react');
        var ReactNative = require('react-native');
        var RnSdk = require('./rn-abd-sdk');
        //  console.log(__fbBatchedBridge);

    } catch (_err) {
        var webviewSdk = {
            interface: {
                ios: 'mbdBridge',
                android: 'Bdbox_android_utils'
            },
            api: {
                getInfo: 'getABTestInfo',
                report: 'ABTestReport'
            }
        };
        var browser = (function () {
            var u = navigator.userAgent;
            var os = '';
            switch (true) {
                case !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/):// ios终端
                    os = 'ios';
                    break;
                case u.indexOf('Android') > -1 || u.indexOf('Linux') > -1:// android终端
                    os = 'android';
                    break;
            }
            return os;
        })();
        var getScript = function (src, cb, context) {
            var oHead = document.getElementsByTagName('HEAD')[0];
            var oScript = document.createElement('script');
            oScript.type = 'text/javascript';
            oScript.onload = oScript.onreadystatechange = function () {
                if (!/*@cc_on!@*/0 || this.readyState == "loaded" || this.readyState == "complete") {
                    this.onload = this.onreadystatechange = null;
                    setTimeout(function () {
                        this.parentNode.removeChild(this);
                    }.call(this), 0);
                    typeof cb === 'function' && cb.call(context || window);
                }
            };
            oScript.src = src;
            oHead.appendChild(oScript);
        };
        // mdbBridge.js
        (function (context) {
            function mbdBridge() {
                this.callbackDict = {};
                this.notificationIdCount = 0;
                this.notificationDict = {};
                context.document.addEventListener('DOMContentLoaded', function () {
                    window.location.href = 'baiduboxapp://NotificationReady';
                    for (var i = 0; i < context.mbdBridge.notificationIdCount; i++) {
                        window.location.href = 'baiduboxapp://utils?' + (i + 1);
                    }
                }, false);
            }

            mbdBridge.prototype = {
                constructor: mbdBridge,
                // js向oc发送消息
                postNotification: function (act, data, func, version) {
                    this.notificationIdCount++;
                    // this.notificationDict[this.notificationIdCount] = {action: act, func: data};
                    var args = 'action=' + act + '&func=' + func;
                    if (!!version) {
                        args += '&minver=' + version;
                    }
                    this.notificationDict[this.notificationIdCount] = args;
                    // window.location.href = 'baiduboxapp://utils?' + this.notificationIdCount;
                    window.location.href = 'baiduboxapp://utils?' + this.notificationDict[this.notificationIdCount];
                },
                // oc获取消息数据
                popNotificationObject: function (notificationId) {
                    var result = JSON.stringify(this.notificationDict[notificationId]);
                    delete this.notificationDict[notificationId];
                    return result;
                },
                // oc向js发送消息
                trigger: function (act, data) {
                    if (this.callbackDict[act]) {
                        var callList = this.callbackDict[act];
                        console.log(callList, act)
                        for (var i = 0, len = callList.length; i < len; i++) {
                            callList[i](data);
                        }
                    }
                },
                // 绑定消息
                bind: function (act, callback) {
                    if (!this.callbackDict[act]) {
                        // 创建对应数组
                        this.callbackDict[act] = [];
                    }
                    this.callbackDict[act].push(callback);
                },
                // 解除绑定
                unbind: function (act, callback) {
                    // 如果只提供消息名，则删除整个对应的数组
                    if (arguments.length == 1) {
                        delete this.callbackDict[act];
                    } else if (arguments.length > 1) {
                        // 搜索相应的callback，并删除
                        if (this.callbackDict[act]) {
                            var callList = this.callbackDict[act];
                            for (var i = 0, len = callList.length; i < len; i++) {
                                if (callList[i] == callback) {
                                    callList.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        // 如果数组为空，则删除
                        if (this.callbackDict[act].length == 0) {
                            delete this.callbackDict[act];
                        }
                    }
                }
            };
            context.mbdBridge = new mbdBridge();
        })(window);
        var RnSdk = (function () {
            var func = {
                getInfo: function (data, $callback, ver) {
                    var act = webviewSdk.api['getInfo'];
                    var sdk = window[webviewSdk.interface[browser]];
                    if (typeof data === 'function') {
                        if (!!$callback) {
                            ver = $callback;
                        }
                        $callback = data;
                        data = {};
                    }
                    if (browser === 'ios') {
                        sdk.bind && sdk.bind(act, function () {
                            return $callback.call(RnSdk);
                        });
                        sdk.postNotification && sdk.postNotification(act, data, $callback.name || '$callback', ver);
                        // 模拟IOS 回调
                        sdk.trigger && sdk.trigger(act, {errno: 0, data: {sid: 1, name: 'test'}, os: browser});
                    } else {
                        (!!sdk) && sdk[act].call(this, function () {
                            return $callback.call(RnSdk);
                        });
                    }
                },
                report: function () {
                    var act = webviewSdk.api['report'];
                    alert('JS SDK [report] ---- ' + ((browser) || '') + '!!!');
                }
            };
            return func;
        })();
        // webview Android 环境下模拟native api
        if (browser === 'android' && !window[webviewSdk.interface[browser]]) {
            window[webviewSdk.interface[browser]] = {};
            window[webviewSdk.interface[browser]].getABTestInfo = function (cb) {
                var data = {errno: 0, data: {sid: 1, name: 'test'}, os: browser};
                typeof cb === 'function' && cb.call(window[webviewSdk.interface[browser]], data);
            };
        }
    }
    var AbdSdk = {};
    for (var i = 0, l = faces.length; i < l; i++) {
        if (!RnSdk[faces[i]]) {
            RnSdk[faces[i]] = function () {};
        } else {
            AbdSdk[faces[i]] = RnSdk[faces[i]];
        }
    }
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = AbdSdk;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return AbdSdk;
        });
    } else if (typeof angular === 'object') {
        angular.module('AbdSdk', []).factory('AbdSdk', function () {
            return AbdSdk;
        });
        (typeof window !== 'undefined' ? window : this).AbdSdk = AbdSdk;
    } else {
        (typeof window !== 'undefined' ? window : this).AbdSdk = AbdSdk;
    }
}).call(function () {
    return this || (typeof window !== 'undefined' ? window : global);
});