// 放在页面 head 中，尽早执行
/*
(function() {
    var path = window.location.pathname;
    var img = new Image();
    img.src = "https://www.mstx.cn/traffic_stats_web.html?web=hbase&path=" + path;
})();
*/

(function() {
    var STORAGE_KEY = '_mstx_uid';

    // 1. 获取或生成用户唯一标识
    var userId = localStorage.getItem(STORAGE_KEY);
    var isNewUser = !userId;

    if (!userId) {
        userId = generateUUID();
        localStorage.setItem(STORAGE_KEY, userId);
    }

    // 2. 收集访问信息
    var data = {
        uid: userId,
        web: 'hengshuistyle',              // 网站标识，每个网站不同
        path: window.location.pathname
        //ref: document.referrer,
        //title: document.title,
        //is_new: isNewUser,
        //t: Date.now()
    };

    // 3. 发送统计请求
    var img = new Image();
    img.src = 'https://www.mstx.cn/traffic_stats_web.html?' + buildQuery(data);

    // 生成 UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 构建查询字符串
    function buildQuery(obj) {
        var parts = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
            }
        }
        return parts.join('&');
    }
})();
