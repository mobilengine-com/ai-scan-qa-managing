import { TimeFrom, MinutesFrom } from '../../solution/rfs/conversion';

describe('testing TimeFrom and MinutesFrom conversion', () => {
  test('TimeFrom empty', () => {
    expect(TimeFrom(null)).toBe(null);
    expect(TimeFrom(undefined)).toBe(null);
    expect(TimeFrom('')).toBe(null);
  });
  test('TimeFrom random string', () => {
    expect(TimeFrom('12,23')).toBe('12,23');
	expect(TimeFrom('alma')).toBe('alma');
  });
  test('TimeFrom timeformat string', () => {
    expect(TimeFrom('08:23')).toBe('08:23');
	expect(TimeFrom('8:23')).toBe('08:23');
	expect(TimeFrom('0823')).toBe('08:23');
	expect(TimeFrom('823')).toBe('08:23');
	expect(TimeFrom('08 23')).toBe('08:23');
	expect(TimeFrom('8 23')).toBe('08:23');
	expect(TimeFrom('08.23')).toBe('08:23');
	expect(TimeFrom('8.23')).toBe('08:23');
  });
  test('MinutesFrom empty', () => {
    expect(MinutesFrom(null)).toBe(null);
    expect(MinutesFrom(undefined)).toBe(null);
    expect(MinutesFrom('')).toBe(null);
  });
  test('MinutesFrom random string', () => {
    expect(MinutesFrom('12,23')).toBe(NaN);
	expect(MinutesFrom('alma')).toBe(NaN);
  });
  test('MinutesFrom timeformat string', () => {
    expect(MinutesFrom('08:23')).toBe(503);
	expect(MinutesFrom('8:23')).toBe(503);
	expect(MinutesFrom('0823')).toBe(503);
	expect(MinutesFrom('823')).toBe(503);
	expect(MinutesFrom('08 23')).toBe(503);
	expect(MinutesFrom('8 23')).toBe(503);
	expect(MinutesFrom('08.23')).toBe(503);
	expect(MinutesFrom('8.23')).toBe(503);
  });
});