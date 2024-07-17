interface ILoginData {
  tenantId: string;
  email: string;
  pwd: string;
}

interface ITwoFACodeData {
  email: string;
  requestType: string;
  codeId: string;
}

export { type ILoginData, type ITwoFACodeData };
