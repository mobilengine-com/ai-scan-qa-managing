import { getItemUnitFrom } from '../../solution/rfs/library';

describe('Testing if the first item\'s unit in a list is marked we return its value without the mark if the current item\'s unit in the list has no value',  () => {
	test('No mark in first item', () => {
		expect(getItemUnitFrom('', '', false)).toBe('');
		expect(getItemUnitFrom(null, null, false)).toBe(null);
		expect(getItemUnitFrom(undefined, undefined, false)).toBe('');
		expect(getItemUnitFrom('', 'db', false)).toBe('db');
		expect(getItemUnitFrom(null, 'db', false)).toBe('db');
		expect(getItemUnitFrom(undefined, 'db', false)).toBe('db');
		expect(getItemUnitFrom('kg', 'db', false)).toBe('db');
	});
	test('Mark in first item, first element', () => {
		expect(getItemUnitFrom('kg***', 'kg***', true)).toBe('kg');
		expect(getItemUnitFrom('kg ***', 'kg ***', true)).toBe('kg');
		expect(getItemUnitFrom('kg', 'kg', true)).toBe('kg');
		expect(getItemUnitFrom('kg ', 'kg ', true)).toBe('kg ');
		expect(getItemUnitFrom(null, null, true)).toBe(null);
		expect(getItemUnitFrom(undefined, undefined, true)).toBe('');
	});
	test('Mark in first item, not first element', () => {
		expect(getItemUnitFrom('kg***', '', false)).toBe('kg');
		expect(getItemUnitFrom('kg ***', '', false)).toBe('kg');
		expect(getItemUnitFrom('kg ***', null, false)).toBe('kg');
		expect(getItemUnitFrom('kg ***', undefined, false)).toBe('kg');
		expect(getItemUnitFrom('kg***', 'kg***', false)).toBe('kg***');
		expect(getItemUnitFrom('kg ***', 'kg ***', false)).toBe('kg ***');
		expect(getItemUnitFrom('kg***', 'db', false)).toBe('db');
		expect(getItemUnitFrom('kg***', 'db ***', false)).toBe('db ***');
		expect(getItemUnitFrom('   kg   ***', '', false)).toBe('   kg');
		expect(getItemUnitFrom('k***g', null, false)).toBe(null);
		expect(getItemUnitFrom('k***g', 'db', false)).toBe('db');
		expect(getItemUnitFrom('***kg', null, false)).toBe(null);
		expect(getItemUnitFrom('***kg', '***kg', false)).toBe('***kg');
		expect(getItemUnitFrom('***kg', 'db', false)).toBe('db');
		expect(getItemUnitFrom('***', null, false)).toBe('');
		expect(getItemUnitFrom('***', 'db', false)).toBe('db');
		expect(getItemUnitFrom('***', '***', false)).toBe('***');
		expect(getItemUnitFrom('  ***', '  ***', false)).toBe('  ***');
		expect(getItemUnitFrom('***', 'db***', false)).toBe('db***');
	});
});