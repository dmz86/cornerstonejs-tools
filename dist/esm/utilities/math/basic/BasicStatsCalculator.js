import Calculator from './Calculator';
export default class BasicStatsCalculator extends Calculator {
    static { this.max = -Infinity; }
    static { this.currentMax = 0; }
    static { this.sum = 0; }
    static { this.sumSquares = 0; }
    static { this.squaredDiffSum = 0; }
    static { this.count = 0; }
    static { this.statsCallback = ({ value: newValue }) => {
        if (newValue > this.max) {
            this.max = newValue;
            this.currentMax = newValue;
        }
        this.count += 1;
        this.sum += newValue;
        this.sumSquares += newValue ** 2;
        this.squaredDiffSum += Math.pow(newValue - this.sum / this.count, 2);
    }; }
    static { this.getStatistics = () => {
        const mean = this.sum / this.count;
        const stdDev = Math.sqrt(this.squaredDiffSum / this.count);
        const stdDevWithSumSquare = Math.sqrt(this.sumSquares / this.count - mean ** 2);
        this.max = -Infinity;
        this.sum = 0;
        this.sumSquares = 0;
        this.squaredDiffSum = 0;
        this.count = 0;
        return [
            { name: 'max', value: this.currentMax, unit: null },
            { name: 'mean', value: mean, unit: null },
            { name: 'stdDev', value: stdDev, unit: null },
            { name: 'stdDevWithSumSquare', value: stdDevWithSumSquare, unit: null },
        ];
    }; }
}
//# sourceMappingURL=BasicStatsCalculator.js.map