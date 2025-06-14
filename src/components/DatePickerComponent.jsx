"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerComponent({ value, onChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "col-span-3 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>เลือกวันที่</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[1001]">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(selectedDate) => {
            onChange(selectedDate);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}