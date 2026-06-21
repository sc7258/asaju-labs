"use client";

import { useEffect, useState, type SelectHTMLAttributes } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type AutoSubmitSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
  onValueChange?: (value: string) => void;
  syncUrl?: boolean;
};

function resolveSelectValue(defaultValue: AutoSubmitSelectProps["defaultValue"]) {
  if (typeof defaultValue === "string") {
    return defaultValue;
  }

  if (typeof defaultValue === "number") {
    return String(defaultValue);
  }

  if (Array.isArray(defaultValue)) {
    return defaultValue[0] ?? "";
  }

  return "";
}

export function AutoSubmitSelect({
  defaultValue,
  name,
  onChange,
  onValueChange,
  syncUrl = true,
  ...props
}: AutoSubmitSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState(() => resolveSelectValue(defaultValue));

  useEffect(() => {
    setValue(resolveSelectValue(defaultValue));
  }, [defaultValue]);

  return (
    <select
      {...props}
      name={name}
      value={value}
      onChange={(event) => {
        onChange?.(event);

        const newValue = event.currentTarget.value;
        setValue(newValue);
        onValueChange?.(newValue);

        if (!syncUrl) {
          return;
        }

        const nextParams = new URLSearchParams(searchParams?.toString() ?? "");

        if (name === "calendarType") {
          if (newValue === "lunar-leap") {
            nextParams.set("calendarType", "lunar");
            nextParams.set("isLeapMonth", "true");
          } else {
            nextParams.set("calendarType", newValue);
            nextParams.delete("isLeapMonth");
          }
        } else {
          nextParams.set(name, newValue);
        }

        router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
      }}
    />
  );
}
