let script = document.createElement('script');
script.src = 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/jquery/4.0.0-rc.1/jquery.min.js';
script.type = 'text/javascript';
script.async = true;
let interval = setInterval(() => {
    if (window.jQuery) {
        clearInterval(interval);
        main();
    }
}, 100);
function mian() {
    const url = location.href;
    let html = `
    <button id="button"></button>
    <style>
        body {
            background-color: white !important;
        }

        #gl~*:not(canvas, #button, #div) {
            display: none !important;
        }

        #button {
            position: fixed;
            width: 150px;
            height: 40px;
            color: white;
            font-family: "微软雅黑";
            font-size: 16px;
            background-color: #325cea;
            top: 100px;
            right: 100px;
            border: 0;
            border-radius: 10px;
            z-index: 10000;
        }

        #div {
            position: fixed;
            top: 160px;
            right: 100px;
            background-color: #325cea;
            padding: 20px;
            color: white;
            border-radius: 10px;
        }

        #div h2 {
            text-align: center;
            font-size: 18px;
            margin: 0 0 10px 0;
        }

        #div hr {
            color: white;
            border: 0;
            height: 1px;
            background-color: white;
            width: 100%;
            margin: 20px 0 10px 0;
        }
    </style>
    `
    $("body").append(html);
    if (url.includes("air.1688.com")) {
        $("#button").text("下载 Cubemap");
        $("#button").click(function () {
            let currentIndex = parseInt(localStorage.getItem("imageDownloadIndex")) || 1;
            let download_img_urls = [];
            let points = $(".point");
            let validPointsCount = 0;
            points.each(function (index) {
                let backgroundImage = $(this).css("background-image");
                let match = backgroundImage.match(/url\("([^"]+)"\)/);
                if (match && match[1]) {
                    let imageUrl = match[1];
                    if (imageUrl.includes("/video/")) {
                        return;
                    }
                    validPointsCount++;
                    let pointIndex = currentIndex + index;
                    let thumbUrl = `${imageUrl}#${pointIndex}-缩略图`;
                    download_img_urls.push(thumbUrl);
                    let baseUrl = imageUrl.split("/images/")[0];
                    let cubeBaseUrl = `${baseUrl}/cubemap/`;
                    let imagesToDownload = ["u.jpg", "d.jpg", "l.jpg", "r.jpg", "f.jpg", "b.jpg"];
                    $.each(imagesToDownload, function (i, image) {
                        let cubeUrl = `${cubeBaseUrl}${image}`;
                        let markedUrl = `${cubeUrl}#${pointIndex}-${image.split(".")[0]}`;
                        download_img_urls.push(markedUrl);
                    });
                }
            });
            localStorage.setItem("imageDownloadIndex", currentIndex + validPointsCount);
            downloadImagesInSequence(download_img_urls);
        });
        function downloadImagesInSequence(urlArray) {
            console.log(`下载图片:\n${urlArray.join("\n")}`);
            urlArray.forEach((markedUrl, index) => {
                try {
                    let [originalUrl, fileNamePart] = markedUrl.split("#");
                    if (!fileNamePart) {
                        console.error("URL缺少#标记部分: ", markedUrl);
                        return;
                    }
                    let fileExt = originalUrl.split(".").pop().toLowerCase();
                    let finalFileName = `${fileNamePart}.${fileExt}`;
                    window.GM_download({
                        url: originalUrl,
                        name: finalFileName,
                        saveAs: false,
                        onload: function () {
                            console.log(`成功下载: ${finalFileName}`);
                        },
                        onerror: function (error) {
                            console.error(`下载失败: ${finalFileName}`, error);
                        }
                    });
                } catch (error) {
                    console.error("处理下载URL失败: ", markedUrl, error);
                }
            });
        }
    }
    else if (url.includes("danilw.github.io")) {
        let html = `
        <div id="div">
            <h2>全景图宽高</h2>
            <label>宽度: <input id="width_0" type="number" min="1"></label>
            <br>
            <label>高度: <input id="height_0" type="number" min="1"></label>
            <hr>
            <h2>单面角度调整</h2>
            <label>上面: <input id="up" type="number" value="180"></label>
            <br>
            <label>下面: <input id="dowm" type="number" value="180"></label>
            <br>
            <label>左面: <input id="left" type="number" value="0"></label>
            <br>
            <label>右面: <input id="right" type="number" value="0"></label>
            <br>
            <label>前面: <input id="front" type="number" value="0"></label>
            <br>
            <label>后面: <input id="back" type="number" value="0"></label>
        </div>
        `;
        $("body").append(html);
        $("#up_r,#down_r").val(180);
        set_reload();
        $("input").on("input", function () {
            set_reload();
            $("#button").text("下载全景图");
        });
        $("#width_0").on("input", function () {
            let width_0 = parseInt($(this).val());
            if (!isNaN(width_0)) {
                let height_0 = parseInt(width_0 / 2);
                $("#height_0,#height").val(height_0);
            }
            $("#width").val($("#width_0").val());
        });
        $("#height_0").on("input", function () {
            let height_0 = parseInt($(this).val());
            if (!isNaN(height_0)) {
                let width_0 = parseInt(height_0 * 2);
                $("#width_0,#width").val(width_0);
            }
            $("#height").val($("#height_0").val());
        });
        $("#up,#dowm,#left,#right,#front,#back").on("input", function () {
            let id = this.id;
            $("#" + id + "_r").val($(this).val());
        });
        $("#button").text("上传 Cubemap");
        $("#button").click(function () {
            console.log(`全景图宽度: ${$("#width").val()}`);
            console.log(`全景图高度: ${$("#height").val()}`);
            if ($(this).text() == "上传 Cubemap") {
                let $fileInput = $("<input>", {
                    type: "file",
                    multiple: true,
                    accept: ".png,.jpg,.jpeg",
                    css: { display: "none" }
                }).appendTo("body");
                $fileInput.on("change", function () {
                    let files = Array.from(this.files);
                    if (files.length !== 6) {
                        alert("请确保选择了6个文件, 分别代表上下左右前后!");
                        return;
                    }
                    let mapping = {
                        u: "uploadImageup",
                        d: "uploadImagedown",
                        l: "uploadImageLeft",
                        r: "uploadImageright",
                        f: "uploadImagefront",
                        b: "uploadImageback"
                    };
                    $.each(files, function (_, file) {
                        let fileName = file.name.toLowerCase();
                        $.each(mapping, function (key, inputId) {
                            if (fileName.includes(key)) {
                                let $input = $("#" + inputId);
                                if ($input.length) {
                                    let reader = new FileReader();
                                    reader.onload = function (e) {
                                        let img = new Image();
                                        img.onload = function () {
                                            let width = img.width;
                                            let height = img.height;
                                            if (width === height) {
                                                let panoramaWidth = width * 2;
                                                let panoramaHeight = Math.floor(width);
                                                $("#width_0,#width").val(panoramaWidth);
                                                $("#height_0,#height").val(panoramaHeight);
                                            }
                                            let dataTransfer = new DataTransfer();
                                            dataTransfer.items.add(file);
                                            $input[0].files = dataTransfer.files;
                                            $input.trigger("change");
                                        };
                                        img.src = e.target.result;
                                    };
                                    reader.readAsDataURL(file);
                                }
                                return false;
                            }
                        });
                    });
                    $fileInput.remove();
                    $("#button").text("下载全景图");
                });
                $fileInput.click();
            }
            else if ($(this).text() == "下载全景图") {
                set_req_draw();
                setTimeout(() => { $("#button").text("上传 Cubemap"); }, 3000);
            }
        });
    }
}
// End-243-2026.03.06.102656
