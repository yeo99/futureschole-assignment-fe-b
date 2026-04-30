export const MOCK_POLICY = {
  RESPONSE_DELAY_MS: 450,
} as const

export const MOCK_SCENARIOS = {
  SERVER_ERROR: 'server-error',
} as const

export type MockScenario = (typeof MOCK_SCENARIOS)[keyof typeof MOCK_SCENARIOS]
