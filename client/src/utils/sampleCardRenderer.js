/**
 * Generates client-side test ID card SVG strings and converts to real PNG File blobs
 */
export const generateCardSvg = (type = 'priyashi') => {
  const cards = {
    priyashi: {
      name: 'Priyashi Singh',
      regNo: '23CSE101',
      dept: 'Computer Science and Engineering',
      color: '#63439b'
    },
    rahul: {
      name: 'Rahul Kumar',
      regNo: '23CSE102',
      dept: 'Computer Science and Engineering',
      color: '#43619b'
    },
    mismatch_name: {
      name: 'Rahul Sharma',
      regNo: '23CSE102',
      dept: 'Computer Science and Engineering',
      color: '#9b4361'
    },
    mismatch_reg: {
      name: 'Priyashi Singh',
      regNo: '23CSE999',
      dept: 'Computer Science and Engineering',
      color: '#7b439b'
    }
  };

  const card = cards[type] || cards.priyashi;

  return `
<svg width="1000" height="600" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="600" rx="30" fill="#ffffff" stroke="#e2d8ec" stroke-width="4"/>
  <rect width="1000" height="140" rx="30" fill="${card.color}"/>
  <rect y="110" width="1000" height="30" fill="${card.color}"/>
  
  <text x="500" y="60" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">
    APEX INSTITUTE OF TECHNOLOGY
  </text>
  <text x="500" y="100" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#f3ebfc" text-anchor="middle" letter-spacing="1">
    STUDENT IDENTITY CARD
  </text>

  <rect x="80" y="190" width="220" height="280" rx="16" fill="#f6f2fa" stroke="#cbb8e3" stroke-width="3"/>
  <circle cx="190" cy="290" r="50" fill="#bfa5dc"/>
  <path d="M120 440 C120 370, 260 370, 260 440 Z" fill="#9e7dc9"/>

  <text x="350" y="235" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#66537b">
    Student Name:
  </text>
  <text x="520" y="235" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#241935">
    ${card.name}
  </text>

  <text x="350" y="295" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#66537b">
    Reg No:
  </text>
  <text x="520" y="295" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="${card.color}" letter-spacing="2">
    ${card.regNo}
  </text>

  <text x="350" y="355" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#66537b">
    Course:
  </text>
  <text x="520" y="355" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#38294a">
    B.Tech
  </text>

  <text x="350" y="410" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#66537b">
    Department:
  </text>
  <text x="520" y="410" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#38294a">
    ${card.dept}
  </text>

  <text x="350" y="465" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#66537b">
    Academic Year:
  </text>
  <text x="520" y="465" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#4c3d60">
    2nd Year (2023-2027) (Valid Upto: 2027)
  </text>

  <rect y="540" width="1000" height="60" fill="#f8f5fb"/>
  <line x1="0" y1="540" x2="1000" y2="540" stroke="#eee7f5" stroke-width="2"/>
  
  <text x="190" y="575" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#887899" text-anchor="middle">
    Authorized Student
  </text>
  <text x="820" y="575" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#887899" text-anchor="middle">
    Dean / Registrar Signature
  </text>
</svg>
`;
};

/**
 * Converts SVG string into PNG File instance via Canvas for browser testing
 * @param {string} type 
 * @returns {Promise<File>}
 */
export const renderSampleCardToFile = (type = 'priyashi') => {
  return new Promise((resolve, reject) => {
    const svgStr = generateCardSvg(type);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          resolve(new File([blob], `${type}_id_card.png`, { type: 'image/png' }));
          return;
        }
        const file = new File([pngBlob], `sample_${type}_id.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(new File([blob], `${type}_id_card.png`, { type: 'image/png' }));
    };

    img.src = url;
  });
};
