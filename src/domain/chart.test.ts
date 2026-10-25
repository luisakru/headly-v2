import { chartScale, monthLabelStep } from './chart';

test('an empty chart still has one interval', () => {
  expect(chartScale(0)).toEqual({ max: 1, ticks: [0, 1] });
});

test('small values use steps of one', () => {
  expect(chartScale(3)).toEqual({ max: 3, ticks: [0, 1, 2, 3] });
  expect(chartScale(4)).toEqual({ max: 4, ticks: [0, 1, 2, 3, 4] });
});

test('larger values round up to a round step', () => {
  expect(chartScale(7)).toEqual({ max: 8, ticks: [0, 2, 4, 6, 8] });
  expect(chartScale(14)).toEqual({ max: 15, ticks: [0, 5, 10, 15] });
  expect(chartScale(31)).toEqual({ max: 40, ticks: [0, 10, 20, 30, 40] });
});

test('month labels thin out for long ranges', () => {
  expect(monthLabelStep(1)).toBe(1);
  expect(monthLabelStep(6)).toBe(1);
  expect(monthLabelStep(12)).toBe(2);
  expect(monthLabelStep(24)).toBe(4);
  expect(monthLabelStep(25)).toBe(5);
});
