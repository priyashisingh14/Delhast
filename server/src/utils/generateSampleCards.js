const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sampleDir = path.resolve(__dirname, '../../../sample-id-cards');

if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

const generateCardSvg = ({ collegeName, studentName, regNo, course, dept, year, color = '#63439b' }) => `
<svg width="1000" height="600" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect width="1000" height="600" rx="30" fill="#ffffff" stroke="#e2d8ec" stroke-width="4"/>
  
  <!-- Top Banner -->
  <rect width="1000" height="140" rx="30" fill="${color}"/>
  <rect y="110" width="1000" height="30" fill="${color}"/>
  
  <!-- College Title -->
  <text x="500" y="60" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">
    ${collegeName.toUpperCase()}
  </text>
  <text x="500" y="100" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#f3ebfc" text-anchor="middle" letter-spacing="1">
    STUDENT IDENTITY CARD
  </text>

  <!-- Photo Box -->
  <rect x="80" y="190" width="220" height="280" rx="16" fill="#f6f2fa" stroke="#cbb8e3" stroke-width="3"/>
  <circle cx="190" cy="290" r="50" fill="#bfa5dc"/>
  <path d="M120 440 C120 370, 260 370, 260 440 Z" fill="#9e7dc9"/>

  <!-- Student Details -->
  <!-- Name -->
  <text x="350" y="235" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#66537b">
    Student Name:
  </text>
  <text x="520" y="235" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#241935">
    ${studentName}
  </text>

  <!-- Reg No -->
  <text x="350" y="295" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#66537b">
    Reg No:
  </text>
  <text x="520" y="295" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="#63439b" letter-spacing="2">
    ${regNo}
  </text>

  <!-- Course & Dept -->
  <text x="350" y="355" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#66537b">
    Course:
  </text>
  <text x="520" y="355" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#38294a">
    ${course}
  </text>

  <text x="350" y="410" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#66537b">
    Department:
  </text>
  <text x="520" y="410" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#38294a">
    ${dept}
  </text>

  <!-- Academic Year & Validity -->
  <text x="350" y="465" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#66537b">
    Academic Year:
  </text>
  <text x="520" y="465" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#4c3d60">
    ${year} (Valid Upto: 2027)
  </text>

  <!-- Bottom Bar -->
  <rect y="540" width="1000" height="60" rx="0" fill="#f8f5fb"/>
  <line x1="0" y1="540" x2="1000" y2="540" stroke="#eee7f5" stroke-width="2"/>
  
  <text x="190" y="575" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#887899" text-anchor="middle">
    Authorized Student
  </text>
  <text x="820" y="575" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#887899" text-anchor="middle">
    Dean / Registrar Signature
  </text>
</svg>
`;

const cards = [
  {
    fileName: 'valid_id_priyashi.png',
    collegeName: 'Apex Institute of Technology',
    studentName: 'Priyashi Singh',
    regNo: '23CSE101',
    course: 'B.Tech',
    dept: 'Computer Science and Engineering',
    year: '2nd Year (2023-2027)',
    color: '#63439b'
  },
  {
    fileName: 'valid_id_rahul.png',
    collegeName: 'Apex Institute of Technology',
    studentName: 'Rahul Kumar',
    regNo: '23CSE102',
    course: 'B.Tech',
    dept: 'Computer Science and Engineering',
    year: '2nd Year (2023-2027)',
    color: '#43619b'
  },
  {
    fileName: 'mismatch_name_id.png',
    collegeName: 'Apex Institute of Technology',
    studentName: 'Rahul Sharma',
    regNo: '23CSE102',
    course: 'B.Tech',
    dept: 'Computer Science and Engineering',
    year: '2nd Year (2023-2027)',
    color: '#9b4361'
  },
  {
    fileName: 'mismatch_reg_id.png',
    collegeName: 'Apex Institute of Technology',
    studentName: 'Priyashi Singh',
    regNo: '23CSE999',
    course: 'B.Tech',
    dept: 'Computer Science and Engineering',
    year: '2nd Year (2023-2027)',
    color: '#7b439b'
  },
  {
    fileName: 'unregistered_student_id.png',
    collegeName: 'Apex Institute of Technology',
    studentName: 'Unknown Student',
    regNo: '99ZZZ999',
    course: 'B.Tech',
    dept: 'Civil Engineering',
    year: '1st Year',
    color: '#555555'
  }
];

const generateAllCards = async () => {
  console.log('Generating high-resolution sample ID card images...');
  for (const card of cards) {
    const svg = generateCardSvg(card);
    const outputPath = path.join(sampleDir, card.fileName);
    await sharp(Buffer.from(svg))
      .png({ quality: 100 })
      .toFile(outputPath);
    console.log(`Generated sample card: ${outputPath}`);
  }
  console.log('All sample ID cards generated successfully.');
};

if (require.main === module) {
  generateAllCards().catch(console.error);
}

module.exports = { generateAllCards, generateCardSvg };
