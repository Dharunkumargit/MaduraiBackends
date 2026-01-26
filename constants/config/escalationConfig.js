export const ESCALATION_RULES = {
  FILL_THRESHOLDS: {
    75: ['Ward Supervisor'],
    90: ['SI - Sanitary Inspectors / Our land managers'],
    100: ['SO - Sanitary Officers']
  },
  TIME_ESCALATION: [
    { minutes: 21, role: 'ACHO', level: 'L1' },
    { minutes: 31, role: 'CHO', level: 'L2' },
    { minutes: 51, role: 'Deputy Commissioner', level: 'L3' },
    { minutes: 61, role: 'Commissioner', level: 'L4' }
  ]
};
