// --- Component Dropdown ---
export interface FilterDropdownProp {
    label: string;
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
}