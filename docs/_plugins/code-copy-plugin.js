// plugins/docsify-code-copy-plugin.js
(function(window, document) {
    // 1. 默认配置（新增图标相关配置）
    const defaultOptions = {
        // 按钮内容：支持HTML（图标）
        copyContent: '<i class="fa fa-copy"></i>', // 核心修改：默认显示复制图标
        successText: '复制成功 ✔',
        errorText: '复制失败 ❌',
        // 提示显示时长（毫秒）
        tipDuration: 2000,
        // 按钮位置：top-right / top-left / bottom-right / bottom-left
        position: 'top-right',
        // 按钮样式配置
        buttonStyle: {
            padding: '6px 8px', // 调整内边距适配图标
            fontSize: '14px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', // 新增：让图标居中
            alignItems: 'center',
            justifyContent: 'center'
        },
        // 按钮hover样式
        buttonHoverStyle: {
            backgroundColor: '#42b983'
        },
        // 排除特定代码块（通过类名）
        excludeClass: 'no-copy',
        // 是否显示行号的代码块兼容
        supportLineNumbers: true,
        // 按钮显示/隐藏的过渡时长（毫秒）
        transitionDuration: 200
    };

    // 2. 注册docsify插件
    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = window.$docsify.plugins || [];
    window.$docsify.plugins.push(function(hook, vm) {
        // 合并用户配置和默认配置
        const options = Object.assign({}, defaultOptions, vm.config.codeCopy || {});

        // 3. 页面渲染完成后处理所有代码块
        hook.doneEach(function() {
            // 获取所有代码块容器
            const codeBlocks = document.querySelectorAll('pre');

            // 遍历每个代码块添加复制按钮
            codeBlocks.forEach(pre => {
                // 跳过标记为排除的代码块
                if (pre.classList.contains(options.excludeClass)) return;

                // 避免重复添加按钮
                if (pre.querySelector('.docsify-code-copy-btn')) return;

                // 获取代码内容（兼容带行号的情况）
                let codeContent = '';
                const codeEl = pre.querySelector('code');

                if (options.supportLineNumbers && pre.classList.contains('line-numbers')) {
                    const lines = codeEl.innerHTML.split('\n');
                    codeContent = lines.map(line => line.replace(/^\s*\d+\s+/, '')).join('\n').trim();
                } else {
                    codeContent = codeEl.textContent || codeEl.innerText;
                }

                // 4. 创建复制按钮
                const copyBtn = document.createElement('button');
                copyBtn.className = 'docsify-code-copy-btn';
                copyBtn.title = '复制代码';
                // 核心修改：设置按钮HTML内容（支持图标）
                copyBtn.innerHTML = options.copyContent;

                // 设置按钮基础样式
                Object.assign(copyBtn.style, {
                    position: 'absolute',
                    zIndex: 10,
                    display: 'none', // 默认完全隐藏按钮
                    opacity: 0,
                    transition: `all ${options.transitionDuration}ms ease`,
                    ...options.buttonStyle
                });

                // 设置按钮位置
                setButtonPosition(copyBtn, pre, options.position);

                // 5. 按钮hover样式
                copyBtn.addEventListener('mouseenter', () => {
                    Object.assign(copyBtn.style, options.buttonHoverStyle);
                });
                copyBtn.addEventListener('mouseleave', () => {
                    Object.assign(copyBtn.style, options.buttonStyle);
                });

                // 6. 复制核心逻辑（适配图标/文字切换）
                copyBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(codeContent);
                        // 替换为成功提示文字
                        copyBtn.innerText = options.successText;
                    } catch (err) {
                        // 降级方案
                        const textArea = document.createElement('textarea');
                        textArea.value = codeContent;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        // 替换为失败/成功提示文字
                        copyBtn.innerText = err ? options.errorText : options.successText;
                    }

                    // 恢复原图标/内容
                    setTimeout(() => {
                        copyBtn.innerHTML = options.copyContent;
                        // 提示结束后隐藏按钮（原有逻辑）
                        if (!pre.matches(':hover') && document.activeElement !== codeEl) {
                            hideCopyBtn(copyBtn, options);
                        }
                    }, options.tipDuration);
                });

                // 7. 代码块事件监听（控制按钮显隐）
                pre.addEventListener('mouseenter', () => showCopyBtn(copyBtn, options));
                pre.addEventListener('mouseleave', () => {
                    if (!copyBtn.matches(':hover')) {
                        setTimeout(() => hideCopyBtn(copyBtn, options), 100);
                    }
                });
                codeEl.addEventListener('focus', () => showCopyBtn(copyBtn, options));
                codeEl.addEventListener('blur', () => {
                    if (!pre.matches(':hover')) hideCopyBtn(copyBtn, options);
                });
                copyBtn.addEventListener('mouseleave', () => {
                    if (!pre.matches(':hover') && document.activeElement !== codeEl) {
                        hideCopyBtn(copyBtn, options);
                    }
                });

                // 8. 添加按钮到代码块
                pre.style.position = 'relative';
                pre.appendChild(copyBtn);
            });
        });

        // 辅助函数：设置按钮位置
        function setButtonPosition(btn, pre, position) {
            switch (position) {
                case 'top-right': btn.style.top = '8px'; btn.style.right = '8px'; break;
                case 'top-left': btn.style.top = '8px'; btn.style.left = '8px'; break;
                case 'bottom-right': btn.style.bottom = '8px'; btn.style.right = '8px'; break;
                case 'bottom-left': btn.style.bottom = '8px'; btn.style.left = '8px'; break;
            }
        }

        // 辅助函数：显示按钮
        function showCopyBtn(btn, options) {
            btn.style.display = 'flex'; // 适配图标居中
            setTimeout(() => btn.style.opacity = 1, 10);
        }

        // 辅助函数：隐藏按钮
        function hideCopyBtn(btn, options) {
            btn.style.opacity = 0;
            setTimeout(() => btn.style.display = 'none', options.transitionDuration);
        }
    });
})(window, document);