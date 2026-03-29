function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function createSimplePdf(lines: string[]) {
  const safeLines = lines.map((line) => escapePdfText(line));
  const commands = ['BT', '/F1 16 Tf', '50 760 Td'];
  safeLines.forEach((line, index) => {
    if (index === 0) commands.push(`(${line}) Tj`);
    else commands.push(`0 -24 Td (${line}) Tj`);
  });
  commands.push('ET');
  const stream = commands.join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

export function createBrandedPdf(title: string, subtitle: string, sections: Array<{ heading: string; lines: string[] }>) {
  const commands = [
    '0.06 0.06 0.06 rg',
    '0 0 612 792 re',
    'f',
    '0.83 0.69 0.22 rg',
    '0 748 612 44 re',
    'f',
    'BT',
    '/F2 20 Tf',
    '1 1 1 rg',
    '48 764 Td',
    `(${escapePdfText(title)}) Tj`,
    'ET',
    'BT',
    '/F1 11 Tf',
    '0.84 0.84 0.84 rg',
    '48 730 Td',
    `(${escapePdfText(subtitle)}) Tj`,
    'ET'
  ];

  let y = 690;
  for (const section of sections) {
    commands.push(
      'BT',
      '/F2 13 Tf',
      '0.83 0.69 0.22 rg',
      `48 ${y} Td`,
      `(${escapePdfText(section.heading)}) Tj`,
      'ET'
    );
    y -= 18;

    for (const line of section.lines) {
      if (y < 60) break;
      commands.push(
        'BT',
        '/F1 10 Tf',
        '0.95 0.95 0.95 rg',
        `48 ${y} Td`,
        `(${escapePdfText(line)}) Tj`,
        'ET'
      );
      y -= 14;
    }

    y -= 12;
    if (y < 60) break;
  }

  const stream = commands.join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    `6 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}
