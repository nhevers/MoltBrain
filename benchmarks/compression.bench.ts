/**
 * Compression Benchmarks
 * 
 * Measures context compression ratios and performance.
 * Run with: npx tsx benchmarks/compression.bench.ts
 */

import { performance } from 'perf_hooks';

interface CompressionResult {
  name: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  compressionTimeMs: number;
  decompressionTimeMs: number;
}

interface TokenStats {
  original: number;
  compressed: number;
  ratio: number;
}

// Simple token counter (approximation)
function countTokens(text: string): number {
  // Rough approximation: ~4 chars per token for English
  return Math.ceil(text.length / 4);
}

// Compression strategies
function removeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function removeComments(text: string): string {
  // Remove single-line comments
  let result = text.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  return result;
}

function abbreviateCommonTerms(text: string): string {
  const abbreviations: Record<string, string> = {
    'function': 'fn',
    'return': 'ret',
    'const': 'c',
    'let': 'l',
    'import': 'imp',
    'export': 'exp',
    'interface': 'ifc',
    'implements': 'impl',
    'extends': 'ext',
    'constructor': 'ctor',
    'undefined': 'undef',
    'null': 'nil',
  };
  
  let result = text;
  for (const [full, abbr] of Object.entries(abbreviations)) {
    result = result.replace(new RegExp(`\\b${full}\\b`, 'g'), abbr);
  }
  return result;
}

function extractKeyInfo(text: string): string {
  // Extract function signatures, class names, key comments
  const lines = text.split('\n');
  const keyLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('function ') ||
      trimmed.startsWith('class ') ||
      trimmed.startsWith('interface ') ||
      trimmed.startsWith('export ') ||
      trimmed.startsWith('// TODO') ||
      trimmed.startsWith('// FIXME') ||
      trimmed.match(/^(async\s+)?function\s+\w+/) ||
      trimmed.match(/^\w+\s*\([^)]*\)\s*{/)
    ) {
      keyLines.push(trimmed);
    }
  }
  
  return keyLines.join('\n');
}

// Sample code for testing
const sampleCode = `
/**
 * UserService handles all user-related operations
 * including authentication, profile management, and permissions.
 */
export class UserService {
  private readonly db: Database;
  private readonly cache: Cache;
  
  constructor(db: Database, cache: Cache) {
    this.db = db;
    this.cache = cache;
  }
  
  /**
   * Authenticates a user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Authentication result with token
   */
  async authenticate(email: string, password: string): Promise<AuthResult> {
    // Check cache first
    const cached = await this.cache.get(\`auth:\${email}\`);
    if (cached) {
      return cached;
    }
    
    // Fetch user from database
    const user = await this.db.users.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    
    // Generate token
    const token = await this.generateToken(user);
    
    // Cache result
    await this.cache.set(\`auth:\${email}\`, { user, token }, 3600);
    
    return { user, token };
  }
  
  /**
   * Updates user profile information
   */
  async updateProfile(userId: string, data: ProfileUpdate): Promise<User> {
    const user = await this.db.users.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updated = await this.db.users.update(userId, data);
    await this.cache.delete(\`user:\${userId}\`);
    
    return updated;
  }
  
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Implementation details...
    return true;
  }
  
  private async generateToken(user: User): Promise<string> {
    // Implementation details...
    return 'token';
  }
}
`;

// Sample narrative for testing
const sampleNarrative = `
During this session, we worked on implementing the user authentication system.
The main focus was on creating a secure login flow with proper password hashing
and token generation. We discovered that the existing cache implementation had
some issues with TTL handling, which we fixed by adding proper expiration checks.

Key decisions made:
1. Use bcrypt for password hashing with a cost factor of 12
2. Implement JWT tokens with 1-hour expiration
3. Add rate limiting to prevent brute force attacks
4. Cache authentication results for 1 hour to reduce database load

The implementation involved modifying the UserService class to add the new
authenticate method, updating the database schema to include the password hash
column, and adding the necessary API endpoints in the auth router.

Next steps include adding two-factor authentication support and implementing
the password reset flow.
`;

function runCompressionBenchmark(
  name: string,
  text: string,
  compressFn: (text: string) => string
): CompressionResult {
  const originalSize = text.length;
  
  const compressStart = performance.now();
  const compressed = compressFn(text);
  const compressEnd = performance.now();
  
  const decompressStart = performance.now();
  // Most of our compression is lossy, so no decompression
  const decompressEnd = performance.now();
  
  const compressedSize = compressed.length;
  const ratio = originalSize / compressedSize;
  
  return {
    name,
    originalSize,
    compressedSize,
    ratio,
    compressionTimeMs: compressEnd - compressStart,
    decompressionTimeMs: decompressEnd - decompressStart,
  };
}

function formatCompressionResult(result: CompressionResult): string {
  return [
    `  ${result.name}`,
    `    Original: ${result.originalSize} bytes`,
    `    Compressed: ${result.compressedSize} bytes`,
    `    Ratio: ${result.ratio.toFixed(2)}x`,
    `    Time: ${result.compressionTimeMs.toFixed(3)}ms`,
  ].join('\n');
}

function analyzeTokenCompression(original: string, compressed: string): TokenStats {
  const originalTokens = countTokens(original);
  const compressedTokens = countTokens(compressed);
  
  return {
    original: originalTokens,
    compressed: compressedTokens,
    ratio: originalTokens / compressedTokens,
  };
}

async function main() {
  console.log('claude-recall Compression Benchmarks\n');
  console.log('='.repeat(50));
  
  // Code compression benchmarks
  console.log('\nCode Compression');
  console.log('-'.repeat(40));
  
  const codeResults = [
    runCompressionBenchmark('Whitespace removal', sampleCode, removeWhitespace),
    runCompressionBenchmark('Comment removal', sampleCode, removeComments),
    runCompressionBenchmark('Abbreviations', sampleCode, abbreviateCommonTerms),
    runCompressionBenchmark('Key extraction', sampleCode, extractKeyInfo),
    runCompressionBenchmark('Combined', sampleCode, (text) => 
      abbreviateCommonTerms(removeWhitespace(removeComments(text)))
    ),
  ];
  
  for (const result of codeResults) {
    console.log(formatCompressionResult(result));
  }
  
  // Narrative compression benchmarks
  console.log('\nNarrative Compression');
  console.log('-'.repeat(40));
  
  const narrativeResults = [
    runCompressionBenchmark('Whitespace removal', sampleNarrative, removeWhitespace),
    runCompressionBenchmark('Abbreviations', sampleNarrative, abbreviateCommonTerms),
  ];
  
  for (const result of narrativeResults) {
    console.log(formatCompressionResult(result));
  }
  
  // Token analysis
  console.log('\nToken Analysis');
  console.log('-'.repeat(40));
  
  const combinedCompression = (text: string) => 
    abbreviateCommonTerms(removeWhitespace(removeComments(text)));
  
  const codeTokens = analyzeTokenCompression(sampleCode, combinedCompression(sampleCode));
  const narrativeTokens = analyzeTokenCompression(sampleNarrative, removeWhitespace(sampleNarrative));
  
  console.log(`  Code:`);
  console.log(`    Original tokens: ~${codeTokens.original}`);
  console.log(`    Compressed tokens: ~${codeTokens.compressed}`);
  console.log(`    Token reduction: ${codeTokens.ratio.toFixed(2)}x`);
  
  console.log(`  Narrative:`);
  console.log(`    Original tokens: ~${narrativeTokens.original}`);
  console.log(`    Compressed tokens: ~${narrativeTokens.compressed}`);
  console.log(`    Token reduction: ${narrativeTokens.ratio.toFixed(2)}x`);
  
  console.log('\n' + '='.repeat(50));
  console.log('Benchmarks complete');
}

main().catch(console.error);
