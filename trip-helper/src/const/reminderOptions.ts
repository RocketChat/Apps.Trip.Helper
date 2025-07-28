import { LocationEvent } from "../definition/handlers/EventHandler";

export interface ReminderOption {
    value: string;
    text: string;
    date: string;
    time: string;
    description: string;
    message: string;
}

export function createReminderOptionsFromEvents(events: LocationEvent[]): ReminderOption[] {
    const options: ReminderOption[] = [
        {
            value: "custom",
            text: "Custom Reminder",
            description: "Set your own date, time, and message",
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            message: "Custom reminder message",
        }
    ];

    events.forEach((event, index) => {
        if (event.date && event.time && event.title) {
            options.push({
                value: `event_${index}`,
                text: event.title,
                description: `${event.date} at ${event.time}`,
                date: event.date,
                time: event.time,
                message: `Reminder: ${event.title}`,
            });
        }
    });

    return options;
}

export function getReminderOptionByValue(options: ReminderOption[], value: string): ReminderOption | undefined {
    return options.find(option => option.value === value);
}
