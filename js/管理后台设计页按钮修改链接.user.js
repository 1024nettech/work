// ==UserScript==
// @name         管理后台设计页按钮修改链接
// @namespace    http://tampermonkey.net/
// @version      2026.04.13.133220
// @author       Kay
// @match        http://mng.miyubiz.com/VO/Module/FindLink.php?*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let input = `
        <style>
            #xx {
                position: absolute;
                width: auto;
                height: auto;
                top: 130px;
                left: 187px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            #newlink {
                border: 1px solid #0090FF;
                width: 166px;
                height: 27px;
                box-sizing: border-box;
                padding: 0 6px;
            }

            #btnx {
                color: white;
                background-color: #0090FF;
                height: 27px;
                border: none;
                cursor: pointer;
                padding: 0 8px;
            }
        </style>
        <div id="xx">
            <input type="text" id="newlink">
            <button id="btnx">修改链接</button>
        </div>
        `;
    $("body").append(input);
    $("#btnx").click(() => { $("#link").val($("#newlink").val().trim()); });
})();
// End-52-2026.04.13.133220
