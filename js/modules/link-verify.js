import { $ } from "./jquery.js";
const url = location.href;
let domain = location.origin;
let domains = {
    "https://www.qipeiyigou.com": "testpage",
    "https://www.cheliangzulin.com": "clzl"
};

if (domain in domains) {
    // 获取域名后面的部分
    let path = url.replace(domain, "");

    // 构建新的链接
    let newUrl = `http://${domains[domain]}.qipeiyigou.com${path}`;

    // 打开新链接
    window.open(newUrl, "_blank");
}
