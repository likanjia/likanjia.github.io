(function () {
    // 插件默认配置
    const defaultOptions = {
        maxLevel: 6, // 默认最大支持3级标题(h1-h3)
        tocClass: 'right-toc', // 目录容器类名
        activeClass: 'right-toc-active', // 当前高亮类名
        offsetTop: 20, // 滚动偏移量（用于精准高亮）
        width: '260px', // 目录宽度
        gapRight: '20px' // 目录与右侧页面边缘的间距
    };

    // 初始化右侧目录插件
    function initRightToc(hook, vm) {
        // 合并用户配置与默认配置
        const options = Object.assign({}, defaultOptions, vm.config.rightToc || {});
        let tocContainer = null;
        let tocItems = [];
        let headingElements = [];

        // 1. 钩子：页面加载完成后创建目录容器（只创建一次）
        hook.mounted(function () {
            // 创建目录容器
            tocContainer = document.createElement('div');
            tocContainer.className = options.tocClass;
            tocContainer.innerHTML = '<div class="right-toc-content"></div>';
            document.body.appendChild(tocContainer);

            // 传递配置参数到 CSS 变量，实现样式动态控制
            document.documentElement.style.setProperty('--right-toc-width', options.width);
            document.documentElement.style.setProperty('--right-toc-gap', options.gapRight);
        });

        // 2. 钩子：每次文档内容渲染完成后生成目录
        hook.afterEach(function (html, next) {
            // 延迟执行，确保DOM已完全渲染
            setTimeout(() => {
                generateToc(options, vm, tocContainer);
                // 缓存标题元素和目录项
                headingElements = getHeadingElements(options);
                tocItems = tocContainer.querySelectorAll(`.${options.tocClass}-item`);
            }, 0);
            next(html);
        });

        // 3. 滚动监听：自动高亮当前可视区域的标题
        window.addEventListener('scroll', function () {
            if (!headingElements.length || !tocItems.length) return;
            highlightActiveHeading(options, headingElements, tocItems);
        });

        // 4. 目录项点击事件：平滑滚动到对应标题
        document.addEventListener('click', function (e) {
            if (e.target.closest(`.${options.tocClass}-item`)) {
                const tocItem = e.target.closest(`.${options.tocClass}-item`);
                const headingId = tocItem.getAttribute('data-heading-id');
                const targetHeading = document.getElementById(headingId);
                if (targetHeading) {
                    // 平滑滚动
                    window.scrollTo({
                        top: targetHeading.offsetTop - options.offsetTop,
                        // behavior: 'smooth'
                    });
                    // 手动触发高亮
                    highlightSpecificItem(tocItem, options, tocItems);
                }
            }
        });
    }

    // 获取符合条件的标题元素（h1-h{maxLevel}）
    function getHeadingElements(options) {
        const headings = [];
        for (let i = 1; i <= options.maxLevel; i++) {
            const elements = document.querySelectorAll(`#main h${i}`);
            elements.forEach(el => {
                // 给标题添加唯一ID（如果没有的话）
                if (!el.id) {
                    el.id = `heading-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }
                headings.push(el);
            });
        }
        // 按页面位置排序（从上到下）
        return headings.sort((a, b) => a.offsetTop - b.offsetTop);
    }

    // 生成目录结构
    function generateToc(options, vm, tocContainer) {
        const headingElements = getHeadingElements(options);
        const tocContent = tocContainer.querySelector(`.${options.tocClass}-content`);
        if (!tocContent) return;

        // 创建目录列表
        const tocList = document.createElement('ul');
        tocList.className = `${options.tocClass}-list`;
        tocList.innerHTML = '';

        // 遍历标题生成目录项
        headingElements.forEach(heading => {
            const level = parseInt(heading.tagName.replace('H', ''));
            const tocItem = document.createElement('li');
            tocItem.className = `${options.tocClass}-item ${options.tocClass}-item-h${level}`;
            tocItem.setAttribute('data-heading-id', heading.id);
            tocItem.textContent = heading.textContent.trim();
            tocList.appendChild(tocItem);
        });

        // 替换目录内容
        tocContent.innerHTML = '';
        tocContent.appendChild(tocList);

        // 首次加载触发高亮
        setTimeout(() => {
            highlightActiveHeading(options, headingElements, tocList.querySelectorAll(`.${options.tocClass}-item`));
        }, 100);
    }

    // 高亮当前可视区域的标题对应目录项
    function highlightActiveHeading(options, headingElements, tocItems) {
        const scrollTop = window.scrollY + options.offsetTop;
        let activeIndex = 0;

        // 找到当前可视区域最上方的标题
        for (let i = 0; i < headingElements.length; i++) {
            const heading = headingElements[i];
            if (scrollTop >= heading.offsetTop) {
                activeIndex = i;
            } else {
                break;
            }
        }

        // 移除所有高亮，给当前标题添加高亮
        tocItems.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add(options.activeClass);
            } else {
                item.classList.remove(options.activeClass);
            }
        });
    }

    // 手动高亮指定目录项
    function highlightSpecificItem(targetItem, options, tocItems) {
        tocItems.forEach(item => {
            if (item === targetItem) {
                item.classList.add(options.activeClass);
            } else {
                item.classList.remove(options.activeClass);
            }
        });
    }

    // 注册docsify插件
    if (window.$docsify) {
        window.$docsify.plugins = window.$docsify.plugins || [];
        window.$docsify.plugins.push(initRightToc);
    }
})();