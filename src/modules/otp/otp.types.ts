export type OtpRecord = {
  recipient: string;
  purpose: string;
  hash: string;
  attemptsLeft: number;
};

export type RequestOtpParams = {
  recipient: string;
  purpose: string;
  ipAddress?: string;
};

export type VerifyOtpParams = {
  token: string;
  purpose: string;
  otp: string;
  ipAddress: string;
};
