import {
  getPlateFilename,
  type CroatianPlateValue,
} from "@/lib/croatia";

export const TESLA_PLATE_WIDTH = 420;
export const TESLA_PLATE_HEIGHT = 100;
export const TESLA_MAX_BYTES = 50 * 1024;

const PLATE_FONT_FAMILY = '"PlateAtlas DIN Condensed"';
const PLATE_FONT_SIZE = 84;
const CHARACTER_CELL_WIDTH = 36.75;
const CROATIAN_CARON_BASES: Readonly<Record<string, string>> = {
  Č: "C",
  Š: "S",
  Ž: "Z",
};

interface RenderPlateOptions {
  readonly scale?: number;
}

let crestImagePromise: Promise<HTMLImageElement> | undefined;
let plateFontPromise: Promise<void> | undefined;

function loadPlateFont(): Promise<void> {
  if (plateFontPromise) {
    return plateFontPromise;
  }

  plateFontPromise = document.fonts
    .load(`500 ${PLATE_FONT_SIZE}px ${PLATE_FONT_FAMILY}`)
    .then(() => undefined);

  return plateFontPromise;
}

function loadCrestImage(): Promise<HTMLImageElement> {
  if (crestImagePromise) {
    return crestImagePromise;
  }

  crestImagePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the Croatian crest."));
    image.src = "/croatia-crest.svg";
  });

  return crestImagePromise;
}

function drawStar(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) {
  const innerRadius = radius * 0.42;
  context.beginPath();

  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const pointRadius = point % 2 === 0 ? radius : innerRadius;
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;

    if (point === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.closePath();
  context.fill();
}

function drawEuBand(context: CanvasRenderingContext2D) {
  context.save();
  context.fillStyle = "#0646a5";
  context.fillRect(3, 3, 35, 94);

  context.fillStyle = "#ffd83d";
  for (let index = 0; index < 12; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 12;
    drawStar(
      context,
      20.5 + Math.cos(angle) * 10,
      27 + Math.sin(angle) * 10,
      1.85,
    );
  }

  context.fillStyle = "#ffffff";
  context.font = '700 16px Arial, sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("HR", 20.5, 78);
  context.restore();
}

function drawCroatianEdgeStripe(
  context: CanvasRenderingContext2D,
  startY: number,
) {
  const stripeX = 38;
  const stripeWidth = 378;
  const stripeHeight = 1.25;

  context.fillStyle = "#d8212c";
  context.fillRect(stripeX, startY, stripeWidth, stripeHeight);
  context.fillStyle = "#ffffff";
  context.fillRect(
    stripeX,
    startY + stripeHeight,
    stripeWidth,
    stripeHeight,
  );
  context.fillStyle = "#174c9d";
  context.fillRect(
    stripeX,
    startY + stripeHeight * 2,
    stripeWidth,
    stripeHeight,
  );
}

function drawFixedCellText(
  context: CanvasRenderingContext2D,
  text: string,
  startX: number,
  centerY: number,
  fitCroatianAreaDiacritics = false,
) {
  context.font = `500 ${PLATE_FONT_SIZE}px ${PLATE_FONT_FAMILY}, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (const [index, character] of Array.from(text).entries()) {
    const baseCharacter = fitCroatianAreaDiacritics
      ? CROATIAN_CARON_BASES[character]
      : undefined;
    const renderedCharacter = baseCharacter ?? character;
    const glyphWidth = context.measureText(renderedCharacter).width;
    const availableWidth = CHARACTER_CELL_WIDTH - 3;
    const horizontalScale = Math.min(1, availableWidth / glyphWidth);
    const cellCenterX = startX + CHARACTER_CELL_WIDTH * (index + 0.5);

    context.save();
    context.translate(cellCenterX, centerY);
    context.scale(horizontalScale, 1);
    context.fillText(renderedCharacter, 0, 0);

    if (baseCharacter) {
      context.beginPath();
      context.moveTo(-5.25, -41);
      context.lineTo(0, -36.75);
      context.lineTo(5.25, -41);
      context.strokeStyle = "#131719";
      context.lineWidth = 2.75;
      context.lineCap = "square";
      context.lineJoin = "miter";
      context.stroke();
    }

    context.restore();
  }
}

export async function renderCroatianPlate(
  canvas: HTMLCanvasElement,
  value: CroatianPlateValue,
  options: RenderPlateOptions = {},
): Promise<void> {
  const [crest] = await Promise.all([loadCrestImage(), loadPlateFont()]);
  const scale = options.scale ?? 1;

  canvas.width = TESLA_PLATE_WIDTH * scale;
  canvas.height = TESLA_PLATE_HEIGHT * scale;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is unavailable in this browser.");
  }

  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.clearRect(0, 0, TESLA_PLATE_WIDTH, TESLA_PLATE_HEIGHT);
  context.fillStyle = "#f8f9f7";
  context.beginPath();
  context.roundRect(1.5, 1.5, 417, 97, 6);
  context.fill();

  drawEuBand(context);
  drawCroatianEdgeStripe(context, 4.75);
  drawCroatianEdgeStripe(context, 91.5);

  context.strokeStyle = "#161a1d";
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(1.5, 1.5, 417, 97, 6);
  context.stroke();

  context.fillStyle = "#131719";
  drawFixedCellText(context, value.area, 44, 52.5, true);

  const registration = `${value.digits || "000"}-${value.letters || "A"}`;
  const crestCenterX = 138;
  const crestWidth = 34;
  const crestHeight = crestWidth * (crest.naturalHeight / crest.naturalWidth);
  const crestX = crestCenterX - crestWidth / 2;
  const crestY = 49.5 - crestHeight / 2;
  context.drawImage(crest, crestX, crestY, crestWidth, crestHeight);
  drawFixedCellText(context, registration, 154, 52.5);
}

export async function createPlateDownload(
  value: CroatianPlateValue,
): Promise<{ readonly blob: Blob; readonly filename: string }> {
  const canvas = document.createElement("canvas");
  await renderCroatianPlate(canvas, value);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("The plate image could not be generated."));
      }
    }, "image/png");
  });

  return {
    blob,
    filename: getPlateFilename(value),
  };
}
