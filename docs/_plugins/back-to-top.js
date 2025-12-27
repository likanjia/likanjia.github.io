// plugins/docsify-back-to-top-plugin.js
(function(window, document) {
    // 默认配置
    const defaultOptions = {
        // 显示阈值（滚动超过多少px显示按钮）
        threshold: 300,
        // 按钮位置
        positionBottom: '30px',
        positionRight: '30px',
        // 样式配置
        style: {
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        },
        backgroundColor: '#42b983',
        hoverBackgroundColor: '#16a085',
        styleColor: '#fff',
        styleWidth: '50px',
        styleHeight: '50px',
        // 按钮内容（支持HTML，如图标）
        content: '<i class="fa fa-arrow-up"></i>',
        // 按钮提示文字
        title: '返回顶部',
        // 是否平滑滚动
        smoothScroll: true
    };

    // 注册docsify插件
    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = window.$docsify.plugins || [];
    window.$docsify.plugins.push(function(hook, vm) {
        // 合并用户配置和默认配置
        const options = Object.assign({}, defaultOptions, vm.config.backToTop || {});

        // 1. 页面初始化完成后，注入样式和DOM元素
        hook.doneEach(function() {
            // 避免重复创建按钮
            if (document.getElementById('docsify-back-to-top')) return;

            // ========== 注入样式 ==========
            const style = document.createElement('style');
            style.innerHTML = `
                #docsify-back-to-top {
                  position: fixed;
                  bottom: ${options.positionBottom};
                  right: ${options.positionRight};
                  width: ${options.styleWidth};
                  height: ${options.styleHeight};
                  line-height: ${options.styleHeight};
                  text-align: center;
                  background-color: ${options.backgroundColor}; 
                  color: ${options.styleColor};
                  border-radius: ${options.style.borderRadius};
                  box-shadow: ${options.style.boxShadow};
                  font-size: 22px;
                  cursor: pointer;
                  opacity: 0;
                  visibility: hidden;
                  transition: opacity 0.3s ease, visibility 0.3s ease;
                  z-index: 9999;
                }
                #docsify-back-to-top:hover {
                  background-color: ${options.hoverBackgroundColor};
                  transform: scale(1.1);
                }
                #docsify-back-to-top.show {
                  opacity: 1;
                  visibility: visible;
                }
                `;
            document.head.appendChild(style);

            // ========== 创建返回顶部按钮 ==========
            const backToTopBtn = document.createElement('div');
            backToTopBtn.id = 'docsify-back-to-top';
            backToTopBtn.title = options.title;
            backToTopBtn.innerHTML = options.content;
            document.body.appendChild(backToTopBtn);

            // ========== 核心交互逻辑 ==========
            // 监听滚动事件，控制按钮显示/隐藏
            window.addEventListener('scroll', function() {
                if (window.scrollY > options.threshold) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
            });

            // 点击按钮返回顶部
            backToTopBtn.addEventListener('click', function() {
                if (options.smoothScroll && window.scrollTo) {
                    // 平滑滚动
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    // 兼容不支持smooth的浏览器
                    window.scrollTo(0, 0);
                }
            });
        });

        // 2. 页面销毁前移除事件监听（可选，优化性能）
        hook.beforeEach(function() {
            const backToTopBtn = document.getElementById('docsify-back-to-top');
            if (backToTopBtn) {
                backToTopBtn.removeEventListener('click', null);
            }
            window.removeEventListener('scroll', null);
        });
    });
})(window, document);