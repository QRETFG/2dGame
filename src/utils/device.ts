import Phaser from 'phaser';

export function isMobileDevice(device: Phaser.DeviceConf, width: number, height: number): boolean {
  if (device.os.android || device.os.iOS) {
    return true;
  }

  const shortestEdge = Math.min(width, height);
  return device.input.touch && shortestEdge <= 900;
}
