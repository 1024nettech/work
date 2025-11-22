import { $ } from "./jquery.js";
import { set, get, del, keys } from "./idb-keyval.js"
const url = location.href;
function sendRequest(url, cookie, method, doSuccess, formData = null) {
    // 发送请求, formData为{k:v}键值对
    let options = {
        method: method,
        url: url,
        headers: {},
        onload: function (response) {
            if (response.status === 200) {
                doSuccess(response);
            } else {
                console.error("请求失败, 状态码: " + response.status);
            }
        },
        onerror: function (error) {
            console.error("请求发生错误: ", error);
        }
    };
    if (cookie) {
        options.headers["Cookie"] = cookie;
    }
    if (method.toUpperCase() === "POST" && formData) {
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        let urlEncodedData = new URLSearchParams(formData).toString();
        options.data = urlEncodedData;
    }
    if (!cookie) {
        delete options.headers["Cookie"];
    }
    window.GM_xmlhttpRequest(options);
}
function loadFiles(urls) {
    // 动态加载外部文件(JS/CSS)
    let totalFiles = urls.length;
    let loadedFiles = 0;
    function loadNextFile(index) {
        if (index < totalFiles) {
            let url = urls[index];
            let fileExtension = url.split(".").pop().split("?")[0].toLowerCase();
            if (url.includes("?time=1")) {
                let a = "?time=" + Date.now();
                url = url.replace("?time=1", a);
            }
            let isModule = url.includes("&module=1");
            if (fileExtension === "js") {
                let script = document.createElement("script");
                script.src = url;
                script.type = isModule ? "module" : "text/javascript";
                script.onload = function () {
                    console.log(`脚本加载完成: ${url}`);
                    loadedFiles++;
                    if (loadedFiles === totalFiles) {
                        onFilesLoaded();
                    }
                    loadNextFile(index + 1);
                };
                script.onerror = function (error) {
                    console.error(`脚本加载失败: ${url}, 错误信息: `, error);
                    loadNextFile(index + 1);
                };
                console.log(`开始加载脚本: ${url}`);
                document.head.append(script);
            } else if (fileExtension === "css") {
                let link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = url;
                link.onload = function () {
                    console.log(`CSS 加载完成: ${url}`);
                    loadedFiles++;
                    if (loadedFiles === totalFiles) {
                        onFilesLoaded();
                    }
                    loadNextFile(index + 1);
                };
                link.onerror = function (error) {
                    console.error(`CSS 加载失败: ${url}, 错误信息: `, error);
                    loadNextFile(index + 1);
                };
                console.log(`开始加载 CSS: ${url}`);
                document.head.append(link);
            } else {
                console.error(`无法识别的文件类型: ${url}`);
                loadNextFile(index + 1);
            }
        }
    }
    function onFilesLoaded() {
        console.log("所有文件加载完成！");
    }
    loadNextFile(0);
}
function generateTimestamp(format) {
    // 获取时间戳
    let now = new Date();
    let year = now.getFullYear().toString().padStart(4, "0");
    let month = (now.getMonth() + 1).toString().padStart(2, "0");
    let day = now.getDate().toString().padStart(2, "0");
    let hours = now.getHours().toString().padStart(2, "0");
    let minutes = now.getMinutes().toString().padStart(2, "0");
    let seconds = now.getSeconds().toString().padStart(2, "0");
    if (format === 0) {
        return `${year}/${month}/${day}`;
    }
    else if (format === 1) {
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
}
function sliceImage(canvas) {
    // html2canvas截图
    // 如果是单图模式, 不需要判断大小并切割
    let screenshotMode = localStorage.getItem("screenshotMode");
    if (screenshotMode === "单图模式") {
        let imgData = canvas.toDataURL("image/png");
        return [imgData];
    }
    // 多图模式: 检查图片是否大于5MB
    let imgData = canvas.toDataURL("image/png");
    let byteCharacters = atob(imgData.split(",")[1]);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset++) {
        byteArrays.push(byteCharacters.charCodeAt(offset));
    }
    let blob = new Blob([new Uint8Array(byteArrays)], { type: "image/png" });
    if (blob.size > 5 * 1024 * 1024) {
        let height = canvas.height;
        let midHeight = Math.floor(height / 2);
        // 如果图片大于5MB, 切割为两部分
        let firstPartCanvas = document.createElement("canvas");
        let secondPartCanvas = document.createElement("canvas");
        firstPartCanvas.width = canvas.width;
        firstPartCanvas.height = midHeight;
        secondPartCanvas.width = canvas.width;
        secondPartCanvas.height = height - midHeight;
        let firstPartCtx = firstPartCanvas.getContext("2d");
        let secondPartCtx = secondPartCanvas.getContext("2d");
        firstPartCtx.drawImage(canvas, 0, 0, canvas.width, midHeight, 0, 0, canvas.width, midHeight);
        secondPartCtx.drawImage(canvas, 0, midHeight, canvas.width, height - midHeight, 0, 0, canvas.width, height - midHeight);
        let firstPartSlices = sliceImage(firstPartCanvas);
        let secondPartSlices = sliceImage(secondPartCanvas);
        return [...firstPartSlices, ...secondPartSlices];
    } else {
        return [imgData];
    }
}
function takeScreenshots(selector) {
    // html2canvas截图
    $(selector).attr("id", "screenshot-area");
    $("#processing-message").text("处理中……");
    let pageTitle = document.title;
    let time = generateTimestamp(1);
    html2canvas(document.querySelector("#screenshot-area"), {
        useCORS: true,
        logging: true
    }).then(canvas => {
        let imageArray = sliceImage(canvas);
        let downloadedCount = 0;
        let totalImages = imageArray.length;
        imageArray.forEach((imgData, index) => {
            let link = document.createElement("a");
            link.href = imgData;
            link.download = `${time}-${index + 1}-${pageTitle}.png`;
            link.click();
            downloadedCount++;
            if (downloadedCount === totalImages) {
                $("#processing-message").text("已完成！");
            }
        });
    });
}
async function clearAll() {
    // 清除所有idb-keyval数据
    let allKeys = await keys();
    for (let key of allKeys) {
        await del(key);
    }
    console.log("idb-keyval 所有数据已清除……");
}
async function setAndLog(key, value) {
    // 存储并输出数据
    try {
        await set(key, value);
        console.log(`来自work-main.js 的输出: setAndLog已更新 - Key: ${key}, Value: `, value);
    } catch (error) {
        console.error("无法设置记录, 发生错误: ", error);
    }
}
async function getAndLog(key) {
    // 获取并输出数据
    try {
        let value = await get(key);
        console.log(`来自work-main.js 的输出: getAndLog已获取 - Key: ${key}, Value: `, value);
        return value
    } catch (error) {
        console.error("无法获取数据, 发生错误: ", error);
    }
}
async function waitfor(selectors, delayTime, doCallback, method = "timeout") {
    // 等待元素出现后执行回调, method 可选timeout或observer调用不同观察方法
    return new Promise((resolve, reject) => {
        function checkElements() {
            let elementsExist = selectors.every(selector => $(selector).length > 0);
            if (elementsExist) {
                try {
                    doCallback();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            } else {
                setTimeout(checkElements, delayTime);
            }
        }
        function observeElements() {
            let observer = new MutationObserver((mutationsList, observer) => {
                let elementsExist = selectors.every(selector => $(selector).length > 0);
                if (elementsExist) {
                    observer.disconnect();
                    try {
                        doCallback();
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                }
            });
            let config = { childList: true, subtree: true };
            observer.observe(document.body, config);
        }
        if (method === "timeout") {
            checkElements();
        } else if (method === "observer") {
            observeElements();
        } else {
            reject(new Error(`Invalid method parameter. Use "timeout" or "observer".`));
        }
    });
}
function parseJson(jsonString) {
    // 将数据解析为json
    try {
        return JSON.parse(jsonString.trim());
    } catch (error) {
        console.error("Failed to parse JSON: ", error);
        return null;
    }
}
function getUrlParameter(url, paramName) {
    // 查询url中参数值, 包括#后面参数
    let urlParams = new URLSearchParams(new URL(url).search);
    let paramValue = urlParams.get(paramName);
    if (!paramValue) {
        let hashParams = new URLSearchParams(new URL(url).hash.substring(1));
        paramValue = hashParams.get(paramName);
    }
    return paramValue;
}
function downloadVideo(videoUrl, fileName) {
    // 下载视频
    fetch(videoUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(error => console.error("下载失败:", error));
}
function addDownloadButton(videoSelector, parentSelector, buttonId) {
    // 添加下载视频按钮
    setInterval(() => {
        const videoElement = document.querySelector(videoSelector);
        if (videoElement) {
            if (!document.getElementById(buttonId)) {
                const downloadButton = document.createElement("span");
                downloadButton.textContent = "下载视频";
                downloadButton.id = buttonId;
                const parentElement = document.querySelector(parentSelector);
                if (parentElement) {
                    parentElement.appendChild(downloadButton);
                }
                downloadButton.addEventListener("click", () => {
                    const videoUrl = videoElement.src || videoElement.currentSrc;
                    const fileName = `${document.title}.mp4`;
                    downloadVideo(videoUrl, fileName);
                });
            }
        }
    }, 1000);
}
function onKeyUp(key, callback) {
    $(document).on("keyup", function (event) {
        if (event.key === key) {
            callback();
        }
    });
}
export { sendRequest, loadFiles, generateTimestamp, sliceImage, takeScreenshots, clearAll, setAndLog, getAndLog, waitfor, parseJson, getUrlParameter, addDownloadButton, onKeyUp }
// End-305-2025.11.22.150000
