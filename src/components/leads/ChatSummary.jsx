import React, { useState } from "react"; // Import React and useState
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MarkDownRender from "./markdown-renderer";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // Added for better button placement
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DateTimePicker } from "../ui/date-time-picker"; // Assuming this path is correct
import { format } from "date-fns"; // For logging formatted date (optional)
import { API } from "@/services/API";
import { toast } from "sonner";

export default function ChatSummary({ message, lead }) {
  const navigate = useNavigate();
  const [scheduledDateTime, setScheduledDateTime] = useState();
  const [isMeetingDialogOpn, setIsMeetingDialogOpen] = useState(false);

  const handleScheduleMeeting = async () => {
    let id = 1;
    toast.loading("Scheduling Call", {
      className: "font-montserrat bg-miracleDarkBlue",
      description: "",
      id: id,
    });
    if (scheduledDateTime) {
      console.log("Scheduled Meeting Details (Date Object):", scheduledDateTime);
      console.log(
        "Scheduled Meeting (Formatted String):",
        format(scheduledDateTime, "MM/dd/yyyy hh:mm aa")
      );

      const response = await API.post.sendMeetingInvite({
        "customerEmail": lead.CustomerEmail,
        "CustomerName": lead.CustomerName,
        "meetingTimes": scheduledDateTime
      })

      if (response?.status === 200) {
        toast.success(
          `Meeting scheduled successfully for ${format(scheduledDateTime, "MMMM dd, yyyy 'at' hh:mm aa")}`,
          {
            className: "font-montserrat bg-miracleDarkBlue",
            description: "",
            id: id,
          }
        );
      }

      setTimeout(() => {
        toast.dismiss(id);
      }, 2000);

      setIsMeetingDialogOpen(false); // Close the dialog
      setScheduledDateTime(undefined); // Reset for next time
    } else {
      console.warn("No date and time selected for the meeting.");
      toast.error("Failed to send or save PDF");
      setTimeout(() => {
        toast.dismiss(id);
      }, 2000);
    }
  };

  return (
    <Card className="border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg h-fit">
      <CardHeader className="bg-gradient-to-r from-miracle-darkBlue py-6 to-miracle-mediumBlue text-white rounded-t-lg">
        <CardTitle>Interaction Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 overflow-auto max-h-[68vh]">
        <MarkDownRender markdownContent={message?.replace(/\\n/g, "\n").replace(/\\"/g, '"')} />
        <p className="font-semibold text-miracle-darkBlue mt-10">Recommended Actions:</p>
        <div className="flex gap-3 mt-2">
          <Dialog open={isMeetingDialogOpn} onOpenChange={setIsMeetingDialogOpen}>
            <DialogTrigger asChild>
              {/*
                No need for onClick on DialogTrigger if `open` and `onOpenChange` are controlled,
                but explicitly setting it can sometimes be clearer or useful.
                Default behavior of DialogTrigger is to toggle the dialog.
              */}
              <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue">Create Meeting</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]"> {/* Adjust width as needed */}
              <DialogHeader>
                <DialogTitle>Schedule a Call</DialogTitle>
                <DialogDescription>
                  Select the date and time for your meeting.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <DateTimePicker onDateTimeUpdate={setScheduledDateTime} />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMeetingDialogOpen(false);
                    setScheduledDateTime(undefined); // Reset if cancelled
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-miracle-darkBlue hover:bg-miracle-darkBlue"
                  onClick={handleScheduleMeeting}
                  disabled={!scheduledDateTime} // Disable button until a date/time is picked
                >
                  Schedule Meeting
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue" onClick={() => { navigate("/create-quote", { state: lead }) }}>Create Quote</Button>
          <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue">Send Mail</Button>
        </div>
      </CardContent>
    </Card>
  );
}