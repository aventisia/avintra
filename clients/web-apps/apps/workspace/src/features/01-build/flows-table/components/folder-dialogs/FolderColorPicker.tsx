import { cn } from "@avplatform/ui/lib";
import { Check } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { FOLDER_COLORS } from "../../constants/folder-colors.constant";
import { FolderColor } from "../../types/folder-color.type";

type FolderColorPickerProps = {
  selectedColor: FolderColor;
  registration: UseFormRegisterReturn;
};

/**
 * Row of palette swatches, one radio each, for choosing a folder's color.
 */
export const FolderColorPicker = ({ selectedColor, registration }: FolderColorPickerProps) => (
  <fieldset>
    <legend className="mb-1.5 text-[12.5px] font-semibold text-slate-700">
      Color
      <span aria-hidden="true" className="ml-1.5 font-normal text-slate-400">
        {selectedColor.label}
      </span>
    </legend>
    <div className="flex flex-wrap items-center gap-2.5 py-1">
      {FOLDER_COLORS.map((color) => {
        const isSelected = color.key === selectedColor.key;

        return (
          <label key={color.key} title={color.label} className="cursor-pointer">
            <input
              type="radio"
              value={color.key}
              aria-label={color.label}
              {...registration}
              className="peer sr-only"
            />
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full text-white ring-offset-2 transition-transform duration-150 peer-focus-visible:shadow-[0_0_0_7px_rgba(99,102,241,0.2)]",
                color.swatch,
                isSelected ? "ring-2" : "hover:scale-110",
              )}
            >
              {isSelected && <Check className="size-3.5" strokeWidth={3} />}
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
