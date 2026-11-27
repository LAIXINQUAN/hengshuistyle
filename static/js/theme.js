/**
 * 站点主题切换
 * 通过 html[data-theme] 控制浅色 / 深色，选择结果保存在 localStorage。
 * 页面 head 中的内联脚本会提前设置 data-theme，避免首屏闪烁。
 * 同时负责三处通用交互：移动端教程目录折叠、正文表格横向滚动、
 * 首页段落的滚动淡入。
 */
(function () {
    var STORAGE_KEY = 'hst-theme';
    var MOBILE_QUERY = '(max-width: 767.98px)';

    /**
     * 判断当前是否需要减弱动效
     * @returns {boolean} 系统开启了「减少动态效果」时为 true
     */
    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * 在 html 上打标记，声明滚动淡入可用
     * 未打标记时 CSS 不会隐藏内容，脚本失败也不影响阅读
     */
    function markRevealReady() {
        if (!prefersReducedMotion()) {
            document.documentElement.classList.add('js-reveal');
        }
    }

    /**
     * 读取当前实际生效的主题
     * @returns {'dark'|'light'} 当前主题
     */
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    /**
     * 应用主题并同步所有切换开关的状态
     * @param {'dark'|'light'} theme 目标主题
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            // 隐私模式下 localStorage 可能不可用，忽略即可
        }
        syncSwitches(theme === 'dark');
    }

    /**
     * 同步开关外观与无障碍状态
     * @param {boolean} isDark 是否为深色
     */
    function syncSwitches(isDark) {
        var nodes = document.querySelectorAll('.theme-canvas');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.toggle('active', isDark);
            var wrap = nodes[i].closest('.theme-switch');
            if (wrap) {
                wrap.setAttribute('aria-checked', isDark ? 'true' : 'false');
            }
        }
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    /**
     * 为页面上的开关绑定点击与键盘事件
     */
    function bindSwitches() {
        var switches = document.querySelectorAll('.theme-switch');
        for (var i = 0; i < switches.length; i++) {
            var el = switches[i];
            if (el.getAttribute('data-bound') === '1') {
                continue;
            }
            el.setAttribute('data-bound', '1');
            el.addEventListener('click', toggleTheme);
            el.addEventListener('keydown', function (event) {
                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault();
                    toggleTheme();
                }
            });
        }
        syncSwitches(getTheme() === 'dark');
    }

    /**
     * 统一「回到顶部」小火箭的行为：
     * 页面原有内联脚本在 onload 时绑定滚动逻辑，这里在 load 之后覆盖，
     * 改为滚动超过 320px 才显示，并使用平滑滚动。
     */
    function setupBackToTop() {
        var btn = document.getElementById('gotop');
        if (!btn) {
            return;
        }

        // 覆盖页面自带的显示/隐藏判断
        window.onscroll = function () {
            btn.style.display = window.pageYOffset > 320 ? 'block' : 'none';
        };

        // 覆盖页面自带的点击逻辑
        btn.onclick = function (event) {
            if (event) {
                event.preventDefault();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.onscroll();
    }

    /**
     * 在指定节点的一级子元素中查找带某个类名的元素
     * @param {HTMLElement} parent 父节点
     * @param {string} className 类名
     * @returns {HTMLElement|null} 找到的元素
     */
    function findChildByClass(parent, className) {
        if (!parent) {
            return null;
        }
        for (var i = 0; i < parent.children.length; i++) {
            if (parent.children[i].classList.contains(className)) {
                return parent.children[i];
            }
        }
        return null;
    }

    /**
     * 移动端教程目录折叠：
     * 窄屏时在正文上方插入「教程目录」按钮，目录默认收起，
     * 正文直接占满整行；回到桌面宽度时自动移除按钮并还原目录。
     */
    function setupMobileToc() {
        var row = document.querySelector('.row.content');
        if (!row) {
            return;
        }
        var side = findChildByClass(row, 'col-3');
        if (!side) {
            return;
        }

        var isMobile = window.matchMedia(MOBILE_QUERY).matches;
        var btn = document.querySelector('.toc-toggle');

        if (!isMobile) {
            // 桌面端：清掉窄屏专用状态
            if (btn) {
                btn.parentNode.removeChild(btn);
            }
            side.classList.remove('is-collapsed');
            return;
        }

        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'toc-toggle';
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '<span>教程目录</span><span class="toc-caret" aria-hidden="true">▾</span>';
            row.parentNode.insertBefore(btn, row);
            btn.addEventListener('click', function () {
                var collapsed = side.classList.toggle('is-collapsed');
                btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            });
        }

        // 默认收起，阅读时把整屏宽度留给正文
        side.classList.add('is-collapsed');
        btn.setAttribute('aria-expanded', 'false');
    }

    /**
     * 给正文中的表格套上横向滚动容器
     * 窄屏时表格可在容器内左右拖动，避免把整页撑出横向滚动条；
     * 列宽按内容自然分配，两列的说明性表格仍然自动换行。
     */
    function wrapScrollableTables() {
        var tables = document.querySelectorAll(
            'table.table, .row.content > .col-9 table, .row.content > .col-12 table, .announcement-card table'
        );
        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var parent = table.parentNode;
            if (!parent || (parent.classList && parent.classList.contains('table-scroll'))) {
                continue;
            }
            var wrap = document.createElement('div');
            wrap.className = 'table-scroll';
            parent.insertBefore(wrap, table);
            wrap.appendChild(table);
        }
    }

    /**
     * 首页滚动淡入：
     * 使用 IntersectionObserver 监听 .reveal 元素，进入视口后加 is-in。
     * 不支持该 API 时直接显示全部内容。
     */
    function setupReveal() {
        var items = document.querySelectorAll('.reveal');
        if (!items.length) {
            return;
        }

        /**
         * 一次性显示所有待出现的元素
         */
        function showAll() {
            for (var i = 0; i < items.length; i++) {
                items[i].classList.add('is-in');
            }
        }

        if (!('IntersectionObserver' in window)) {
            showAll();
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('is-in');
                    observer.unobserve(entries[i].target);
                }
            }
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        for (var j = 0; j < items.length; j++) {
            observer.observe(items[j]);
        }
    }

    /**
     * 初始化所有通用交互
     * 绑定主题开关、处理窄屏目录与表格，并启动滚动淡入
     */
    function init() {
        markRevealReady();
        bindSwitches();
        setupMobileToc();
        wrapScrollableTables();
        setupReveal();
    }

    /**
     * 窗口尺寸变化时重新判断目录形态
     * 用 150ms 的去抖，避免拖动窗口时频繁重排
     */
    function handleResize() {
        var timer = null;
        return function () {
            window.clearTimeout(timer);
            timer = window.setTimeout(setupMobileToc, 150);
        };
    }

    markRevealReady();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('resize', handleResize());

    // 页面内联脚本在 load 阶段绑定事件，因此等 load 之后再覆盖
    window.addEventListener('load', setupBackToTop);
})();
