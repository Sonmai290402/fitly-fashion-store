"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  disabled?: boolean;
  disablePastDates?: boolean;
  minDate?: Date;
}

export function DateTimePicker({
  date,
  setDate,
  disabled = false,
  disablePastDates = false,
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 opacity-50" />
            <span className="text-sm font-medium">Date</span>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (!newDate) return;

            const updatedDate = new Date(newDate);

            updatedDate.setHours(
              date?.getHours() || new Date().getHours(),
              date?.getMinutes() || new Date().getMinutes(),
              0,
              0
            );
            setDate(updatedDate);
          }}
          disabled={(calendarDate) => {
            if (disablePastDates) {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              if (calendarDate < now) return true;
            }

            if (minDate) {
              const min = new Date(minDate);
              min.setHours(0, 0, 0, 0);
              if (calendarDate < min) return true;
            }

            return false;
          }}
          initialFocus
        />

        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 opacity-50" />
            <span className="text-sm font-medium">Time</span>
          </div>
          <div className="flex gap-2">
            <Select
              value={format(date || new Date(), "HH")}
              onValueChange={(hour) => {
                const newDate = new Date(date || new Date());
                newDate.setHours(
                  parseInt(hour, 10),
                  newDate.getMinutes(),
                  0,
                  0
                );
                setDate(newDate);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent position="popper">
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex items-center text-xl">:</span>
            <Select
              value={format(date || new Date(), "mm")}
              onValueChange={(minute) => {
                const newDate = new Date(date || new Date());
                newDate.setHours(
                  newDate.getHours(),
                  parseInt(minute, 10),
                  0,
                  0
                );
                setDate(newDate);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent position="popper">
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t p-3">
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDate(new Date());
                setIsOpen(false);
              }}
            >
              Now
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
