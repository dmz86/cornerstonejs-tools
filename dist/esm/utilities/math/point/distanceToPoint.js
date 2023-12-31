export default function distanceToPoint(p1, p2) {
    if (p1.length !== p2.length) {
        throw Error('Both points should have the same dimensionality');
    }
    const [x1, y1, z1 = 0] = p1;
    const [x2, y2, z2 = 0] = p2;
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
}
//# sourceMappingURL=distanceToPoint.js.map