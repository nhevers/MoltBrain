/**
 * Settings Validator
 * 
 * Validates settings configuration.
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface SettingsSchema {
  CLAUDE_RECALL_PROVIDER?: string;
  CLAUDE_RECALL_MODE?: string;
  CLAUDE_RECALL_WORKER_PORT?: number;
  CLAUDE_RECALL_WORKER_HOST?: string;
  CLAUDE_RECALL_LOG_LEVEL?: string;
  CLAUDE_RECALL_MAX_CONTEXT_TOKENS?: number;
  CLAUDE_RECALL_CHROMA_ENABLED?: boolean;
  CLAUDE_RECALL_AUTO_SUMMARIZE?: boolean;
  CLAUDE_RECALL_THEME?: string;
  CLAUDE_RECALL_EXPORT_FORMAT?: string;
  OPENROUTER_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

export class SettingsValidator {
  private errors: ValidationError[] = [];

  /**
   * Validate settings object
   */
  validate(settings: Record<string, any>): ValidationResult {
    this.errors = [];

    this.validateProvider(settings.CLAUDE_RECALL_PROVIDER);
    this.validateMode(settings.CLAUDE_RECALL_MODE);
    this.validatePort(settings.CLAUDE_RECALL_WORKER_PORT);
    this.validateHost(settings.CLAUDE_RECALL_WORKER_HOST);
    this.validateLogLevel(settings.CLAUDE_RECALL_LOG_LEVEL);
    this.validateMaxTokens(settings.CLAUDE_RECALL_MAX_CONTEXT_TOKENS);
    this.validateBoolean('CLAUDE_RECALL_CHROMA_ENABLED', settings.CLAUDE_RECALL_CHROMA_ENABLED);
    this.validateBoolean('CLAUDE_RECALL_AUTO_SUMMARIZE', settings.CLAUDE_RECALL_AUTO_SUMMARIZE);
    this.validateTheme(settings.CLAUDE_RECALL_THEME);
    this.validateExportFormat(settings.CLAUDE_RECALL_EXPORT_FORMAT);
    this.validateApiKey('OPENROUTER_API_KEY', settings.OPENROUTER_API_KEY);
    this.validateApiKey('GEMINI_API_KEY', settings.GEMINI_API_KEY);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }

  /**
   * Validate a single field
   */
  validateField(field: string, value: any): ValidationError | null {
    const tempErrors = this.errors;
    this.errors = [];

    switch (field) {
      case 'CLAUDE_RECALL_PROVIDER':
        this.validateProvider(value);
        break;
      case 'CLAUDE_RECALL_MODE':
        this.validateMode(value);
        break;
      case 'CLAUDE_RECALL_WORKER_PORT':
        this.validatePort(value);
        break;
      case 'CLAUDE_RECALL_WORKER_HOST':
        this.validateHost(value);
        break;
      case 'CLAUDE_RECALL_LOG_LEVEL':
        this.validateLogLevel(value);
        break;
      case 'CLAUDE_RECALL_MAX_CONTEXT_TOKENS':
        this.validateMaxTokens(value);
        break;
      case 'CLAUDE_RECALL_CHROMA_ENABLED':
      case 'CLAUDE_RECALL_AUTO_SUMMARIZE':
        this.validateBoolean(field, value);
        break;
      case 'CLAUDE_RECALL_THEME':
        this.validateTheme(value);
        break;
      case 'CLAUDE_RECALL_EXPORT_FORMAT':
        this.validateExportFormat(value);
        break;
      case 'OPENROUTER_API_KEY':
      case 'GEMINI_API_KEY':
        this.validateApiKey(field, value);
        break;
    }

    const error = this.errors[0] || null;
    this.errors = tempErrors;
    return error;
  }

  private validateProvider(value: any): void {
    if (value === undefined) return;
    
    const validProviders = ['claude', 'gemini', 'openrouter'];
    if (!validProviders.includes(value)) {
      this.addError('CLAUDE_RECALL_PROVIDER', `Must be one of: ${validProviders.join(', ')}`, value);
    }
  }

  private validateMode(value: any): void {
    if (value === undefined) return;
    
    if (typeof value !== 'string' || value.length === 0) {
      this.addError('CLAUDE_RECALL_MODE', 'Must be a non-empty string', value);
    }
  }

  private validatePort(value: any): void {
    if (value === undefined) return;
    
    const port = Number(value);
    if (isNaN(port) || port < 1024 || port > 65535) {
      this.addError('CLAUDE_RECALL_WORKER_PORT', 'Must be a number between 1024 and 65535', value);
    }
  }

  private validateHost(value: any): void {
    if (value === undefined) return;
    
    if (typeof value !== 'string' || value.length === 0) {
      this.addError('CLAUDE_RECALL_WORKER_HOST', 'Must be a non-empty string', value);
    }
  }

  private validateLogLevel(value: any): void {
    if (value === undefined) return;
    
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(value)) {
      this.addError('CLAUDE_RECALL_LOG_LEVEL', `Must be one of: ${validLevels.join(', ')}`, value);
    }
  }

  private validateMaxTokens(value: any): void {
    if (value === undefined) return;
    
    const tokens = Number(value);
    if (isNaN(tokens) || tokens < 1000 || tokens > 100000) {
      this.addError('CLAUDE_RECALL_MAX_CONTEXT_TOKENS', 'Must be a number between 1000 and 100000', value);
    }
  }

  private validateBoolean(field: string, value: any): void {
    if (value === undefined) return;
    
    if (typeof value !== 'boolean') {
      this.addError(field, 'Must be a boolean', value);
    }
  }

  private validateTheme(value: any): void {
    if (value === undefined) return;
    
    const validThemes = ['light', 'dark', 'system'];
    if (!validThemes.includes(value)) {
      this.addError('CLAUDE_RECALL_THEME', `Must be one of: ${validThemes.join(', ')}`, value);
    }
  }

  private validateExportFormat(value: any): void {
    if (value === undefined) return;
    
    const validFormats = ['json', 'csv', 'markdown'];
    if (!validFormats.includes(value)) {
      this.addError('CLAUDE_RECALL_EXPORT_FORMAT', `Must be one of: ${validFormats.join(', ')}`, value);
    }
  }

  private validateApiKey(field: string, value: any): void {
    if (value === undefined) return;
    
    if (typeof value !== 'string') {
      this.addError(field, 'Must be a string', value);
    }
  }

  private addError(field: string, message: string, value?: any): void {
    this.errors.push({ field, message, value });
  }
}
