"use client";

import type { SelectHTMLAttributes } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type AutoSubmitSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
};

export function AutoSubmitSelect(props: AutoSubmitSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (
    <select
      {...props}
      onChange={(event) => {
        props.onChange?.(event);
        
        const newValue = event.currentTarget.value;
        const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
        
        if (props.name === "calendarType") {
           if (newValue === "lunar-leap") {
             nextParams.set("calendarType", "lunar");
             nextParams.set("isLeapMonth", "true");
           } else {
             nextParams.set("calendarType", newValue);
             nextParams.delete("isLeapMonth");
           }
        } else {
           nextParams.set(props.name, newValue);
        }
        
        router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
      }}
    />
  );
}
