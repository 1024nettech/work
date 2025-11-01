import * as publics from "./public.js"
const url = location.href;
const autorun = Number(localStorage.getItem("autorun"));
if (autorun) {
    window.alert = function () { };
    if (url === "http://testpage.qipeiyigou.com/dom/action/sc_product.php?username=qipeiyigouwang" || (url.includes("sc_product_list.php") && url.includes("&t="))) {
        window.close();
    }
}
function loadSucess(response) {
    // 加载成功后do
    let versionData = publics.parseJson(response.responseText);
    let userJsVersion = versionData["work.user.js"];
    if (userJsVersion === window.GM_info.script.version) {
        console.log(`work.user.js 已是最新版本: ${GM_info.script.version}\n${version_url}`);
        let urls = [
            "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/crypto-js/4.2.0/crypto-js.min.js?time=0&module=0",
            "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/xlsx/0.18.5/xlsx.full.min.js?time=0&module=0",
            "https://1024nettech.github.io/work/js/modules/work-main.js?time=1&module=1",
            "https://1024nettech.github.io/work/css/workflow.css?time=0&module=0"
        ];
        publics.loadFiles(urls);
        if (url.includes("1688.com")) {
            let urls = [
                "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/jquery/4.0.0-rc.1/jquery.min.js?time=0&module=0",
                "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/html2canvas/1.4.1/html2canvas.min.js?time=0&module=0"
            ];
            publics.loadFiles(urls);
        }
    } else {
        let urls = ["https://1024nettech.github.io/work/css/work-public.css?time=0&module=0"];
        publics.loadFiles(urls);
        let html = `
            <a id="update_tip" href="https://1024nettech.github.io/work/js/work.user.js" target="_blank">点这里,弹出新窗口,按图1点击,刷新此页面,如果弹出图2的窗口,按图2点击,不弹不用点</a>
            <br>
            <img src="https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1748138914782311.png">
            <button id="tip1">1. 点这里</button>
            <img src="https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1748139893223935.png">
            <button id="tip2">2. 点这里</button>
            `
        $("body").html(html);
    }
}
function update() {
    // 脚本更新
    publics.sendRequest(version_url, "", "GET", loadSucess);
}
let version_url = `https://1024nettech.github.io/work/js/version.json?t=${Date.now()}`;
update();
// End-50-2025.11.01.113444
