/**
 * Test setup file — runs before every test file.
 * Configures jsdom globals that Vitest needs for React + DOM testing.
 */
import '@testing-library/react';

// Silence noisy console.error in tests (e.g. React act() warnings)
// Remove the line below if you want to see all errors during debugging.
// vi.spyOn(console, 'error').mockImplementation(() => {});
