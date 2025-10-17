import { CountriesEnum } from "@aventisia/ui/enums";
import { InputFieldProps, SelectFieldProps } from "@aventisia/ui/form";
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
    { label: "101 to 500", value: "500" },
    { label: "501 to 1000", value: "1000" },
    { label: "1001 to 5000", value: "5000" },
    { label: "5001 to 10000", value: "10000" },
    { label: "More than 10000", value: "10001" },
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
