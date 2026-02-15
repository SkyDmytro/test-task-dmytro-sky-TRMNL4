import { it, expect } from 'vitest';
import { parseDateOnly, parseNumericId } from '$lib/shared/parse.js';

it('parseNumericId parses valid integers', () => {
	expect(parseNumericId('123')).toBe(123);
	expect(parseNumericId('0')).toBe(0);
});

it('parseNumericId rejects invalid input', () => {
	expect(parseNumericId(null)).toBeNull();
	expect(parseNumericId(undefined)).toBeNull();
	expect(parseNumericId('')).toBeNull();
	expect(parseNumericId('abc')).toBeNull();
	expect(parseNumericId('12.5')).toBeNull();
	expect(parseNumericId('-1')).toBeNull();
});

it('parseDateOnly parses YYYY-MM-DD as UTC midnight', () => {
	const d = parseDateOnly('2025-01-15');
	expect(d).not.toBeNull();
	expect(d!.getUTCFullYear()).toBe(2025);
	expect(d!.getUTCMonth()).toBe(0);
	expect(d!.getUTCDate()).toBe(15);
	expect(d!.getUTCHours()).toBe(0);
	expect(d!.getUTCMinutes()).toBe(0);
});

it('parseDateOnly returns null for invalid input', () => {
	expect(parseDateOnly(null)).toBeNull();
	expect(parseDateOnly('')).toBeNull();
	expect(parseDateOnly('not-a-date')).toBeNull();
	expect(parseDateOnly('2025-13-01')).toBeNull();
	expect(parseDateOnly('2025-01-32')).toBeNull();
});

it('parseDateOnly returns null for wrong format', () => {
	expect(parseDateOnly('01-15-2025')).toBeNull();
	expect(parseDateOnly('2025/01/15')).toBeNull();
});
