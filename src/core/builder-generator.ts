/**
 * Context Generator - DEPRECATED
 *
 * This file is maintained for backward compatibility.
 * New code should import from './Context.js' or './context/index.js'.
 *
 * The context generation logic has been restructured into:
 * - src/core/context/ContextBuilder.ts - Main orchestrator
 * - src/core/context/ContextConfigLoader.ts - Configuration loading
 * - src/core/context/TokenCalculator.ts - Token economics
 * - src/core/context/ObservationCompiler.ts - Data retrieval
 * - src/core/context/formatters/ - Output formatting
 * - src/core/context/sections/ - Section rendering
 */
import { logger } from '../utils/logger.js';

// Re-export everything from the new context module
export { generateContext } from './builder/index.js';
export type { ContextInput, ContextConfig } from './builder/types.js';
