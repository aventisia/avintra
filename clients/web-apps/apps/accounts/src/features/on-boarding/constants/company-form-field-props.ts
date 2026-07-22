import { CountriesEnum } from "@aventisia/ui/enums";
import type { InputFieldProps, SelectFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

//Role
const roleProps: InputFieldProps = {
  label: "Role",
  name: "role",
};

// Organization Name
const organizationNameProps: InputFieldProps = {
  name: "organizationName",
  label: "Organization Name",
  type: "text",
  isRequired: true,
};

// Organization Domain
const organizationDomainProps: InputFieldProps = {
  name: "domain",
  label: "Organization Domain",
  type: "text",
  isRequired: true,
};

// Number of Employees
const numberOfEmployeesProps: SelectFieldProps = {
  name: "numberOfEmployees",
  label: "Number of Employees",
  selectOptions: [
    { label: "1 to 100", value: "100" },
    { label: "100 to 500", value: "500" },
    { label: "500 to 1,000", value: "1000" },
    { label: "1,000 to 5,000", value: "5000" },
    { label: "5,000 to 10,000", value: "10000" },
    { label: "10,000+", value: "10001" },
  ],
  isRequired: true,
};

// Industry
const industryProps: InputFieldProps = {
  name: "industry",
  label: "Industry",
  type: "text",
};

// Country
const countryProps: SelectFieldProps = {
  name: "country",
  label: "Country",
  selectOptions: enumToArray(CountriesEnum),
  isRequired: true,
};

export {
  organizationNameProps,
  organizationDomainProps,
  numberOfEmployeesProps,
  industryProps,
  countryProps,
  roleProps,
};
