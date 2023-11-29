import { DateFrom, NumberFrom } from '../../solution/rfs/conversion';

describe('testing number conversion', () => {
  test('zero', () => {
    expect(NumberFrom('0')).toBe(0);
  });
  test('simple positive', () => {
    expect(NumberFrom('12')).toBe(12);
  });
  test('single fraction no grouping', () => {
    expect(NumberFrom('12.3')).toBe(12.3);
    expect(NumberFrom('12,3')).toBe(12.3);
  });
  test('double fraction no grouping is fraction', () => {
    expect(NumberFrom('12.34')).toBe(12.34);
    expect(NumberFrom('12,34')).toBe(12.34);
    expect(NumberFrom('1,002.34')).toBe(1002.34);
    expect(NumberFrom('1 002,34')).toBe(1002.34);
  });
  test('grouping', () => {
    expect(NumberFrom('1 234')).toBe(1234);
    expect(NumberFrom('1 234,567')).toBe(1234.567);
    expect(NumberFrom('100 234,567')).toBe(100234.567);
    // non grouping
    expect(NumberFrom('1,234')).toBe(1.234);
    expect(NumberFrom('1,234.567')).toBe(1234.567);
    expect(NumberFrom('100,234.567')).toBe(100234.567);
  });
  test('no grouping', () => {
    expect(NumberFrom('1234')).toBe(1234);
    expect(NumberFrom('1234,567')).toBe(1234.567);
    expect(NumberFrom('1234.567')).toBe(1234.567);
  });
  test('non numbers', () => {
    expect(NumberFrom(null)).toBe(null);
    expect(NumberFrom(undefined)).toBe(null);
    expect(NumberFrom('')).toBe(null);
    expect(NumberFrom('alma')).toBe(null);
    expect(NumberFrom('123alma')).toBe(null);
    expect(NumberFrom('12.34.56')).toBe(null);
    expect(NumberFrom('2121.234.56')).toBe(null);
    expect(NumberFrom('12 34 56')).toBe(null);
    expect(NumberFrom('12,34,56')).toBe(null);
  });

});