// ==UserScript==
// @name         管理后台文章发布-图片限制最宽888px
// @namespace    http://tampermonkey.net/
// @version      2026.02.06.114454
// @description  try to take over the world!
// @author       Kay
// @match        http://admin.qipeiyigou.com/own_add_doc.php*
// @icon         https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1633159205592221.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    $(document).keydown(function (e) {
        if (e.key === "Escape") {
            $("#ueditor_0").contents().find("body img").css("max-width", "888px");
            alert("图片宽度已处理！");
        }
    });
})();
// End-23-2026.02.06.114454
