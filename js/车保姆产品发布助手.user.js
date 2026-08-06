// ==UserScript==
// @name         车保姆产品发布助手
// @namespace    http://tampermonkey.net/
// @version      2026.08.06.104409
// @description  车保姆产品发布助手
// @author       Kay
// @match        http://cbm.qipeiyigou.com/dom/sc_product.php*
// @require      https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/jquery/3.7.1/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1633159205592221.png
// @noframes
// ==/UserScript==

(function ($) {
    'use strict';

    // 存储key统一常量
    const STORAGE_KEY = 'form_save_data';

    // 工具：等待下拉选项渲染完成（联动分类专用）
    function waitSelectLoad(selector, targetVal, timeout = 100000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const timer = setInterval(() => {
                const $sel = $(selector);
                const hasOption = $sel.find(`option[value="${targetVal}"]`).length > 0;
                // 超时判断
                if (Date.now() - startTime > timeout) {
                    clearInterval(timer);
                    reject(`下拉${selector}加载超时，未找到值:${targetVal}`);
                    return;
                }
                if (hasOption) {
                    clearInterval(timer);
                    $sel.val(targetVal).trigger('change'); // 触发页面原生onchange联动
                    resolve();
                }
            }, 200);
        });
    }

    // 1. 采集表单全部数据
    function collectFormData() {
        // A 商品名称
        const proname = $('#proname').val().trim();

        // B 系统三级分类
        const big_id = $('#big_id').val();
        const sub_id = $('#sub_id').val();
        const sub_sub_id = $('#sub_sub_id').val();

        // C 店铺自定义二级分类
        const shop_big = $('#shop_pro_class_big_id').val();
        const shop_sub = $('#shop_pro_class_sub_id').val();

        // D 服务专区单选
        const exclusive_model = $("input[name='exclusive_model']:checked").val() || '';

        // E 关键词
        const keyword = $('#keywords').val();

        // F 城市编码
        const citycode = $('#citycode').val();

        // G 商品单位
        const prounit = $('#prounit').val();

        // H 图片拼接html pic1-pic8
        let imgHtml = '';
        for (let i = 1; i <= 8; i++) {
            const picVal = $(`#pic${i}`).val().trim();
            if (picVal) {
                imgHtml += `<p><img src="${picVal}" style="width:800px;height:800px;"></p>`;
            }
        }

        return {
            proname,
            big_id,
            sub_id,
            sub_sub_id,
            shop_big,
            shop_sub,
            exclusive_model,
            keyword,
            citycode,
            prounit,
            imgHtml,
        };
    }

    // 2. 保存数据到GM存储
    function saveFormData() {
        const data = collectFormData();
        GM_setValue(STORAGE_KEY, JSON.stringify(data));
        console.log('表单数据已保存', data);
    }

    // 3. 回填表单（异步处理联动分类）
    async function fillSavedData() {
        const storeStr = GM_getValue(STORAGE_KEY, '');
        if (!storeStr) return;
        let saveData;
        try {
            saveData = JSON.parse(storeStr);
        } catch (e) {
            console.error('存储数据解析失败', e);
            return;
        }

        // 回填商品名称
        $('#proname').val(saveData.proname);

        // 回填城市
        $('#citycode').val(saveData.citycode);

        // 回填服务专区单选
        if (saveData.exclusive_model) {
            $(`input[name="exclusive_model"][value="${saveData.exclusive_model}"]`).prop(
                'checked',
                true,
            );
        }
        // 回填关键词
        $('#keywords').val(saveData.keyword);

        // 回填商品单位
        $('#prounit').val(saveData.prounit);

        // 回填编辑器图片内容
        if (saveData.imgHtml) {
            $('#ueditor_0').contents().find('body').html(saveData.imgHtml);
        }

        // ========== 回填系统三级联动分类（逐级等待加载）==========
        try {
            // 一级大类
            if (saveData.big_id) await waitSelectLoad('#big_id', saveData.big_id);
            // 二级子类（选完一级后页面异步加载二级，等待渲染）
            if (saveData.sub_id) await waitSelectLoad('#sub_id', saveData.sub_id);
            // 三级子类
            if (saveData.sub_sub_id) await waitSelectLoad('#sub_sub_id', saveData.sub_sub_id);
        } catch (err) {
            console.warn('系统分类回填异常:', err);
        }

        // ========== 回填店铺自定义二级分类 ==========
        try {
            if (saveData.shop_big)
                await waitSelectLoad('#shop_pro_class_big_id', saveData.shop_big);
            if (saveData.shop_sub)
                await waitSelectLoad('#shop_pro_class_sub_id', saveData.shop_sub);
        } catch (err) {
            console.warn('自定义分类回填异常:', err);
        }
    }

    // 页面加载完成执行回填
    $(function () {
        if ($('#submit_msg').text().includes('添 加')) {
            $('#proname').on('input', function () {
                const val = $(this).val();
                $('#keywords').val(val);
            });

            fillSavedData();

            // #submit_msg mousedown 触发保存
            $(document).on('mousedown', '#submit_msg a', function () {
                // G 图片拼接html pic1-pic8
                let imgHtml = '';
                for (let i = 1; i <= 8; i++) {
                    const picVal = $(`#pic${i}`).val().trim();
                    if (picVal) {
                        imgHtml += `<p><img src="${picVal}" style="width:800px;height:800px;"></p>`;
                    }
                }
                console.log(imgHtml);
                if (imgHtml) {
                    $('#ueditor_0').contents().find('body').html(imgHtml);
                }
                saveFormData();
            });
        }
    });
})(jQuery);
// End-188-2026.08.06.104409
