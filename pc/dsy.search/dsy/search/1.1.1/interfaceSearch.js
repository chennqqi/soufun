/*
 * @file: pc 搜索类接口
 * @author: yangfan
 * @Create Time: 2016-07-13 15:49:03
 */
define('dsy/search/1.1.1/interfaceSearch', [
    'jquery',
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.1/historyUtil'
], function (require, exports, module) {
    'use strict';

    var $ = require('jquery'),
        util = require('dsy/util/1.1.0/util'),
        HistoryUtil = require('dsy/util/1.1.1/historyUtil');
    var vars = seajs.data.vars;

    function InterfaceSearch() {
        this.tag = 'interface';
        this.historyKeySuffix = 'His';
        this.hisTpl = [
            '<tr data-key="{{history_key}}" data-history=\'{{history_object}}\'>',
            '<th><p>{{history_key}}</p></th>',
            '<td class="remove_history"> X </td>',
            '</tr>'
        ].join('');
        this.advertImage = '<img src="http://imgd3.soufunimg.com/2016/07/19/25k/5c7d1e9a085b40e783e5818af3af8b20.png" style="width:28px;height:15px;float:right;">';
        this.advertHtml = '';
        this.suggestHtml = '';
        this.backup = {};
    }

    InterfaceSearch.prototype.formatSearch = function () {
        console.log('you do not implement the method - formatSearch! ' + this.tag);
    };

    /**
     * 目前，新房和家居有广告展示
     * 规则：请求数据为空， input focus ，返回数据 http://mshow 开头为广告。
     * @param {string} data 以“,”分割最后一项为条数，以“^”分割 key, url
     */
    InterfaceSearch.prototype.setAdvert = function (data) {
        var that = this;
        var rows = data.split(','),
            input = vars.searchInput,
            adImg = vars.searchInputAdvertImage;
        var length = rows.length;

        if (length) {
            // 最后一个为数字
            var row = rows[parseInt(Math.random() * (length - 1))].split('^');
            var key = row[0],
                url = row[1];

            var so = that.formatSearch({
                key: key,
                hrefUrl: url,
                adUrl: that.replaceUrlArg(url),
                store: '0'
            });

            that.urlBackup(key, JSON.stringify(so));
            input.val(key);
            adImg.show();
        }
    };

    // 设置默认值时出现问题，需要个 search 对象中的 input 设置值
    InterfaceSearch.prototype.setInputValue = function () {
        var that = this,
            input = vars.searchInput,
            lastHistory = HistoryUtil.getLastHistory(that.historyKey);
        if (lastHistory) {
            input.val(lastHistory.key);
            // input.attr('data-history', JSON.stringify(lastHistory));
        } else {
            input.val(that.defaultText);
        }
    };

    InterfaceSearch.prototype.getSuggestHtml = function () {
        console.log('you do not implement the method - getSuggestHtml! ' + this.tag);
    };

    InterfaceSearch.prototype.getHistoryKey = function (tag) {
        return vars.cityCode + tag + 'His';
    };

    InterfaceSearch.prototype.searchByKey = function () {
        console.log('you do not implement the method - searchByKey! ' + this.tag);
    };

    /**
     * url 备份，请求数据中有包含单独跳转地址的关键字，保存这些跳转地址，保持跳转一致性
     * ps: 当前没有其他属性判断，例如：有是否为广告的特殊处理，需要把 url 改为 obj ，用时 JSON.parse(obj);
     * @param  {string} key 搜索关键字
     * @param  {string} url 跳转地址
     */
    InterfaceSearch.prototype.urlBackup = function (key, string) {
        var that = this;
        if (string && !that.backup[key]) {
            that.backup[key] = string;
        }
    };

    /**
     * 保存历史记录
     * ps: 如果想每个搜索标签保存不同历史记录对象，这里就需要把 HistoryUtil 单独赋给每个对象。setSearchObject
     * @param {string} key 搜索关键字
     * @param {string} url 跳转地址
     */
    InterfaceSearch.prototype.setHistory = function (key, object) {
        var that = this;
        // 一般不会传入 void key, 以防万一
        if (key && key !== that.defaultText) {
            HistoryUtil.setHistory(that.historyKey, object);
        }
    };

    /**
     * 移除某一条历史记录，设置搜索 input 值
     * @param  {int} index 删除索引位置
     */
    InterfaceSearch.prototype.removeHistoryItem = function (index) {
        var that = this,
            input = vars.searchInput;
        var isClear = HistoryUtil.removeHistoryItem(that.historyKey, index);
        if (isClear) {
            input.val(that.defaultText);
        } else {
            that.setInputValue();
        }
        return isClear;
    };

    /**
     * 清除历史记录，设置搜索 input 默认值
     * @param  {int} index 删除索引位置
     */
    InterfaceSearch.prototype.clearHistory = function () {
        var that = this,
            input = vars.searchInput;
        HistoryUtil.clearHistory(that.historyKey);
        input.val(that.defaultText);
    };

    /**
     * 填充历史记录列表 html ，20160728 新需求，广告时候只显示前三条历史，拼接广告列表
     * @param  {array} items 历史记录 json 数组
     * @return {string} 历史记录列表 html 字符串
     */
    InterfaceSearch.prototype.getHistoryHtml = function (count) {
        var that = this;
        var items = HistoryUtil.getHistory(that.historyKey);
        var html = '',
            length = items.length;
        if (count && count < length) {
            length = count;
        }
        if (items && items.length) {
            for (var i = 0; i < length; i++) {
                var item = items[i],
                    tpl = that.hisTpl;

                tpl = tpl.replace(/{{history_key}}/g, item.key);
                tpl = tpl.replace(/{{history_object}}/, JSON.stringify(item));

                html += tpl;
            }
            if (!count) {
                html += '<tr><td class="clear_history" colspan="2" style="text-align:center">清除历史记录</td></tr>';
            }
        }
        return html;
    };

    InterfaceSearch.prototype.replaceUrlArg = function (pUrl) {
        var url = $.trim(pUrl);
        var pattern = 'u=http:([^&]*)';
        if (url.match(pattern)) {
            url = 'http:' + url.match(pattern)[1].trim();
        }
        return url;
    };

    InterfaceSearch.prototype.encode = function (key) {
        return util.encode(key);
    };

    InterfaceSearch.prototype.toggleAdvertImage = function (key) {
        var bu = this.backup[key],
            adImg = vars.searchInputAdvertImage;
        if (bu) {
            var adUrl = JSON.parse(bu).adUrl;
            if (adUrl) {
                adImg.show();
            } else {
                adImg.hide();
            }
        } else {
            adImg.hide();
        }
    };

    module.exports = InterfaceSearch;
});
