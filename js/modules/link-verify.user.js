// ==UserScript==
// @name         链接验证辅助
// @namespace    http://tampermonkey.net/
// @version      2026.01.23.093336
// @description  try to take over the world!
// @author       Kay
// @match        *://*/*
// @updateURL    https://1024nettech.github.io/work/js/modules/link-verify.user.js
// @downloadURL  https://1024nettech.github.io/work/js/modules/link-verify.user.js
// @icon         https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1633159205592221.png
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    let script = document.createElement("script");
    script.src = "https://1024nettech.github.io/work/js/modules/link-verify.js?time=" + Date.now();
    script.type = "module";
    script.async = true;
    if (document.head) {
        document.head.appendChild(script);
        console.log("来自主脚本输出: head 已经存在, 脚本已添加……");
    } else {
        let observer = new MutationObserver(function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (document.head) {
                    document.head.appendChild(script);
                    console.log("来自observer输出: head 已经存在, 脚本已添加……");
                    observer.disconnect();
                    break;
                }
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    }
})();
// End-39-2026.01.23.093336
