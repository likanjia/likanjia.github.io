// docsify-custom-navbar.js

(function (window) {
    function CustomNavbarPlugin(opts = {}) {
        const config = Object.assign(
            {
                // 导航项配置（支持嵌套）
                items: [
                    { text: '首页', link: '/' },
                    { text: '指南', link: '/guide/' },
                    {
                        text: '开发',
                        children: [
                            { text: 'API', link: '/api/' },
                            { text: '插件', link: '/plugins/' }
                        ]
                    },
                    { text: 'GitHub', link: 'https://github.com/yourname/repo', target: '_blank' }
                ],
                // 样式配置
                style: {
                    backgroundColor: '#2c3e50',
                    color: '#ecf0f1',
                    hoverColor: '#3498db',
                    activeColor: '#e74c3c',
                    fontSize: '16px',
                    height: '56px'
                },
                // 移动端断点
                mobileBreakpoint: 768,
                // 是否自动高亮当前路径
                autoActive: true
            },
            opts
        );

        return function (hook, vm) {
            let navbarEl;
            let menuOpen = false;

            // 创建导航栏 DOM
            function createNavbar() {
                if (document.querySelector('#docsify-custom-navbar')) return;

                navbarEl = document.createElement('nav');
                navbarEl.id = 'docsify-custom-navbar';
                navbarEl.className = 'docsify-custom-navbar';
                navbarEl.innerHTML = `
          <div class="navbar-container">
            <div class="navbar-brand">${config.brand || ''}</div>
            <button class="navbar-toggle" aria-label="Toggle navigation">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <ul class="navbar-menu"></ul>
          </div>
        `;

                // 注入样式
                injectStyles();

                document.body.insertBefore(navbarEl, document.body.firstChild);

                renderMenu();
                bindEvents();
            }

            // 渲染菜单项（递归支持子菜单）
            function renderMenu() {
                const menuEl = navbarEl.querySelector('.navbar-menu');
                menuEl.innerHTML = '';

                config.items.forEach(item => {
                    const li = document.createElement('li');
                    if (item.children && item.children.length) {
                        // 有子菜单
                        li.className = 'navbar-dropdown';
                        const button = document.createElement('button');
                        button.className = 'dropdown-toggle';
                        button.textContent = item.text;
                        li.appendChild(button);

                        const subMenu = document.createElement('ul');
                        subMenu.className = 'dropdown-menu';
                        item.children.forEach(child => {
                            const childLi = createMenuItem(child);
                            subMenu.appendChild(childLi);
                        });
                        li.appendChild(subMenu);
                    } else {
                        // 普通链接
                        const link = createMenuItem(item);
                        li.appendChild(link);
                    }
                    menuEl.appendChild(li);
                });

                updateActiveItem();
            }

            // 创建单个菜单项
            function createMenuItem(item) {
                const isExternal = item.link.startsWith('http');
                const el = isExternal ? document.createElement('a') : document.createElement('a');
                el.href = item.link;
                el.textContent = item.text;
                if (item.target) el.target = item.target;
                if (isExternal) el.rel = 'noopener noreferrer';
                return el;
            }

            // 更新当前激活项
            function updateActiveItem() {
                if (!config.autoActive) return;
                const links = navbarEl.querySelectorAll('a');
                links.forEach(link => link.classList.remove('active'));
                const currentPath = window.location.pathname;
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === currentPath || (currentPath.startsWith(href) && href !== '/')) {
                        link.classList.add('active');
                    }
                });
            }

            // 绑定事件
            function bindEvents() {
                // 汉堡菜单
                const toggleBtn = navbarEl.querySelector('.navbar-toggle');
                toggleBtn.addEventListener('click', () => {
                    menuOpen = !menuOpen;
                    navbarEl.classList.toggle('mobile-open', menuOpen);
                });

                // 页面跳转后更新激活状态（Docsify SPA）
                hook.doneEach(() => {
                    updateActiveItem();
                    if (menuOpen) {
                        navbarEl.classList.remove('mobile-open');
                        menuOpen = false;
                    }
                });

                // 点击外部关闭下拉（桌面端）
                document.addEventListener('click', (e) => {
                    if (!navbarEl.contains(e.target)) {
                        closeAllDropdowns();
                    }
                });
            }

            function closeAllDropdowns() {
                const toggles = navbarEl.querySelectorAll('.dropdown-toggle[aria-expanded="true"]');
                toggles.forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.nextElementSibling.classList.remove('show');
                });
            }

            // 注入 CSS 样式
            function injectStyles() {
                if (document.getElementById('docsify-custom-navbar-style')) return;
                const s = config.style;
                const css = `
          #docsify-custom-navbar {
            background-color: ${s.backgroundColor};
            color: ${s.color};
            height: ${s.height};
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
          }
          .navbar-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            height: 100%;
          }
          .navbar-menu {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .navbar-menu > li {
            position: relative;
            margin: 0 15px;
          }
          .navbar-menu a,
          .dropdown-toggle {
            color: ${s.color} !important;
            text-decoration: none;
            font-size: ${s.fontSize};
            padding: 8px 0;
            display: block;
            background: none;
            border: none;
            cursor: pointer;
            font-family: inherit;
          }
          .navbar-menu a:hover,
          .dropdown-toggle:hover {
            color: ${s.hoverColor} !important;
          }
          .navbar-menu a.active {
            color: ${s.activeColor} !important;
            font-weight: bold;
          }
          /* 下拉菜单 */
          .dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background: ${s.backgroundColor};
            min-width: 160px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            list-style: none;
            padding: 8px 0;
            margin: 0;
            border-radius: 4px;
          }
          .dropdown-menu.show {
            display: block;
          }
          .dropdown-menu a {
            padding: 8px 16px;
          }
          .dropdown-menu a:hover {
            background: rgba(0,0,0,0.1);
          }
          /* 移动端 */
          .navbar-toggle {
            display: none;
            flex-direction: column;
            justify-content: space-around;
            width: 24px;
            height: 24px;
            background: transparent;
            border: none;
            cursor: pointer;
          }
          .navbar-toggle span {
            height: 2px;
            width: 100%;
            background: ${s.color};
            transition: all 0.3s;
          }
          @media (max-width: ${config.mobileBreakpoint}px) {
            .navbar-toggle { display: flex; }
            .navbar-menu {
              position: fixed;
              top: ${s.height};
              left: 0;
              right: 0;
              background: ${s.backgroundColor};
              flex-direction: column;
              padding: 16px 0;
              clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
              transition: clip-path 0.3s ease;
            }
            #docsify-custom-navbar.mobile-open .navbar-menu {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
            .navbar-menu li { margin: 8px 0; }
            .dropdown-menu {
              position: static;
              box-shadow: none;
              background: rgba(0,0,0,0.1);
              border-radius: 0;
            }
          }
        `;
                const style = document.createElement('style');
                style.id = 'docsify-custom-navbar-style';
                style.textContent = css;
                document.head.appendChild(style);
            }

            // 初始化
            hook.mounted(createNavbar);
        };
    }

    if (typeof window !== 'undefined') {
        window.DocsifyCustomNavbar = CustomNavbarPlugin;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CustomNavbarPlugin;
    }
})(window);