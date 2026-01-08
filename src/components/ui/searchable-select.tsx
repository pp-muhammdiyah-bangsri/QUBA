"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
    sublabel?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyText = "Tidak ada data",
    disabled = false,
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Find selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        const searchLower = search.toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(searchLower) ||
                opt.sublabel?.toLowerCase().includes(searchLower)
        );
    }, [options, search]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    React.useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setOpen(false);
        setSearch("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearch("");
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm",
                    "border border-gray-300 dark:border-gray-600",
                    "bg-white dark:bg-gray-800",
                    "text-gray-900 dark:text-gray-100",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    open && "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900"
                )}
            >
                <span className={cn("truncate", !selectedOption && "text-gray-500 dark:text-gray-400")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {value && !disabled && (
                        <X
                            className="h-4 w-4 shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-t-md">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="flex h-8 w-full bg-transparent py-2 text-sm outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                        {search && (
                            <X
                                className="h-4 w-4 shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer"
                                onClick={() => setSearch("")}
                            />
                        )}
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                {emptyText}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
                                        "text-gray-900 dark:text-gray-100",
                                        "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300",
                                        value === option.value && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        {option.sublabel && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {option.sublabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

