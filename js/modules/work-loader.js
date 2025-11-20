import * as publics from "./public.js"
const url = location.href;
function loadSuccess(response) {
    // 加载成功后do
    let versionData = publics.parseJson(response.responseText);
    let userJsVersion = versionData["work.user.js"];
    if (userJsVersion === window.GM_info.script.version) {
        console.log(`work.user.js 已是最新版本: ${GM_info.script.version}\n${version_url}`);
        let urls = [
            "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/html2canvas/1.4.1/html2canvas.min.js?time=0&module=0",
            "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/crypto-js/4.2.0/crypto-js.min.js?time=0&module=0",
            "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/xlsx/0.18.5/xlsx.full.min.js?time=0&module=0",
            "https://1024nettech.github.io/work/js/modules/work-main.js?time=1&module=1",
            "https://1024nettech.github.io/work/css/work-public.css?time=1&module=0"
        ];
        publics.loadFiles(urls);
    } else {
        window.open("https://1024nettech.github.io/work/js/work.user.js");
    }
}
function update() {
    // 脚本更新
    publics.sendRequest(version_url, "", "GET", loadSuccess);
}
let version_url = `https://1024nettech.github.io/work/js/version.json?t=${Date.now()}`;
update();
// End-27-2025.11.20.115517
