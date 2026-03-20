"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher...",
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), debounceMs);
  };

  const handleClear = () => {
    setLocal("");
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-custom" />
      <Input
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
