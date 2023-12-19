"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Calculator_1 = __importDefault(require("./Calculator"));
class BasicStatsCalculator extends Calculator_1.default {
}
exports.default = BasicStatsCalculator;
_a = BasicStatsCalculator;
BasicStatsCalculator.max = -Infinity;
BasicStatsCalculator.currentMax = 0;
BasicStatsCalculator.sum = 0;
BasicStatsCalculator.sumSquares = 0;
BasicStatsCalculator.squaredDiffSum = 0;
BasicStatsCalculator.count = 0;
BasicStatsCalculator.statsCallback = ({ value: newValue }) => {
    if (newValue > _a.max) {
        _a.max = newValue;
        _a.currentMax = newValue;
    }
    _a.count += 1;
    _a.sum += newValue;
    _a.sumSquares += Math.pow(newValue, 2);
    _a.squaredDiffSum += Math.pow(newValue - _a.sum / _a.count, 2);
};
BasicStatsCalculator.getStatistics = () => {
    const mean = _a.sum / _a.count;
    const stdDev = Math.sqrt(_a.squaredDiffSum / _a.count);
    const stdDevWithSumSquare = Math.sqrt(_a.sumSquares / _a.count - Math.pow(mean, 2));
    _a.max = -Infinity;
    _a.sum = 0;
    _a.sumSquares = 0;
    _a.squaredDiffSum = 0;
    _a.count = 0;
    return [
        { name: 'max', value: _a.currentMax, unit: null },
        { name: 'mean', value: mean, unit: null },
        { name: 'stdDev', value: stdDev, unit: null },
        { name: 'stdDevWithSumSquare', value: stdDevWithSumSquare, unit: null },
    ];
};
//# sourceMappingURL=BasicStatsCalculator.js.map