export interface IOtpInputs {
  userId: string;
  otp: string;
}

export interface IOtpResponse {
  message: string;
}

export interface IResendOtpInputs {
  userId: string;
}
export interface IResendOtpResponse {
  message: string;
}

export interface IOtpState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
