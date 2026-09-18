import React, { useMemo } from 'react';

interface QRCodeBadgeProps {
  value: string;
  size?: number;
  label?: string;
  subLabel?: string;
  className?: string;
}

// Minimal, pure TypeScript QR Code Generator (ISO/IEC 18004 compliant Version 2 & 3)
// Generates accurate 25x25 or 29x29 matrix with standard Reed-Solomon error correction

class QRByte {
  mode: number = 4; // 8-bit byte
  data: string;
  constructor(data: string) {
    this.data = data;
  }
  getLength(): number {
    return new TextEncoder().encode(this.data).length;
  }
  write(buffer: QRBitBuffer): void {
    const bytes = new TextEncoder().encode(this.data);
    for (let i = 0; i < bytes.length; i++) {
      buffer.put(bytes[i], 8);
    }
  }
}

class QRBitBuffer {
  buffer: number[] = [];
  length: number = 0;
  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }
  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }
  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

const QRMath = {
  glog(n: number): number {
    if (n < 1) throw new Error('glog(' + n + ')');
    return LOG_TABLE[n];
  },
  gexp(n: number): number {
    while (n < 0) n += 255;
    while (n >= 256) n -= 255;
    return EXP_TABLE[n];
  },
};

const EXP_TABLE: number[] = new Array(256);
const LOG_TABLE: number[] = new Array(256);
for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;

class QRPolynomial {
  num: number[];
  constructor(num: number[], shift: number = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
    for (let i = num.length - offset; i < this.num.length; i++) this.num[i] = 0;
  }
  get(index: number): number {
    return this.num[index];
  }
  getLength(): number {
    return this.num.length;
  }
  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
      }
    }
    return new QRPolynomial(num);
  }
  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num).mod(e);
  }
}

function getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
  let a = new QRPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
  }
  return a;
}

function createQRCodeMatrix(text: string): boolean[][] {
  const byteLen = new TextEncoder().encode(text).length;
  // Choose version: V2 (up to 32 bytes with L), V3 (up to 53 bytes with L), V4 (up to 78 bytes with L)
  let typeNumber = 2;
  let totalDataCount = 34; // V2-L total codewords: 44, data: 34, ec: 10
  let ecCount = 10;
  
  if (byteLen > 32 && byteLen <= 53) {
    typeNumber = 3;
    totalDataCount = 55;
    ecCount = 15;
  } else if (byteLen > 53) {
    typeNumber = 4;
    totalDataCount = 80;
    ecCount = 20;
  }

  const moduleCount = typeNumber * 4 + 17;
  const modules: (boolean | null)[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(null)
  );

  // 1. Position probe patterns
  const setupPositionProbePattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          modules[row + r][col + c] = true;
        } else {
          modules[row + r][col + c] = false;
        }
      }
    }
  };

  setupPositionProbePattern(0, 0);
  setupPositionProbePattern(moduleCount - 7, 0);
  setupPositionProbePattern(0, moduleCount - 7);

  // 2. Alignment patterns (if V2, V3, V4)
  if (typeNumber >= 2) {
    const pos = typeNumber === 2 ? [6, 18] : typeNumber === 3 ? [6, 22] : [6, 26];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        if (modules[row][col] !== null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              modules[row + r][col + c] = true;
            } else {
              modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let r = 8; r < moduleCount - 8; r++) {
    if (modules[r][6] === null) modules[r][6] = r % 2 === 0;
  }
  for (let c = 8; c < moduleCount - 8; c++) {
    if (modules[6][c] === null) modules[6][c] = c % 2 === 0;
  }

  // 4. Dark module
  modules[4 * typeNumber + 9][8] = true;

  // 5. Data encoding
  const buffer = new QRBitBuffer();
  buffer.put(4, 4); // Mode: Byte
  buffer.put(byteLen, 8); // Character count
  new QRByte(text).write(buffer);

  // Padding
  if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
  while (buffer.length % 8 !== 0) buffer.putBit(false);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (buffer.length < totalDataCount * 8) {
    buffer.put(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Error correction
  const rawData: number[] = [];
  for (let i = 0; i < totalDataCount; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      if (buffer.get(i * 8 + j)) b |= 1 << (7 - j);
    }
    rawData.push(b);
  }

  const rsPoly = getErrorCorrectPolynomial(ecCount);
  const dataPoly = new QRPolynomial(rawData, ecCount);
  const modPoly = dataPoly.mod(rsPoly);

  const finalCodewords = [...rawData];
  for (let i = 0; i < ecCount; i++) {
    const modIdx = i + modPoly.getLength() - ecCount;
    finalCodewords.push(modIdx >= 0 ? modPoly.get(modIdx) : 0);
  }

  // 6. Put data in matrix with standard mask 0
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 0;
  const totalBits = finalCodewords.length * 8;

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (modules[row][col - c] === null) {
          let dark = false;
          if (bitIndex < totalBits) {
            const byteI = Math.floor(bitIndex / 8);
            const bitI = 7 - (bitIndex % 8);
            dark = ((finalCodewords[byteI] >>> bitI) & 1) === 1;
          }
          // Mask 0: (row + col) % 2 == 0
          const mask = (row + (col - c)) % 2 === 0;
          modules[row][col - c] = dark !== mask;
          bitIndex++;
        }
      }
      row += inc;
      if (row < 0 || moduleCount <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }

  // 7. Format info (Level L, Mask 0: bits 0x77c4)
  const formatInfo = 0x77c4;
  for (let i = 0; i < 15; i++) {
    const mod = ((formatInfo >>> i) & 1) === 1;
    if (i < 6) modules[i][8] = mod;
    else if (i < 8) modules[i + 1][8] = mod;
    else modules[moduleCount - 15 + i][8] = mod;

    if (i < 8) modules[8][moduleCount - i - 1] = mod;
    else if (i < 9) modules[8][15 - i - 1 + 1] = mod;
    else modules[8][15 - i - 1] = mod;
  }

  return modules.map(r => r.map(c => c === true));
}

export const QRCodeBadge: React.FC<QRCodeBadgeProps> = ({
  value,
  size = 110,
  label = 'تصدیقی کیو آر کوڈ',
  subLabel = 'دار الافتاء تحریکِ ایمان',
  className = '',
}) => {
  const matrix = useMemo(() => {
    try {
      return createQRCodeMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) return null;

  const count = matrix.length;
  const cellSize = 100 / count;

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white text-stone-950 shadow-md border-2 border-amber-400/80 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="rounded-lg shape-rendering-crisp"
        role="img"
        aria-label="QR Code"
      >
        <rect width="100" height="100" fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
      {(label || subLabel) && (
        <div className="text-center leading-tight">
          {label && (
            <span className="block font-nastaliq font-black text-[10px] text-emerald-950">
              {label}
            </span>
          )}
          {subLabel && (
            <span className="block font-nastaliq text-[9px] text-stone-600 font-bold">
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
