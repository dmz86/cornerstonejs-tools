import { Statistics } from '../../../types';
import Calculator from './Calculator';
export default class BasicStatsCalculator extends Calculator {
    private static max;
    private static currentMax;
    private static sum;
    private static sumSquares;
    private static squaredDiffSum;
    private static count;
    static statsCallback: ({ value: newValue }: {
        value: any;
    }) => void;
    static getStatistics: () => Statistics[];
}
