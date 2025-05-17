import {
    Circle, // Maintained as a fallback for unknown statuses
    Sparkles,
    PhoneCall,
    UserCheck,
    FileText,
    CheckCircle2,
} from "lucide-react"

const renderTimelineIcon = (event) => {
    const iconBaseClass = "h-5 w-5 z-10"; // Common classes for all icons

    let IconComponent;

    // 1. Determine the icon component based on status, irrespective of completion.
    switch (event.status) {
        case 'new': IconComponent = Sparkles; break;
        case 'contacted': IconComponent = PhoneCall; break;
        case 'qualified': IconComponent = UserCheck; break;
        case 'proposal': IconComponent = FileText; break;
        case 'closed': IconComponent = CheckCircle2; break;
        default: IconComponent = Circle; // Fallback icon for any unknown status
    }

    if (event.isCompleted) {
        // 2. If the status is fulfilled (completed), color the icon blue.
        // This style (text and fill same color) makes a solid blue icon.
        return <IconComponent className={`${iconBaseClass} text-miracle-lightBlue fill-miracle-lightBlue`} strokeWidth={1.5} />;
    } else if (event.isCurrent) {
        // For the current (but not completed) event, retain the distinct styling from your original image.
        // This is typically a light blue fill with a darker blue outline.
        return <IconComponent className={`${iconBaseClass} text-miracle-lightBlue fill-sky-100`} strokeWidth={2} />;
    } else {
        // 3. Otherwise (for future/pending events), put the icon in grey.
        // This style (gray outline, white fill) is common for inactive/pending icons.
        return <IconComponent className={`${iconBaseClass} text-gray-300 fill-white`} strokeWidth={1.5} />;
    }
};

// The rest of your Timeline component code (provided in the first prompt) remains the same.
// Make sure this updated renderTimelineIcon function replaces the old one in your timeline.jsx file.

export function Timeline({ lead, isLoading = false }) {
    if (isLoading) {
        return (
            <div className="mt-4 border rounded-lg border-miracle-lightGray/30 shadow-md p-4">
                <h3 className="font-semibold mb-4 text-miracle-darkBlue">Lead Progress</h3>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
        )
    }

    const statuses = ["new", "contacted", "qualified", "proposal", "closed"]
    const currentStatusIndex = statuses.indexOf(lead?.status?.toLowerCase() || "new")

    const timelineEvents = statuses.map((status, index) => {
        const isCompleted = index < currentStatusIndex
        const isCurrent = index === currentStatusIndex
        let dateString = "Pending"

        if (isCurrent || isCompleted) {
            if (status === "new" && isCurrent) { // Example specific date for 'new' current
                dateString = "5/15/2025";
            } else if (lead?.statusHistory && lead.statusHistory[status]) { // Ideal: use actual date for this status
                 dateString = new Date(lead.statusHistory[status]).toLocaleDateString();
            } else if (lead?.CreatedAt) { // Fallback to CreatedAt
                dateString = new Date(lead.CreatedAt).toLocaleDateString();
            } else {
                dateString = "N/A";
            }
        }

        return {
            status,
            date: dateString,
            isCompleted,
            isCurrent,
        }
    })

    return (
        <div className="mt-4 border rounded-lg border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="bg-miracle-darkBlue text-white rounded-t-lg py-2 px-4">
                <h3 className="text-lg font-bold">Lead Progress</h3>
            </div>
            <div className="p-4 sm:p-5">
                <div className="relative">
                    <div className="absolute left-0 right-0 top-[10px] h-px bg-miracle-lightBlue/40 z-0"></div>
                    <div className="flex justify-between">
                        {timelineEvents.map((event, index) => {
                            return (
                                <div
                                    key={event.status}
                                    className={`relative flex flex-col items-center text-center animate-slide-up`}
                                    style={{ animationDelay: `${index * 100 + 100}ms` }}
                                >
                                    <div className="z-10 bg-white rounded-full p-0.5">
                                        {renderTimelineIcon(event)}
                                    </div>

                                    <div
                                        className={`transition-all duration-300 mt-1.5 ${event.isCurrent ? "scale-105" : ""}`}
                                    >
                                        <h4
                                            className={`capitalize text-xs sm:text-sm ${event.isCurrent
                                                ? "text-miracle-darkBlue font-semibold"
                                                : event.isCompleted
                                                    ? "text-miracle-mediumBlue font-medium"
                                                    : "text-gray-500 font-normal"
                                                }`}
                                        >
                                            {event.status}
                                        </h4>
                                        <p
                                            className={`text-xs mt-0.5 ${event.isCurrent
                                                ? "text-gray-500"
                                                : event.isCompleted
                                                    ? "text-gray-400"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {event.date}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}