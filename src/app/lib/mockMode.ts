function envFlagEnabled(value: string | undefined) {
  return String(value || 'false').trim().toLowerCase() === 'true';
}

export function isGlobalMockFallbackEnabled() {
  return envFlagEnabled(process.env.NEXT_PUBLIC_ENABLE_MOCK_FALLBACK);
}

export function isNamedMockFallbackEnabled(flagName: string) {
  return isGlobalMockFallbackEnabled() || envFlagEnabled(process.env[flagName]);
}

