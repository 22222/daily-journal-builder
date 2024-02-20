export function newRandom(initialSeed?: number) {
  let seed = initialSeed ?? Date.now();
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  const random = () => {
    seed = (a * seed + c) % m;
    return seed / m;
  };
  return random;
}

export function generateRandomImage(width?: number, height?: number, random: () => number = newRandom()) {
  const canvas = document.createElement("canvas");
  canvas.width = width ?? generateRandomSize(800, 1600, random);
  canvas.height = height ?? generateRandomSize(600, 1200, random);

  const ctx = canvas.getContext("2d");
  if (ctx) {
    //ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillStyle = generateRandomRgba(random);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const img = new Image(width, height);
  img.src = canvas.toDataURL();
  img.width = canvas.width;
  img.height = canvas.height;
  return img;
}

export function generateRandomDimension(random: () => number = newRandom()) {
  return { width: generateRandomSize(800, 1600, random), height: generateRandomSize(600, 1200, random) };
}

function generateRandomSize(min: number, max: number, random: () => number) {
  return Math.round(random() * (max - min) + min);
}

function generateRandomRgba(random: () => number) {
  const o = Math.round,
    r = random,
    s = 255;
  return "rgba(" + o(r() * s) + "," + o(r() * s) + "," + o(r() * s) + "," + r().toFixed(1) + ")";
}
