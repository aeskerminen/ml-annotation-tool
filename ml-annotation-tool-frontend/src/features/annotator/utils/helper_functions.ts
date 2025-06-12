// Utility function to limit a number between min and max
export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Utility function to rotate a point around a center
export const rotatePoint = (px: number, py: number, cx: number, cy: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dx = px - cx;
    const dy = py - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos,
    };
};