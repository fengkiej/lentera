import React from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./dropdown-menu";
import { Badge } from "./badge";

export interface FilterOption {
  id: string | number;
  label: string;
  color?: string;
  count?: number;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedValues: (string | number)[];
  onSelectionChange: (values: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  multiSelect?: boolean;
  showClearAll?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ options, selectedValues, onSelectionChange, placeholder = "Filter", className = "", multiSelect = true, showClearAll = true }) => {
  const handleOptionClick = (optionId: string | number) => {
    if (multiSelect) {
      const newSelection = selectedValues.includes(optionId) ? selectedValues.filter((id) => id !== optionId) : [...selectedValues, optionId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(selectedValues.includes(optionId) ? [] : [optionId]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedLabels = () => {
    return options.filter((option) => selectedValues.includes(option.id)).map((option) => option.label);
  };

  const selectedLabels = getSelectedLabels();
  const hasSelection = selectedValues.length > 0;

  // Check if this is icon-only mode
  const isIconOnly = className.includes("w-12 h-12");

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`${
              isIconOnly
                ? `w-12 h-12 p-0 rounded-full border-gray-300 hover:border-brand-deep-green-600 ${hasSelection ? "border-brand-deep-green-600 bg-brand-deep-green-600/50" : "hover:bg-brand-deep-green-600/50"}`
                : `h-12 justify-between min-w-[140px] border-gray-300 hover:border-brand-deep-green-600 ${hasSelection ? "border-brand-deep-green-600 bg-brand-deep-green-600/50" : ""}`
            }`}
            title={isIconOnly ? (hasSelection ? `${selectedLabels.length} dipilih` : "Filter") : undefined}
          >
            {isIconOnly ? (
              <Filter className={`w-5 h-5 ${hasSelection ? "text-brand-deep-green-600" : "text-gray-600"}`} />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="truncate">{hasSelection ? (selectedLabels.length === 1 ? selectedLabels[0] : `${selectedLabels.length} dipilih`) : placeholder}</span>
                </div>
                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[280px] max-w-[400px] max-h-64 overflow-y-auto z-50 bg-white border border-gray-200 shadow-lg rounded-lg" align="center" sideOffset={8} avoidCollisions={true} collisionPadding={16}>
          {showClearAll && hasSelection && (
            <>
              <DropdownMenuItem onClick={handleClearAll} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Hapus Semua Filter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.id);
            return (
              <DropdownMenuItem key={option.id} onClick={() => handleOptionClick(option.id)} className={`cursor-pointer `}>
                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {option.color && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />}
                    <span className="flex-1 text-left break-words whitespace-normal leading-tight py-1">{option.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {isSelected && (
                      <Badge variant="secondary" className="bg-brand-deep-green-600/50 text-brand-deep-green-800 flex-shrink-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          {options.length === 0 && <DropdownMenuItem disabled>Tidak ada opsi tersedia</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterDropdown;
