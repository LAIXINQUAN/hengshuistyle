/**
 * 站点主题切换
 * 通过 html[data-theme] 控制浅色 / 深色，选择结果保存在 localStorage。
 * 页面 head 中的内联脚本会提前设置 data-theme，避免首屏闪烁。
 */
(function () {
    var STORAGE_KEY = 'hst-theme';

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindSwitches);
    } else {
        bindSwitches();
    }

    // 页面内联脚本在 load 阶段绑定事件，因此等 load 之后再覆盖
    window.addEventListener('load', setupBackToTop);
})();
