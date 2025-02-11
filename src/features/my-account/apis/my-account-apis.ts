import { IHttpResponse } from '@/react-toolkit/dtos/http-response';
import { axiosInstance } from '@/react-toolkit/lib/axios-instance';

import type { CompanyDto } from "../dtos/my-account-company-dto";
import type { MyAccountDto } from "../dtos/my-account-profile-dto";
import type { MyAccountPasswordDto } from "../dtos/my-account-password-dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_URL}/me`;

export const getMyAccountInfo = async (userId: string) => {
    if (!userId) return Promise.resolve(null);

    const res = await axiosInstance.get<IHttpResponse<MyAccountDto>>(baseAPIURL);
    return res.data;
};

export const getCompanyInfo = async (userId: string) => {
    if (!userId) return Promise.resolve(null);

    const res = await axiosInstance.get<IHttpResponse<CompanyDto>>(
        `${baseAPIURL}/company`,
    );
    return res.data;
};

export const isAccountDeactivated = async (userId: string) => {
    if (!userId) return Promise.resolve(null);

    const res = await axiosInstance.get<IHttpResponse<boolean>>(
        `${baseAPIURL}/is-account-deactivated`,
    );
    return res.data;
};

export const updateMyAccountInfo = async (
    userId: string,
    myAccountDto: MyAccountDto,
) => {
    const res = await axiosInstance.put<IHttpResponse<MyAccountDto>>(
        `${baseAPIURL}/${userId}`,
        myAccountDto,
    );
    return res.data;
};

export const updateCompanyInfo = async (
    companyDto: CompanyDto,
) => {
    const res = await axiosInstance.put<IHttpResponse<CompanyDto>>(
        `${baseAPIURL}/company`,
        companyDto,
    );
    return res.data;
};

export const updateMyAccountPassword = (
    myAccountPasswordDto: MyAccountPasswordDto,
) => axiosInstance.post<IHttpResponse<boolean>>(
    `${baseAPIURL}/update-pwd`,
    myAccountPasswordDto,
).then((res) => res.data);

export const updateMyAccountEmail = async (
    userId: string,
    newEmail: string,
) => {
    const res = await axiosInstance.post<IHttpResponse<MyAccountPasswordDto>>(
        `${baseAPIURL}/update-email/${userId}`,
        newEmail,
    );
    return res.data;
};

export const deactivateMyAccount = async (userId: string) => {
    const res = await axiosInstance.post<IHttpResponse<MyAccountPasswordDto>>(
        `${baseAPIURL}/deactivate/${userId}`,
    );
    return res.data;
};
