/**
 * Docsify 自定义导航栏插件
 * 功能：导航栏固定顶部 + 标题右对齐
 * 作者：自定义
 * 版本：1.0.0
 */
(function() {
    // 默认配置项
    const defaultOptions = {
        navHeight: '50px',         // 导航栏高度
        navBgColor: '#fff',        // 导航栏背景色
        navBorderColor: '#eee',    // 导航栏边框色
        titleRightGap: '2rem',     // 标题右侧间距（PC端）
        titleRightGapMobile: '1rem', // 标题右侧间距（移动端）
        contentPaddingTop: '60px', // 内容区顶部内边距
        zIndex: 1000               // 导航栏层级
    };

    // 注册 Docsify 插件
    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = [
        ...(window.$docsify.plugins || []),
        function(hook, vm) {
            // 合并用户配置和默认配置
            const options = {
                ...defaultOptions,
                ...(window.$docsify.customNavbar || {})
            };

            // 页面初始化完成后注入样式和逻辑
            hook.ready(function() {
                injectCustomStyles(options);
                adjustNavbarElements();
            });
        }
    ];

    /**
     * 注入自定义样式
     * @param {Object} options 配置项
     */
    function injectCustomStyles(options) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
      /* 侧边栏切换按钮适配 */
      .sidebar-toggle {
        top: 0 !important;
      }
      
      /* 导航栏核心样式 - 固定顶部 */
      nav.app-nav {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: ${options.zIndex} !important;
        background-color: ${options.navBgColor} !important;
        border-bottom: 1px solid ${options.navBorderColor} !important;
        padding: 0 1rem !important;
        height: ${options.navHeight} !important;
        line-height: ${options.navHeight} !important;
        box-sizing: border-box !important;
      }
      
      /* 主内容区适配 - 避免被导航栏遮挡 */
      .markdown-section {
        padding-top: ${options.contentPaddingTop} !important;
      }
      
      /* 导航栏标题右对齐 */
      nav.app-nav > ul > li:first-child {
        position: absolute !important;
        right: ${options.titleRightGap} !important;
        top: 0 !important;
      }
      
      /* 导航栏菜单项基础样式 */
      nav.app-nav > ul {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      nav.app-nav > ul > li {
        display: inline-block !important;
        margin-right: 1rem !important;
      }
      
      /* 导航栏标题链接样式 */
      nav.app-nav > ul > li:first-child a {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* 响应式适配 - 移动端 */
      @media (max-width: 768px) {
        nav.app-nav > ul > li:first-child {
          right: ${options.titleRightGapMobile} !important;
        }
      }
    `;
        document.head.appendChild(style);
    }

    /**
     * 调整导航栏元素（可选增强）
     */
    function adjustNavbarElements() {
        // 确保导航栏标题元素加载完成
        const observer = new MutationObserver((mutations) => {
            const navTitle = document.querySelector('nav.app-nav > ul > li:first-child a');
            if (navTitle) {
                observer.disconnect(); // 找到元素后停止监听
                navTitle.style.display = 'inline-block';
            }
        });

        // 监听导航栏区域的变化
        const nav = document.querySelector('nav.app-nav');
        if (nav) {
            observer.observe(nav, { childList: true, subtree: true });
        }
    }
})();