// adapted from https://stackoverflow.com/a/19301306/473338
class Random {
  constructor(seedStr) {
    const seed = xmur3(seedStr)();
    this.mask = 0xffffffff;
    this.m_w = (123456789 + seed) & this.mask;
    this.m_z = (987654321 - seed) & this.mask;
  }

  // Returns number between 0 (inclusive) and 1.0 (exclusive),
  // just like Math.random().
  random() {
    this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
    this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
    let result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  }

  nextInt(low, high) {
    const range = high - low;
    return Math.round(this.random() * range + low);
  }

  nextFloat(low, high) {
    const range = high - low;
    return this.random() * range + low;
  }

  nextBool() {
    return this.random() >= 0.5;
  }

  perturb({ x, y }, byX, byY) {
    return { x: x + this.nextInt(-byX, byX), y: y + this.nextInt(-byY, byY) };
  }
}

function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export default Random;
