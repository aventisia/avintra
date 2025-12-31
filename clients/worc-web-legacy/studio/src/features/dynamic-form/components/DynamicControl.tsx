/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDynamicFieldSchema, DynamicFieldLabel } from "..";
import { cn } from "@aventisia/ui/lib";
import { format } from "date-fns";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  InformationCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@aventisia/ui";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@aventisia/ui/input-otp";
import { PhoneInput } from "@aventisia/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { Button } from "@aventisia/ui/buttons";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@aventisia/ui/multi-selector";
import { Tooltip } from "@aventisia/ui/tooltip";
import { TagInput } from "@aventisia/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@aventisia/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@aventisia/ui/command";
import { Checkbox } from "@aventisia/ui";
import { Switch } from "@aventisia/ui";
import { RadioGroup, RadioGroupItem } from "@aventisia/ui/radio-group";
import { Calendar } from "@aventisia/ui";
import { Textarea } from "@aventisia/ui";
import { Slider } from "@/features/dynamic-form/components/slider";
import { FormControl } from "@aventisia/ui/form";
import { FormDescription } from "@aventisia/ui/form";
import { FormItem } from "@aventisia/ui/form";
import { CodeEditor } from "./code-editor/CodeEditor";
import VariableSelectorPopover from "@/features/variable-selector-popover/components/VariableSelectorPopover";
import { useEffect, useMemo } from "react";
import { useVariableSelectorInputStore } from "@/stores/variable-selector-input-value-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchFlows } from "@/features/flows-popover/hooks/useFetchFlows";

interface DynamicControlProps {
  field: ControllerRenderProps<FieldValues, string>;
  fData: IDynamicFieldSchema;
  form?: any;
}

const DynamicControl = ({ field, fData, form }: DynamicControlProps) => {
  const { focusedInput, selectedValue, setFocusedInput, setSelectedValue } =
    useVariableSelectorInputStore(
      useShallow((state) => ({
        setSelectedValue: state.setSelectedValue,
        selectedValue: state.selectedValue,
        focusedInput: state.focusedInput,
        setFocusedInput: state.setFocusedInput,
      })),
    );

  const { data: flowsList } = useFetchFlows();

  const { setValue } = form;

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Set the reference to the currently focused input or textarea
    setFocusedInput(e.currentTarget);
  };

  const memoizedInputValue = useMemo(() => {
    if (focusedInput && selectedValue) {
      const currentInputValue = focusedInput.value;
      const cursorPosition = focusedInput.selectionStart;

      // Check if cursorPosition is valid (not null)
      if (cursorPosition !== null && cursorPosition !== undefined) {
        // Insert the selected value (%${selectedValue}%) at the cursor position
        const newValue =
          currentInputValue.slice(0, cursorPosition) +
          `%${selectedValue}%` +
          currentInputValue.slice(cursorPosition);

        return newValue;
      } else {
        return `${currentInputValue} %${selectedValue}%`;
      }
    }
    return "";
  }, [selectedValue, focusedInput]); // Recompute when selectedValue or focusedInput changes

  useEffect(() => {
    if (focusedInput && selectedValue) {
      const name = focusedInput.getAttribute("name");
      if (name?.startsWith("o_")) {
        setValue(name, selectedValue);
      } else {
        setValue(name, memoizedInputValue);
      }
      setFocusedInput(null);
      setSelectedValue("");
    }
  }, [
    memoizedInputValue,
    focusedInput,
    selectedValue,
    setFocusedInput,
    setSelectedValue,
    setValue,
  ]); // Run the effect when memoizedInputValue changes

  switch (fData.type) {
    case "text":
    case "number":
    case "email":
    case "file":
    case "color":
    case "time":
    case "password":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <div className="group relative">
            <FormControl>
              <Input
                fieldSize="sm"
                className={cn(fData.className)}
                readOnly={fData.readonly}
                type={fData.type}
                placeholder={fData.placeholder}
                {...field}
                onFocus={handleFocus}
              />
            </FormControl>
            <div
              className="z-100 absolute bottom-full right-0 hidden transition-opacity duration-300 ease-in-out group-focus-within:block"
              onFocus={(e) => e.currentTarget.classList.remove("hidden")}
              onBlur={(e) => e.currentTarget.classList.add("hidden")}
            >
              <VariableSelectorPopover />
            </div>
          </div>
        </>
      );
    case "otp":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <FormControl>
            <InputOTP className={cn(fData.className)} maxLength={6} {...field}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
        </>
      );
    case "phone":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <FormControl>
            <PhoneInput
              defaultCountry="US"
              className={fData.className}
              readOnly={fData.readonly}
              placeholder={fData.placeholder}
              {...field}
            />
          </FormControl>
        </>
      );
    case "select":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <Select
            disabled={fData.disabled}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger size="sm">
                <SelectValue placeholder={fData.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {fData?.selectOptions?.map((item, index) => (
                <SelectItem size="sm" key={index} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      );
    case "flow-select-combobox":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={fData.disabled}
                  variant="outline"
                  size="sm"
                  role="combobox"
                  className={cn(
                    "w-full justify-between pl-3 pr-[0.68rem] font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? field.value : fData.placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command className="w-full">
                <CommandInput placeholder={fData.placeholder} />
                <CommandEmpty>No result found</CommandEmpty>
                <CommandGroup>
                  {flowsList &&
                    flowsList.data.map((item, index) => {
                      return (
                        <CommandItem
                          value={item.name}
                          key={index}
                          onSelect={() => {
                            form?.setValue(fData.name, item.name);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              item.name === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {item.name}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      );
    //TODO: Making ui-element-selector a text field for now.
    // TODO: To be implemented later.
    case "ui-element-selector":
      return (
        <>
          {/* <DynamicFieldLabel fData={fData} />
          <Select
            disabled={fData.disabled}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger size="sm">
                <SelectValue placeholder={fData.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <div className="p-4">
                <Input
                  fieldSize="sm"
                  type="text"
                  placeholder="Search..."
                  className="mb-2"
                />
                <Button size="sm">Button</Button>
              </div>
            </SelectContent>
          </Select> */}
          <DynamicFieldLabel fData={fData} />
          <div className="group relative">
            <FormControl>
              <Input
                fieldSize="sm"
                className={cn(fData.className)}
                readOnly={fData.readonly}
                type={fData.type}
                placeholder={fData.placeholder}
                {...field}
                onFocus={handleFocus}
              />
            </FormControl>
            <div
              className="z-100 absolute bottom-full right-0 hidden transition-opacity duration-300 ease-in-out group-focus-within:block"
              onFocus={(e) => e.currentTarget.classList.remove("hidden")}
              onBlur={(e) => e.currentTarget.classList.add("hidden")}
            >
              <VariableSelectorPopover />
            </div>
          </div>
        </>
      );

    case "multi-selector":
      return (
        <div>
          <DynamicFieldLabel fData={fData} />
          <MultiSelector onValuesChange={field.onChange} values={field.value}>
            <FormControl>
              <MultiSelectorTrigger size="sm" disabled={fData.disabled}>
                <MultiSelectorInput
                  disabled={fData.disabled}
                  placeholder={fData.placeholder}
                />
              </MultiSelectorTrigger>
            </FormControl>
            {fData?.selectOptions?.length !== field.value.length && (
              <MultiSelectorContent>
                <MultiSelectorList>
                  {fData?.selectOptions
                    ?.filter((option) => !field.value.includes(option.value))
                    .map((item, index) => (
                      <MultiSelectorItem
                        size="sm"
                        key={index}
                        value={item.value}
                      >
                        <div className="flex items-center gap-2">
                          {item.label}
                          {item.description && (
                            <Tooltip content={item.description}>
                              <InformationCircleIcon className="h-4 w-4" />
                            </Tooltip>
                          )}
                        </div>
                      </MultiSelectorItem>
                    ))}
                </MultiSelectorList>
              </MultiSelectorContent>
            )}
          </MultiSelector>
        </div>
      );
    case "tag-input":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <FormControl>
            <TagInput
              fieldSize="sm"
              className={fData.className}
              readOnly={fData.readonly}
              placeholder={fData.placeholder}
              {...field}
            />
          </FormControl>
        </>
      );
    case "combobox":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={fData.disabled}
                  variant="outline"
                  size="sm"
                  role="combobox"
                  className={cn(
                    "w-full justify-between pl-3 pr-[0.68rem] font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? field.value : fData.placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="w-full">
                <CommandInput placeholder={fData.placeholder} />
                <CommandEmpty>No result found</CommandEmpty>
                <CommandGroup>
                  {fData?.selectOptions?.map((item, index) => (
                    <CommandItem
                      value={item.label}
                      key={index}
                      onSelect={() => {
                        form?.setValue(fData.name, item.value);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          item.value === field.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      );
    case "checkbox":
      return (
        <div
          className={cn(
            "flex flex-row items-start space-x-3 space-y-0 rounded-md border border-input p-4",
            fData.disabled ? "opacity-70" : "",
          )}
        >
          <FormControl>
            <Checkbox
              disabled={fData.disabled}
              className="mt-[0.12rem]"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <DynamicFieldLabel className="ml-0 text-sm" fData={fData} />
            {fData.description && (
              <FormDescription>{fData.description}</FormDescription>
            )}
          </div>
        </div>
      );
    case "switch":
      return (
        <div
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border p-3",
            fData.disabled ? "opacity-70" : "",
          )}
        >
          <div className="space-y-1">
            <DynamicFieldLabel className="ml-0 text-xs" fData={fData} />
            {fData.description && (
              <FormDescription className="text-xs">
                {fData.description}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              size="sm"
              disabled={fData.disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </div>
      );
    case "output-switch-field":
      return (
        <div
          className={cn(
            "flex flex-row items-center justify-end rounded-lg",
            fData.disabled ? "opacity-70" : "",
          )}
        >
          {fData.description && (
            <FormDescription className="text-xs">
              {fData.description}
            </FormDescription>
          )}
          <FormControl>
            <Switch
              size="sm"
              disabled={fData.disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </div>
      );
    case "output-text-field":
      return (
        <>
          <div>
            <FormControl>
              <span className="group relative">
                <Input
                  fieldSize="xs"
                  className={cn(
                    fData.className,
                    "inline h-6 w-fit cursor-pointer rounded-lg bg-secondary-light px-2 py-1 font-semibold text-secondary placeholder:text-white hover:ring-1 focus-visible:cursor-auto focus-visible:border-none focus-visible:ring-1 disabled:opacity-70",
                  )}
                  readOnly={fData.readonly}
                  type={fData.type}
                  placeholder={fData.placeholder}
                  {...field}
                  onFocus={handleFocus}
                  autoComplete="off"
                />

                <div
                  className="z-100 absolute bottom-[90%] right-0 hidden transition-opacity duration-300 ease-in-out group-focus-within:block"
                  onFocus={(e) => e.currentTarget.classList.remove("hidden")}
                  onBlur={(e) => e.currentTarget.classList.add("hidden")}
                >
                  <VariableSelectorPopover />
                </div>
              </span>
            </FormControl>
            {fData.description && (
              <FormDescription className="text-xs">
                {fData.description}
              </FormDescription>
            )}
          </div>
        </>
      );
    case "radio-group":
      return (
        <div className="flex flex-col items-start justify-between space-y-2 rounded-lg border p-4">
          <DynamicFieldLabel className="ml-0 text-sm" fData={fData} />
          <FormControl>
            <RadioGroup
              disabled={fData.disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {fData?.selectOptions?.map((item, index) => (
                <FormItem
                  key={index}
                  className="flex items-center gap-1.5 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem size="sm" value={item.value} />
                  </FormControl>
                  <p className="ml-1 text-sm font-normal">{item.label}</p>
                  <Tooltip content={item.description}>
                    <InformationCircleIcon className="h-4 w-4" />
                  </Tooltip>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
        </div>
      );
    case "date":
      return (
        <div className="flex flex-col gap-1">
          <DynamicFieldLabel fData={fData} />
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={fData.disabled}
                  variant={"outline"}
                  size="sm"
                  className={cn(
                    "w-full pl-3 pr-[0.68rem] text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>{fData.placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto rounded-lg bg-white p-0 shadow"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    case "slider":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <FormControl>
            <Slider defaultValue={fData.defaultValue} max={100} step={1} />
          </FormControl>
        </>
      );
    case "textarea":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <div className="group relative">
            <FormControl>
              <Textarea
                size="sm"
                className={cn(fData.className)}
                placeholder={fData.placeholder}
                {...field}
                onFocus={handleFocus}
              />
            </FormControl>
            <div
              className="absolute bottom-full right-0 z-10 hidden group-focus-within:block"
              onFocus={(e) => e.currentTarget.classList.remove("hidden")}
              onBlur={(e) => e.currentTarget.classList.add("hidden")}
            >
              <VariableSelectorPopover />
            </div>
          </div>
        </>
      );
    case "codeEditor":
      return (
        <>
          <DynamicFieldLabel fData={fData} />
          <FormControl>
            <CodeEditor
              language={fData.language}
              // placeholder={fData.placeholder}
              {...field}
            />
          </FormControl>
        </>
      );
  }
};

export { DynamicControl };
