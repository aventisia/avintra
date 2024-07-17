interface ICreateAccountData {
  email: string;
  firstName: string;
  lastName: string;
  pwd: string;
}

interface IVerifyEmailAddressData {
  email: string;
  requestType: string;
  codeId: string;
}

export { type ICreateAccountData, type IVerifyEmailAddressData };
