document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM 요소 취득
  const businessCard = document.getElementById('businessCard');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const shareBtn = document.getElementById('shareBtn');
  const downloadVcardBtn = document.getElementById('downloadVcardBtn');
  const qrModalBtn = document.getElementById('qrModalBtn');
  const qrModal = document.getElementById('qrModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const qrImage = document.getElementById('qrImage');

  // 사용자 정보 상수
  const PROFILE_DATA = {
    name: '유연수',
    nameEn: 'You Yeon-su',
    role: '문화창의학부 학생',
    org: '고려대학교 세종캠퍼스',
    email: 'uu_0vy@korea.ac.kr',
    phone: '010-1234-5678',
    bio: '문화와 감성을 잇고, 일상에 새로운 가치를 더하는 문화창의학부 유연수입니다.'
  };

  // 2. 토스트 알림 표시 함수
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toastMessage.classList.add('show');
    toastTimer = setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 2500);
  }

  // 3. 클립보드 복사 기능
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`복사되었습니다: ${textToCopy}`);
      } catch (err) {
        // Fallback 방식
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`복사되었습니다: ${textToCopy}`);
      }
    });
  });

  // 4. 다크/라이트 테마 토글
  const savedTheme = localStorage.getItem('card-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('card-theme', theme);
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  }

  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // 5. vCard (.vcf) 생성 및 다운로드 (스마트폰에 원클릭 연락처 등록 지원)
  downloadVcardBtn.addEventListener('click', () => {
    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${PROFILE_DATA.name}`,
      `N:${PROFILE_DATA.name};;;;`,
      `ORG:${PROFILE_DATA.org}`,
      `TITLE:${PROFILE_DATA.role}`,
      `EMAIL;TYPE=INTERNET,HOME:${PROFILE_DATA.email}`,
      `TEL;TYPE=CELL,VOICE:${PROFILE_DATA.phone}`,
      `NOTE:${PROFILE_DATA.bio}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${PROFILE_DATA.name}_명함.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('연락처 파일(.vcf)이 다운로드되었습니다.');
  });

  // 6. QR 코드 생성 및 모달 팝업
  // vCard 정보 기반 QR 코드 URL 생성
  const qrData = encodeURIComponent(
    `BEGIN:VCARD\nVERSION:3.0\nFN:${PROFILE_DATA.name}\nORG:${PROFILE_DATA.org}\nTITLE:${PROFILE_DATA.role}\nTEL:${PROFILE_DATA.phone}\nEMAIL:${PROFILE_DATA.email}\nEND:VCARD`
  );
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&color=2d3748&bgcolor=ffffff&margin=6`;

  qrModalBtn.addEventListener('click', () => {
    qrModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    qrModal.classList.remove('active');
  });

  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      qrModal.classList.remove('active');
    }
  });

  // 7. 웹 명함 공유 버튼 (Web Share API 지원)
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: `${PROFILE_DATA.name} | 디지털 웹 명함`,
      text: `${PROFILE_DATA.name} (${PROFILE_DATA.role}) 의 웹 명함입니다.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyPageUrl();
        }
      }
    } else {
      copyPageUrl();
    }
  });

  function copyPageUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('명함 페이지 주소가 복사되었습니다!');
    });
  }

  // 8. 데스크톱 3D 틸트 (Tilt) 마우스 인터랙션 효과
  const cardWrapper = document.querySelector('.card-wrapper');

  if (window.matchMedia('(hover: hover)').matches) {
    cardWrapper.addEventListener('mousemove', (e) => {
      const rect = businessCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      businessCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardWrapper.addEventListener('mouseleave', () => {
      businessCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }
});

