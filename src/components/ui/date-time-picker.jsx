import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils"; // Make sure this path is correct for your project
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";



export function DateTimePicker({ onDateTimeUpdate }) {
    const [date, setDate] = React.useState();
    const [isOpen, setIsOpen] = React.useState(false);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12

    // Helper function to update internal state and notify parent
    const internalSetDateAndUpdateParent = (newDate) => {
        setDate(newDate);
        if (onDateTimeUpdate) {
            onDateTimeUpdate(newDate);
        }
    };

    const handleDateSelect = (selectedDateFromCalendar) => {
        if (selectedDateFromCalendar) {
            const newDate = new Date(selectedDateFromCalendar); // Calendar typically gives date at 00:00:00
            if (date) { // If a time was already set, preserve it
                newDate.setHours(date.getHours());
                newDate.setMinutes(date.getMinutes());
                // Seconds and milliseconds are usually not needed for this type of picker
            }
            internalSetDateAndUpdateParent(newDate);
        } else {
            internalSetDateAndUpdateParent(undefined); // Allow clearing the date
        }
    };

    const handleTimeChange = (
        type,
        value
    ) => {
        if (date) { // Time can only be changed if a date is already selected
            const newDate = new Date(date);
            if (type === "hour") {
                // Original logic: (parseInt(value) % 12) gives 0 for 12, 1 for 1, ..., 11 for 11.
                // If current hours >= 12 (PM), add 12 to make it 24-hour format (unless it's 12 PM).
                newDate.setHours(
                    (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
                );
            } else if (type === "minute") {
                newDate.setMinutes(parseInt(value));
            } else if (type === "ampm") {
                const currentHours = newDate.getHours();
                if (value === "PM") {
                    if (currentHours < 12) newDate.setHours(currentHours + 12);
                } else { // AM
                    if (currentHours >= 12) newDate.setHours(currentHours - 12);
                }
            }
            internalSetDateAndUpdateParent(newDate);
        }
        // If `date` is not set, time buttons are disabled, so this function shouldn't be called.
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, "MM/dd/yyyy hh:mm aa")
                    ) : (
                        <span>MM/DD/YYYY hh:mm aa</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {hours.slice().reverse().map((hour) => ( // .slice() to avoid mutating original `hours` if it were used elsewhere
                                    <Button
                                        key={`hour-${hour}`}
                                        size="icon"
                                        variant={
                                            // Check if `date` is defined and if its hour (in 12h format) matches the button's hour
                                            date && (date.getHours() % 12 || 12) === hour
                                                ? "default"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("hour", hour.toString())}
                                        disabled={!date} // Disable if no date is selected
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                    <Button
                                        key={`minute-${minute}`}
                                        size="icon"
                                        variant={
                                            date && date.getMinutes() === minute
                                                ? "default"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                            handleTimeChange("minute", minute.toString())
                                        }
                                        disabled={!date} // Disable if no date is selected
                                    >
                                        {minute}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="">
                            <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => (
                                    <Button
                                        key={ampm}
                                        size="icon"
                                        variant={
                                            date &&
                                                ((ampm === "AM" && date.getHours() < 12) ||
                                                    (ampm === "PM" && date.getHours() >= 12))
                                                ? "default"
                                                : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("ampm", ampm)}
                                        disabled={!date} // Disable if no date is selected
                                    >
                                        {ampm}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}