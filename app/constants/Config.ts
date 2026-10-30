import { Platform } from 'react-native';

// For local testing:
// Android Emulator uses 10.0.2.2 to reach host machine
// iOS simulator & web use 127.0.0.1 or localhost
const getLocalHost = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000';
};

export const Config = {
  appName: 'Sahyogi Loan AI',
  version: '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || getLocalHost(),
  supportEmail: 'support@sahyogiloan.ai',
  disclaimerText:
    'Sahyogi Loan AI is an informational decision-support tool. It is not a lender, credit broker, or credit rating agency. All assessments are illustrative estimates.',
};

export default Config;

