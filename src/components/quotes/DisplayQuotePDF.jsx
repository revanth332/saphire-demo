
import { API } from "@/services/API";
import { FileText, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import GenerateQuote from "./GenerateQuote";



export default function DisplayQuote({ quotationMetadata, quoteData, isLoading, leadData }) {
    const [doc, setDoc] = useState(null);


    const sendPdf = async () => {

        if (!doc) return;
        // doc.save("invoice.pdf")
        let id = 1;
        toast.loading("Sending Quotation", {
            className: "font-montserrat bg-miracleDarkBlue",
            description: "",
            id: id,
        });

        try {
            const pdfBlob = doc.output('blob');

            const file = new File([pdfBlob], "invoice.pdf", {
                type: "application/pdf"
            });

            const formData = new FormData();
            formData.append("inputFile", file);
            formData.append("customerEmail", leadData?.CustomerEmail ?? "");
            formData.append("customerName", leadData?.CustomerName ?? "");
            formData.append("InteractionId", leadData?.InteractionId ?? "");
            formData.append("quotationData", JSON.stringify({
                quotationMetadata,
                quotation: quoteData
            }));


            console.log((formData.get("inputFile")))

            const response = await API.post.sendQuotation(formData);

            if (response?.status === 200) {
                toast.success("Quotation sent successfully", {
                    className: "font-montserrat bg-miracleDarkBlue",
                    description: "",
                    id: id,
                });
                // doc.save("invoice.pdf")
                setTimeout(() => {
                    toast.dismiss(id);
                }, 2000);
            } else {
                toast.error("Failed to send quotation");
            }
        } catch (err) {
            toast.error("Failed to send or save PDF");
            setTimeout(() => {
                toast.dismiss(id);
            }, 2000); 
            console.error(err);
        }
    };



    return (
        <Card className="p-4 col-span-3">
            <CardContent className="w-full h-full">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">Quotation Preview</h2>
                    <Button onClick={sendPdf} disabled={!doc} className="flex items-center gap-2 font-bold">
                        <Send className="stroke-3" size={20} /> Send Quotation
                    </Button>
                </div>
                <div className="h-[600px] overflow-auto">
                    {
                        Object.keys(quoteData).length > 0
                            ? <GenerateQuote setDoc={setDoc} quoteData={quoteData} quotationMetadata={quotationMetadata} leadData={leadData} />
                            : <p className="flex justify-center flex-col w-full h-full items-center text-gray-500">
                                <p className="flex items-center mb-5"><FileText size={50} />Quotation Preview will appear here </p>
                                {
                                    isLoading && <p><Loader2 className="animate-spin" /></p>
                                }
                            </p>
                    }
                </div>

            </CardContent>
        </Card>
    );
}
