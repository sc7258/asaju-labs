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
    
    
    });

});
});
