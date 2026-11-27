$(function() {
    // 分享按钮点击事件
    $('#btnShare').click(function() {
        // (1) 获取 meta description 的内容
        var description = $('meta[name="description"]').attr('content') || '';

        // (2) 获取当前页面的URL
        var url = window.location.href;

        // 组合要复制的内容：描述 + 换行 + URL
        var shareText = '【衡水体学习网】' + description + ' ' + url;

        // 使用 Clipboard API 复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(function() {
                // 复制成功，显示酷炫弹框
                showCoolModal(shareText);
            }).catch(function(err) {
                console.error('复制失败:', err);
                fallbackCopy(shareText);
            });
        } else {
            fallbackCopy(shareText);
        }
    });

    // 关闭弹框
    $('#btnModalClose').click(function() {
        hideCoolModal();
    });

    // 点击遮罩层关闭
    $('#shareModalOverlay').click(function(e) {
        if (e.target === this) {
            hideCoolModal();
        }
    });

    // 显示酷炫弹框
    function showCoolModal(shareText) {
        // 设置复制内容预览
        $('#copiedText').text(shareText);

        // 显示弹框
        var overlay = $('#shareModalOverlay');
        overlay.addClass('show');

        // 重置动画
        var modal = $('#shareModal');
        modal.css('animation', 'none');
        modal[0].offsetHeight; // 触发回流
        modal.css('animation', 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)');

        // 创建粒子特效
        createParticles();

        // 创建波纹特效
        createRipple();

        // 重置成功图标动画
        var circle = $('.success-circle');
        circle.css('animation', 'none');
        circle[0].offsetHeight;
        circle.css('animation', 'pulse 0.6s ease');

        // 防止背景滚动
        $('body').css('overflow', 'hidden');
    }

    // 隐藏弹框
    function hideCoolModal() {
        var overlay = $('#shareModalOverlay');
        overlay.css('animation', 'fadeOut 0.3s ease');

        setTimeout(function() {
            overlay.removeClass('show');
            overlay.css('animation', '');
            // 恢复背景滚动
            $('body').css('overflow', '');
            // 清除粒子
            $('.particle, .ripple').remove();
        }, 300);
    }

    // 创建粒子特效
    function createParticles() {
        var wrapper = $('#successIconWrapper');
        var colors = ['#667eea', '#764ba2', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'];

        // 先清除旧粒子
        $('.particle').remove();

        for (var i = 0; i < 12; i++) {
            var particle = $('<div class="particle"></div>');
            var angle = (i / 12) * 360;
            var distance = 40 + Math.random() * 30;
            var tx = Math.cos(angle * Math.PI / 180) * distance;
            var ty = Math.sin(angle * Math.PI / 180) * distance;

            particle.css({
                'background': colors[Math.floor(Math.random() * colors.length)],
                '--tx': tx + 'px',
                '--ty': ty + 'px',
                'left': '50%',
                'top': '50%',
                'margin-left': '-4px',
                'margin-top': '-4px',
                'animation-delay': (Math.random() * 0.2) + 's'
            });

            wrapper.append(particle);
        }

        // 粒子动画结束后清除
        setTimeout(function() {
            $('.particle').remove();
        }, 1000);
    }

    // 创建波纹特效
    function createRipple() {
        var wrapper = $('#successIconWrapper');
        $('.ripple').remove();

        var ripple = $('<div class="ripple"></div>');
        wrapper.append(ripple);

        setTimeout(function() {
            ripple.remove();
        }, 800);
    }

    // 降级复制方案
    function fallbackCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            var successful = document.execCommand('copy');
            if (successful) {
                showCoolModal(text);
            } else {
                alert('复制失败，请手动复制页面链接');
            }
        } catch (err) {
            console.error('降级复制失败:', err);
            alert('复制失败，请手动复制页面链接');
        }

        document.body.removeChild(textarea);
    }

    // ESC键关闭弹框
    $(document).keydown(function(e) {
        if (e.key === 'Escape' && $('#shareModalOverlay').hasClass('show')) {
            hideCoolModal();
        }
    });
});