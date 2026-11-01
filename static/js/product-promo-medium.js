(function() {
    // 计算站点根路径：根据脚本自身地址推导，兼容根目录与子目录页面
    var SITE_ROOT = (function() {
        var script = document.currentScript;
        if (!script || !script.src) {
            return '';
        }
        var idx = script.src.indexOf('/static/js/');
        return idx >= 0 ? script.src.substring(0, idx + 1) : '';
    })();

    // 配置参数
    var config = {
        title: '📢 精选推荐',
        content: '',
        productName: '考研英语冲击70分训练营',
        productDesc: '我用"背"的方法考到了70+，现在想带几个人一起背。60天，每天打卡，我盯着你背。',
        imageUrl: SITE_ROOT + 'static/images/dragonfly.png',
        linkUrl: SITE_ROOT + 'comment_list.html',
        buttonText: '了解更多',

        // 中等强度配置
        position: 'right',
        bottom: '100px',
        width: '250px',
        autoShowDelay: 1500, // 1.5秒后显示
        closeCooldownHours: 0, // 关闭后2小时内不再显示（可根据需要调整）

        // 样式配置
        theme: {
            primaryColor: '#4a94d8',
            accentColor: '#ffd700',
            backgroundColor: '#ffffff',
            borderRadius: '10px'
        }
    };

    // 获取cookie
    function getCookie(name) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.indexOf(name + '=') === 0) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    }

    // 设置cookie
    function setCookie(name, value, hours) {
        var expires = '';
        if (hours) {
            var date = new Date();
            date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + value + expires + '; path=/';
    }

    // 检查是否应该显示
    function shouldShow() {
        var cookieName = 'promo_closed_' + encodeURIComponent(config.productName);
        var closedTime = getCookie(cookieName);

        if (closedTime) {
            var now = new Date().getTime();
            var closedAt = parseInt(closedTime);
            var cooldownMs = config.closeCooldownHours * 60 * 60 * 1000;

            // 如果还在冷却时间内，不显示
            if (now - closedAt < cooldownMs) {
                return false;
            }
        }

        return true; // 其他情况都显示
    }

    // 创建浮动窗口
    function createFloatWindow() {
        if (!shouldShow()) {
            return;
        }

        var floatWindow = document.createElement('div');
        floatWindow.id = 'product-promo-medium';
        floatWindow.style.cssText = [
            'position: fixed',
            config.position + ': 20px',
            'bottom: ' + config.bottom,
            'width: ' + config.width,
            'background: ' + config.theme.backgroundColor,
            'border-radius: ' + config.theme.borderRadius,
            'box-shadow: 0 6px 16px rgba(0,0,0,0.12)',
            'z-index: 9999',
            'padding: 20px',
            'box-sizing: border-box',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            'border: 1px solid #e8e8e8',
            'transition: all 0.3s ease',
            'opacity: 0',
            'transform: translateY(20px)'
        ].join(';');

        var html = '<div style="position: relative;">';

        // 关闭按钮（更美观的设计）
        html += '<button onclick="closePromoWindow()" style="position: absolute; top: -12px; right: -12px; background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 16px; line-height: 28px; padding: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.3s;" onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'scale(1)\'">×</button>';

        // 标题区域
        html += '<div style="text-align: center; margin-bottom: 15px;">';
        html += '<h3 style="margin: 0; color: ' + config.theme.primaryColor + '; font-size: 18px; font-weight: bold;">' + config.title + '</h3>';
        html += '</div>';

        // 产品图片
        if (config.imageUrl) {
            html += '<div style="text-align: center; margin-bottom: 15px; background: #f8f9fa; border-radius: 8px; padding: 10px;">';
            html += '<img src="' + config.imageUrl + '" alt="' + config.productName + '" style="max-width: 100%; height: auto; border-radius: 4px;">';
            html += '</div>';
        }

        // 产品信息
        html += '<div style="margin-bottom: 15px;">';
        html += '<h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px; text-align: center;">' + config.productName + '</h4>';
        html += '<p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5; text-align: center;">' + config.productDesc + '</p>';
        html += '</div>';

        // CTA按钮
        html += '<div style="text-align: center;">';
        html += '<a href="' + config.linkUrl + '" target="_blank" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; border-radius: 25px; text-decoration: none; font-size: 15px; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);">' + config.buttonText + '</a>';
        html += '</div>';

        html += '</div>';

        floatWindow.innerHTML = html;

        // 全局关闭函数
        window.closePromoWindow = function() {
            floatWindow.style.opacity = '0';
            floatWindow.style.transform = 'translateY(20px)';

            setTimeout(function() {
                floatWindow.remove();
            }, 300);

            // 记录关闭时间
            var cookieName = 'promo_closed_' + encodeURIComponent(config.productName);
            var now = new Date().getTime();
            setCookie(cookieName, now.toString(), config.closeCooldownHours);
        };

        // 显示窗口
        setTimeout(function() {
            document.body.appendChild(floatWindow);

            // 触发进入动画
            setTimeout(function() {
                floatWindow.style.opacity = '1';
                floatWindow.style.transform = 'translateY(0)';
            }, 50);
        }, config.autoShowDelay);

        // 添加hover效果
        var ctaLink = floatWindow.querySelector('a');
        if (ctaLink) {
            ctaLink.onmouseover = function() {
                this.style.transform = 'scale(1.03)';
                this.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
            };
            ctaLink.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
            };
        }
    }

    // 移动端适配
    function init() {
        if (window.innerWidth < 768) {
            config.width = '240px';
            config.bottom = '80px';
            config.closeCooldownHours = 0; // 移动端冷却时间更短
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createFloatWindow);
        } else {
            createFloatWindow();
        }
    }

    init();
})();