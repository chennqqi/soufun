<template>
    <!-- 所有聊天内容都放在 replybox 中，发送中添加active，失败添加fail -->
    <ul id="im_content">
        <template v-for="(item, index) in list">
            <li class="time" v-text="item.messagetime" v-if="showTimeStamp(index)">2017-03-10 10:30</li>
            <li :class="{ even: item.sendto !== username, odd: item.sendto === username }">
                <a class="user">
                    <img :src="getavatar(item)">
                </a>
                <div class="replybox" :class="{ group: isGroup(item.command), active: item.sendto !== username && item.messagestate === 0 }">
                    <p class="name" v-text="getNickname" v-if="isGroup(item.command)">Nickname</p>
                    <!-- 文字内容 replycontent; 群聊中添加姓名 replybox 添加类名 group -->
                    <div class="replycontent" :data-time="item.messagetime" v-if="item.command === 'chat' || item.command === 'group_chat'" v-html="pack_msg(item.message)">Message</div>
                    <!-- yangfan: 语音内容 -->
                    <div class="replycontent" v-if="item.command === 'voice' || item.command === 'group_voice' || item.command === 'red_packets_cash'" v-text="item.message">Message</div>
                    <!-- 图片内容 replyimg -->
                    <div class="replyimg" v-if="item.command === 'img' || item.command === 'group_img'">
                        <a :href="item.message" target="_blank">
                            <img :src="item.message" :alt="item.nickname">
                        </a>
                    </div>

                    <!-- 链接卡片 replylink -->
                    <div class="replylink" v-if="item.command === 'link' || item.command === 'group_link'">
                        <a :href='item.message'>
                            <h6 v-text="item.title">msgContent Title</h6>
                            <div class="con">
                                <div class="con-text" v-text="item.desc">msgContent desc</div>
                                <div class="con-img">
                                    <img :src="item.pic" :alt="item.title" :title="item.title">
                                </div>
                            </div>
                        </a>
                    </div>

                    <!-- 视频内容 replyvideo -->
                    <div class="replyvideo" v-if="item.command === 'video' || item.command === 'group_video'">
                        <a :href='item.message'>
                            <span class="start"></span>
                            <span class="time" v-text="item.second">second</span>
                        </a>
                    </div>

                    <!-- 定位内容 replylocation -->
                    <div class="replylocation" v-if="item.command === 'location' || item.command === 'group_location'">
                        <div class="info">
                            <a v-text="item.title0">big title</a>
                            <a v-text="item.title1">small title</a>
                        </div>
                        <div class="map">
                            <img :src="item.pic">
                            <!-- 地图内容
                            <span class="location"></span>
                            -->
                        </div>
                    </div>
                    <!-- 名片内容 replyuser -->
                    <div class="replyuser" v-if="item.command === 'card'">
                        <div class="title">
                            <div class="info">
                                <a v-text="item.card_nickname">card Nickname</a>
                                <a v-text="item.card_department">card Department</a>
                            </div>
                            <div class="user-head">
                                <img :src="item.card_avatar" alt="头像">
                            </div>
                        </div>
                        <div class="type">个人名片</div>
                    </div>
                    <!-- 文件内容 replyfile -->
                    <div class="replyfile" v-if="item.command === 'file' || item.command === 'group_file'">
                        <a :href="item.message">
                            <div class="info">
                                <h6 v-text="item.filename">file name</h6>
                                <p>
                                    <span v-text="item.size">9.5mb</span>
                                    <span class="flor">已发送</span>
                                </p>
                            </div>
                            <div class="type">
                                <img :src="getFilePic(item.extension)" alt="">
                            </div>
                        </a>
                    </div>
                </div>
            </li>
        </template>
        <!--
                <li class="load"></li>
                <li class="nomore">没有更多了</li>
            -->
    </ul>
</template>

<script>
import setting from '../setting'
import { mapState, mapGetters } from 'vuex';
export default {
    name: 'left-chat-content',
    watch: {
        list() {
            this.$nextTick(() => {
                // var container = this.$el.querySelector("#im_content");
                let container = this.$el;
                // console.log(container);
                container.scrollTop = container.scrollHeight;
            })
        }
    },
    computed: {
        ...mapGetters({
            list: 'message_list'
        }),
        ...mapState({
            leftWindow: state => state.leftWindow
        })
    },
    methods: {
        showTimeStamp(index) {
            let prev = this.list[index - 1];
            if (!prev) {
                return true;
            } else {
                let now = this.list[index];
                if (now.time - prev.time > 60 * 1000) {
                    console.log(now.messagetime, prev.messagetime, now.time - prev.time);
                    return true;
                }
            }
        },
        isGroup(command) {
            return command.split('_')[0] === 'group';
        },
        getFilePic(extension) {
            // Word—— .doc，.docx
            // EXCEL—— .xls，.xlsx
            // PPT—— .ppt，.pptx
            // PDF—— .pdf
            // TXT—— .txt
            let key = extension.substr(0, 3);
            return this.png[key] || this.png['i'];
        },
        getavatar(item) {
            let avatar = this.leftWindow.avatar || this.defaultAvatar;
            if (this.isGroup(item.command)) {
                // 还未做：群聊时头像不能仅仅通过 leftWindow 获取
                avatar = this.defaultAvatar;
            }
            // 如果是本人发出的消息
            if (item.sendto !== this.username) {
                avatar = this.avatar;
            }
            return avatar;
        },
        getNickname(item) {
            let nickname = this.leftWindow.nickname;
            if (this.isGroup(item.command)) {
                // 还未做：群聊时头像不能仅仅通过 leftWindow 获取
                nickname = '未请求';
            }
            if (item.sendto !== this.username) {
                nickname = this.nickname
            }
            return nickname;
        },
        pack_msg(msg) {
            // 把对应的表情字符转换成表情src
            return msg.replace(/\[([^\]]*)\]/g, function () {
                return '<img src="' + setting.EMOJI.path + setting.EMOJI.map[arguments[1]] + '" width="24" border="0" style="vertical-align: bottom;" />'
            });
        }
    },
    data() {
        return {
            png: {
                doc: require('../assets/images/file-word.png'),
                xls: require('../assets/images/file-exal.png'),
                ppt: require('../assets/images/file-ppt.png'),
                pdf: require('../assets/images/file-pdf.png'),
                txt: require('../assets/images/file-txt.png'),
                i: require('../assets/images/file-wenzi.png')
            },
            defaultAvatar: window.FangChat.data.defaultAvatar,
            username: window.FangChat.config.username,
            nickname: window.FangChat.config.nickname,
            avatar: window.FangChat.data.defaultAvatar
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

div,
ul,
li,
span,
p {
    margin: 0;
    padding: 0;
    border: 0;
}

img,
a img {
    border: 0;
    margin: 0;
    padding: 0;
}

h6 {
    margin: 0;
    padding: 0;
    font-size: 12px;
}

ul,
li {
    list-style: none;
}

img {
    vertical-align: top;
}

a {
    color: #333;
    text-decoration: none;
}

a:hover {
    color: #333;
    cursor: pointer;
}



/* 对话列表 */

ul {
    width: 100%;
    height: 318px;
    padding: 15px;
    overflow-y: auto;
}

ul li {
    width: 100%;
    margin-bottom: 15px;
    overflow: hidden;
}

ul li:last-child {
    margin-bottom: 0;
}

ul li .user {
    width: 30px;
    height: 30px;
    overflow: hidden;
    border-radius: 50%;
}

ul li .user img {
    width: 30px;
    height: auto;
}

ul li.odd .user {
    float: left;
    margin-right: 10px;
}

ul li.even .user {
    float: right;
    margin-left: 10px;
}




/* 发送内容 */

ul li .replybox {
    max-width: 360px;
    position: relative;
}

ul li.odd .replybox {
    float: left;
}

ul li.even .replybox {
    float: right;
}




/* 发送中 发送失败 */

ul li .replybox:after {
    content: "";
    width: 15px;
    height: 15px;
    background-size: 15px;
    background-repeat: no-repeat;
    background-position: center;
    position: absolute;
    top: 50%;
    margin-top: -8px;
    cursor: pointer;
    display: none;
}

ul li.odd .replybox:after {
    right: -30px;
}

ul li.even .replybox:after {
    left: -30px;
}

ul li .replybox.active:after {
    background-image: url(../assets/images/icon-active.png);
    display: block;
}

ul li .replybox.fail:after {
    background-image: url(../assets/images/icon-fail.png);
    display: block;
}




/* 群聊姓名 */

ul li .replybox.group {
    margin-top: 21px;
}

ul li .replybox.group .name {
    color: #666;
    font-size: 12px;
    position: absolute;
    top: -21px;
}

ul li.odd .replybox.group .name {
    left: 0;
}

ul li.even .replybox.group .name {
    right: 0;
}


/* 文字内容 */

ul li .replycontent {
    padding: 5px 10px;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    border-radius: 5px;
    word-break: break-all;
    word-wrap: break-word;
    position: relative;
}

ul li .replycontent a {
    color: #4d90fe;
    text-decoration: underline;
}

ul li.odd .replycontent {
    background: #f7f7f7;
}

ul li.even .replycontent {
    background: #ffdbdb;
}

ul li .replycontent:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replycontent:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replycontent:after {
    border-left: 8px solid #ffdbdb;
    right: -8px;
}




/* 图片内容 */

ul li .replyimg {
    max-width: 240px;
    max-height: 178px;
}

ul li .replyimg img {
    max-width: 240px;
    max-height: 178px;
    border-radius: 5px;
}




/* 视频内容 */

ul li .replyvideo {
    width: 240px;
    height: 178px;
    background: #999;
    border-radius: 5px;
    position: relative;
}

ul li .replyvideo .start {
    width: 50px;
    height: 50px;
    background: url(../assets/images/start.png) no-repeat center;
    position: absolute;
    top: 64px;
    left: 95px;
    z-index: 10;
}

ul li .replyvideo .time {
    font-size: 12px;
    color: #fff;
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 10;
}




/* 名片内容 */

ul li .replyuser {
    width: 220px;
    height: 90px;
    background: #f7f7f7;
    padding: 9px 10px 8px;
}

ul li .replyuser .title {
    width: 200px;
    height: 53px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ddd;
}

ul li .replyuser .info {
    float: left;
    width: 140px;
    height: 44px;
}

ul li .replyuser .info a {
    display: block;
    color: #666;
    font-size: 12px;
    line-height: 12px;
    margin-top: 9px;
    width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

ul li .replyuser .info a:first-child {
    color: #333;
    font-size: 14px;
    line-height: 14px;
    margin-top: 4px;
}

ul li .replyuser .user-head {
    float: right;
    width: 44px;
    height: 44px;
    border-radius: 4px;
    overflow: hidden;
}

ul li .replyuser .user-head img {
    width: 44px;
    height: auto;
}

ul li .replyuser .type {
    margin-top: 5px;
    text-align: right;
    color: #999;
    font-size: 12px;
}

ul li .replyuser:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replyuser:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replyuser:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}




/* 文件内容 */

ul li .replyfile {
    width: 220px;
    height: 70px;
    background: #f7f7f7;
    padding: 10px;
}

ul li .replyfile .info {
    width: 140px;
    height: 50px;
    float: left;
    margin-right: 10px;
}

ul li .replyfile .info h6 {
    height: 34px;
    line-height: 17px;
    color: #333;
    font-size: 12px;
    font-weight: normal;
    overflow: hidden;
}

ul li .replyfile .info p {
    color: #999;
    font-size: 12px;
}

ul li .replyfile .type {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    overflow: hidden;
}

ul li .replyfile .type img {
    width: 50px;
    height: 50px;
}

ul li .replyfile:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replyfile:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replyfile:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}




/* 链接内容 */

ul li .replylink {
    width: 220px;
    height: 90px;
    background: #f7f7f7;
    padding: 10px;
}

ul li .replylink h6 {
    width: 200px;
    height: 20px;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    font-weight: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

ul li .replylink .con {
    width: 200px;
    height: 40px;
    margin-top: 10px;
}

ul li .replylink .con .con-text {
    width: 150px;
    height: 40px;
    line-height: 17px;
    padding: 3px 0;
    color: #999;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    float: left;
}

ul li .replylink .con .con-img {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    overflow: hidden;
    float: right;
}

ul li .replylink .con .con-img img {
    width: 40px;
    height: auto;
}

ul li .replylink:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replylink:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replylink:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}




/* 定位内容 */

ul li .replylocation {
    width: 240px;
    height: 178px;
    background: #999;
    border-radius: 5px;
    position: relative;
}

ul li .replylocation .info {
    width: 100%;
    height: 60px;
    background: #f7f7f7;
    padding: 10px 15px;
}

ul li .replylocation .info a {
    display: block;
    margin-top: 8px;
    line-height: 12px;
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

ul li .replylocation .info a:first-child {
    margin: 0;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    font-weight: bold;
}

ul li .replylocation .map {
    width: 100%;
    height: 118px;
    overflow: hidden;
    position: relative;
}

ul li .replylocation .map .location {
    width: 14px;
    height: 19px;
    background: url(../assets/images/icon-location.png) no-repeat center;
    position: absolute;
    top: 50px;
    left: 50px;
}

ul li .replylocation:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replylocation:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replylocation:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}




/* 内容加载中 */

ul li.load {
    width: 18px;
    height: 18px;
    background: url(../assets/images/icon-active.png) no-repeat center;
    margin: 0 auto 15px;
}




/* 没有更多 */

ul li.nomore {
    height: 15px;
    line-height: 15px;
    color: #ddd;
    font-size: 14px;
    text-align: center;
    margin: 0 auto 15px;
    position: relative;
}

ul li.nomore:before,
ul li.nomore:after {
    content: "";
    width: 120px;
    height: 1px;
    background: #ddd;
    position: absolute;
    top: 7px;
}

ul li.nomore:before {
    left: 65px;
}

ul li.nomore:after {
    right: 65px;
}




/* 聊天时间 */

ul li.time {
    height: 15px;
    line-height: 15px;
    color: #999;
    font-size: 12px;
    text-align: center;
    margin: 0 auto 15px;
}
</style>