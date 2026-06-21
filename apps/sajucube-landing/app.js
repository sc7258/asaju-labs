document.addEventListener('DOMContentLoaded', () => {
    // Add micro-interactions or smooth scrolling if needed.
    // The main animations are handled via CSS for better performance.
    
    const btn = document.querySelector('.btn-primary');
    btn.addEventListener('click', () => {
        btn.innerHTML = '계산 중...';
        btn.classList.remove('pulse');
        setTimeout(() => {
            btn.innerHTML = '명식 뽑기';
            btn.classList.add('pulse');
            alert('만세력 기능은 개발 중입니다! (Core 로직 연동 대기중)');
        }, 1500);
    
    // PWA Tabs Logic
    const pwaTabs = document.querySelectorAll('.pwa-tab');
    const pwaContents = document.querySelectorAll('.pwa-content');

    pwaTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            pwaTabs.forEach(t => t.classList.remove('active'));
            pwaContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

});
});
