/*
 * @file: historyUtil
 * @author: yangfan
 * @Create Time: 2016-06-02 13:16:51
 */

define('dsy/util/1.1.1/historyUtil', function () {
    'use strict';

    var vars = seajs.data.vars;

    // ���ü���Ƿ�Ϊ�޺�ģʽ���޺�ģʽ������localStorage
    if (!window.localStorage) {
        alert();
        var ls = window.localStorage;
        try {
            if (ls) {
                ls.setItem('testPrivateModel', !1);
            }
        } catch (e) {
            ls = null;
        }
        vars.localStorage = ls;
    }

    var historyUtil = function () {
        this.HISTORY_COUNT = 10;
        this.historyObject = {
            key: '',
            hrefUrl: '',
            adUrl: '',
            district: '',
            tag: '',
            suffix: ''
        };
    };

    historyUtil.prototype.setHistoryObject = function (obj) {
        this.historyObject = obj;
    };

    historyUtil.prototype.stringifyJSON = function (obj) {
        return JSON.stringify(obj);
    };

    historyUtil.prototype.parseJSON = function (str) {
        return JSON.parse(str);
    };

    historyUtil.prototype.getHistory = function (key) {
        var historyItems = [];
        if (vars.localStorage) {
            historyItems = vars.localStorage.getItem(key);
            if (historyItems) {
                historyItems = this.parseJSON(historyItems);
            } else {
                historyItems = [];
            }
        }
        return historyItems;
    };

    historyUtil.prototype.getLastHistory = function (key) {
        var historyItems = this.getHistory(key);
        return historyItems ? historyItems[0] : '';
    };

    historyUtil.prototype.getFirstHistory = function (key) {
        var historyItems = this.getHistory(key);
        return historyItems ? historyItems[historyItems.length - 1] : '';
    };

    /**
     * ������ʷ��¼
     * @param obj ��ʷ��¼����
     * @param url ��ʷ��¼Ҫ��ת�ĵ�ַ
     * @param mark ��ʷ��¼�ı�ʶ
     */
    historyUtil.prototype.setHistory = function (key, obj) {
        if (vars.localStorage) {
            var thatObj = this.formatHistoryObject(obj);
            var historyItems = vars.localStorage.getItem(key);
            if (historyItems) {
                historyItems = this.parseJSON(historyItems);
                var length = historyItems.length;
                for (var i = length - 1; i >= 0; i--) {
                    if (this.hasSameHistory(thatObj, historyItems[i])) {
                        historyItems.splice(i, 1);
                    }
                }
            } else {
                historyItems = [];
            }
            historyItems.unshift(thatObj);
            if (historyItems.length > this.HISTORY_COUNT) {
                historyItems.pop();
            }
            vars.localStorage.setItem(key, this.stringifyJSON(historyItems));
        }
    };

    /**
     * �ж���ʷ��¼��Ϣ�Ƿ�һ��
     */
    historyUtil.prototype.hasSameHistory = function (a, b) {
        var obj = this.historyObject;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (a[key] !== b[key]) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * ��ȡ��ʽ�������ʷ��¼
     */
    historyUtil.prototype.formatHistoryObject = function (obj) {
        var o = {};
        for (var key in this.historyObject) {
            if (this.historyObject.hasOwnProperty(key)) {
                o[key] = obj[key] || '';
            }
        }
        o.timestamp = new Date().getTime().toString();
        return o;
    };

    historyUtil.prototype.removeHistoryItem = function (key, index) {
        var hitstoryItems = vars.localStorage.getItem(key);
        hitstoryItems = this.parseJSON(hitstoryItems);
        var length = $.isArray(hitstoryItems) ? hitstoryItems.length : 0;
        var isClear = false;
        if (length === 1) {
            isClear = true;
            this.clearHistory(key);
        } else {
            hitstoryItems.splice(index, 1);
            vars.localStorage.setItem(key, this.stringifyJSON(hitstoryItems));
        }
        return isClear;
    };

    historyUtil.prototype.clearHistory = function (key) {
        vars.localStorage && vars.localStorage.removeItem(key);
    };

    return new historyUtil();
});
