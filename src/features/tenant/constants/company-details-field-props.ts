import { InputFieldProps, SelectFieldProps } from "@aventisia/ui/form"

const companyNameProps: InputFieldProps = {
    name: "companyName",
    label: "Company Name",
    className: "text-sm",
}

const billingEmailProps: InputFieldProps = {
    name: "billingEmail",
    label: "Billing Email",
    className: "text-sm",
}

const address1Props: InputFieldProps = {
    name: "address1",
    label: "Address Line 1",
    className: "text-sm",
}

const address2Props: InputFieldProps = {
    name: "address2",
    label: "Address Line 2",
    className: "text-sm",
}

const cityProps: InputFieldProps = {
    name: "city",
    label: "City",
    className: "text-sm",
}

const pinCodeProps: InputFieldProps = {
    name: "pinCode",
    label: "Pincode",
    className: "text-sm",
}

const stateProps: InputFieldProps = {
    name: "state",
    label: "State",
    className: "text-sm",
}

const countryProps: SelectFieldProps = {
    name: "country",
    label: "Country",
    className: "text-sm",
    selectOptions: [],
}

const gstNumberProps: InputFieldProps  = {
    name: "gstNumber",
    label: "GSt Number",
    className: "text-sm",
}

export {
    companyNameProps, 
    billingEmailProps, address1Props, 
    address2Props, 
    cityProps, 
    pinCodeProps, 
    stateProps, 
    countryProps,
    gstNumberProps
}