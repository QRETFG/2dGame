import Phaser from 'phaser';

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ControlLayout {
  panelTop: number;
  panelBottom: number;
  panelHeight: number;
  movementY: number;
  actionTopY: number;
  actionBottomY: number;
  moveLeftX: number;
  moveRightX: number;
  attackX: number;
  jumpX: number;
  blockX: number;
  switchWeaponX: number;
  interactX: number;
  interactY: number;
  shop1X: number;
  shop2X: number;
  shop3X: number;
  shopY: number;
  hintY: number;
  mainButtonRadius: number;
  shopButtonRadius: number;
}

export interface HudLayout {
  topY: number;
  leftX: number;
  compact: boolean;
}

export interface LayoutMetrics {
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  displayScale: number;
  worldPerCssPixel: number;
  isMobile: boolean;
  isPortrait: boolean;
  safeArea: SafeAreaInsets;
  playfieldRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  hud: HudLayout;
  controls: ControlLayout;
}

interface ComputeLayoutInput {
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  safeArea: SafeAreaInsets;
  isMobile: boolean;
}

const DEFAULT_SAFE_AREA: SafeAreaInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const toPixels = (value: string): number => {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export function readSafeAreaInsets(containerId: string = 'game-root'): SafeAreaInsets {
  if (typeof document === 'undefined') {
    return DEFAULT_SAFE_AREA;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    return DEFAULT_SAFE_AREA;
  }

  const styles = window.getComputedStyle(container);
  return {
    top: toPixels(styles.paddingTop),
    right: toPixels(styles.paddingRight),
    bottom: toPixels(styles.paddingBottom),
    left: toPixels(styles.paddingLeft),
  };
}

const clamp = (value: number, min: number, max: number): number => Phaser.Math.Clamp(value, min, max);

export function computeLayoutMetrics(input: ComputeLayoutInput): LayoutMetrics {
  const width = input.width;
  const height = input.height;
  const displayWidth = Math.max(1, input.displayWidth);
  const displayHeight = Math.max(1, input.displayHeight);
  const displayScale = Math.max(0.01, Math.min(displayWidth / width, displayHeight / height));
  const worldPerCssPixel = 1 / displayScale;
  const safeTopWorld = input.safeArea.top * worldPerCssPixel;
  const safeBottomWorld = input.safeArea.bottom * worldPerCssPixel;
  const safeLeftWorld = input.safeArea.left * worldPerCssPixel;
  const isPortrait = displayHeight > displayWidth;

  const hudTop = clamp(10 + safeTopWorld * 0.5, 10, 34);
  const hudLeft = clamp(10 + safeLeftWorld * 0.35, 10, 32);
  const compactHud = input.isMobile && isPortrait;

  const buttonRadius = clamp(
    (isPortrait ? 30 : 24) * worldPerCssPixel,
    20,
    58
  );
  const shopButtonRadius = clamp(buttonRadius * (isPortrait ? 0.6 : 0.64), 12, 34);
  const sideInset = clamp(14 * worldPerCssPixel + safeLeftWorld * 0.35, 12, 52);
  const bottomInset = clamp(12 * worldPerCssPixel + safeBottomWorld * 0.45, 10, 46);
  const minCenterY = clamp(height * 0.64, 220, 320);
  const maxCenterY = height - bottomInset - buttonRadius;
  const movementY = clamp(maxCenterY, minCenterY, maxCenterY);
  const actionTopY = clamp(movementY - buttonRadius * 1.05, 170, movementY - buttonRadius * 0.7);
  const actionBottomY = movementY;
  const panelTop = clamp(actionTopY - buttonRadius - 12, 140, 292);
  const panelBottom = height - 2;
  const panelHeight = panelBottom - panelTop;
  const leftClusterX = clamp(sideInset + buttonRadius, buttonRadius + 6, width * 0.4);
  const moveGap = buttonRadius * 2.15;
  const moveRightX = clamp(leftClusterX + moveGap, leftClusterX + buttonRadius * 1.6, width * 0.45);

  const rightClusterRight = clamp(width - sideInset - buttonRadius, width * 0.58, width - 8);
  const rightClusterLeft = clamp(rightClusterRight - buttonRadius * 1.95, width * 0.45, rightClusterRight - buttonRadius * 1.25);
  const centerX = width / 2;
  const shopGap = shopButtonRadius * 2.2;
  const shopStartX = clamp(centerX + buttonRadius * 1.35, centerX + shopButtonRadius + 2, width - sideInset - shopButtonRadius * 3.2);

  return {
    width,
    height,
    displayWidth,
    displayHeight,
    displayScale,
    worldPerCssPixel,
    isMobile: input.isMobile,
    isPortrait,
    safeArea: input.safeArea,
    playfieldRect: {
      x: 0,
      y: 0,
      width,
      height,
    },
    hud: {
      topY: hudTop,
      leftX: hudLeft,
      compact: compactHud,
    },
    controls: {
      panelTop,
      panelBottom,
      panelHeight,
      movementY,
      actionTopY,
      actionBottomY,
      moveLeftX: leftClusterX,
      moveRightX,
      attackX: rightClusterLeft,
      jumpX: rightClusterRight,
      blockX: rightClusterLeft,
      switchWeaponX: rightClusterRight,
      interactX: centerX,
      interactY: movementY,
      shop1X: shopStartX,
      shop2X: clamp(shopStartX + shopGap, shopStartX + shopButtonRadius + 2, width - sideInset - shopButtonRadius * 2),
      shop3X: clamp(shopStartX + shopGap * 2, shopStartX + shopButtonRadius * 2 + 4, width - sideInset - shopButtonRadius),
      shopY: actionTopY,
      hintY: panelBottom - 6,
      mainButtonRadius: buttonRadius,
      shopButtonRadius,
    },
  };
}
