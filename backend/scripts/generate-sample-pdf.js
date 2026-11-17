const fs = require('fs');
const path = require('path');

function createSimplePDF(outputPath) {
  const resumeLines = [
    'Alex Johnson',
    'Email: student@career.local | Phone: +1 (555) 234-5678 | San Francisco, CA',
    'Summary: Dedicated software engineer with experience in React, Node.js, and web systems.',
    '',
    'EDUCATION',
    'Bachelor of Science in Computer Science - State University of Technology, 2024',
    '',
    'SKILLS',
    'JavaScript, TypeScript, React.js, Node.js, Express.js, MongoDB, Git, REST APIs, SQL, Docker',
    '',
    'PROJECTS',
    'Cloud Task Orchestrator: Built microservices platform using React, Node.js, and MongoDB.',
    'Distributed KV Store: Designed in-memory cache system with replication and LRU eviction.',
    '',
    'CERTIFICATIONS',
    'AWS Certified Cloud Practitioner - Amazon Web Services'
  ];

  // PDF Text stream commands
  let streamContent = 'BT\n/F1 12 Tf\n50 750 Td\n18 TL\n';
  resumeLines.forEach(line => {
    // Escape parentheses
    const safeLine = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    streamContent += `(${safeLine}) '\n`;
  });
  streamContent += 'ET\n';

  const streamLength = Buffer.byteLength(streamContent);

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`
  ];

  let body = '%PDF-1.4\n';
  const xrefOffsets = [];
  objects.forEach(obj => {
    xrefOffsets.push(Buffer.byteLength(body));
    body += obj;
  });

  const startXref = Buffer.byteLength(body);
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  xrefOffsets.forEach(off => {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  });

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  const fullPdf = body + xref + trailer;
  fs.writeFileSync(outputPath, fullPdf, 'latin1');
  console.log(`Created valid sample PDF at: ${outputPath}`);
}

const targetPath = path.join(__dirname, '../../sample_resumes/Alex_Johnson_Resume.pdf');
createSimplePDF(targetPath);
