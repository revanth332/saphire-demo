import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import miracleLogo from "@/assets/miracle.png";

// Import Montserrat font files (assuming they are in src/assets/fonts/)
import MontserratRegular from "@/assets/Montserrat-Regular.ttf";
import MontserratBold from "@/assets/Montserrat-Bold.ttf";
// If you need italic or bold-italic, import them too:
// import MontserratItalic from "@/assets/fonts/Montserrat-Italic.ttf";
// import MontserratBoldItalic from "@/assets/fonts/Montserrat-BoldItalic.ttf";


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function GenerateQuote({ quotationMetadata, quoteData, setDoc, }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);

    useEffect(() => {
        if (!quotationMetadata || !quoteData) return;

        const generatePdf = async () => { // Make useEffect callback async
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let currentY = 15; // Initial Y margin

            // --- FONT LOADING ---
            try {
                // 1. Fetch font files (imported paths are usually URLs)
                const regularFontResponse = await fetch(MontserratRegular);
                const boldFontResponse = await fetch(MontserratBold);

                if (!regularFontResponse.ok || !boldFontResponse.ok) {
                    throw new Error('Failed to fetch font files');
                }

                const regularFont = await regularFontResponse.arrayBuffer();
                const boldFont = await boldFontResponse.arrayBuffer();

                // Helper to convert ArrayBuffer to binary string (jsPDF VFS expects this for TTFs)
                const toBinaryString = (buffer) => {
                    const uint8Array = new Uint8Array(buffer);
                    let binaryString = '';
                    for (let i = 0; i < uint8Array.length; i++) {
                        binaryString += String.fromCharCode(uint8Array[i]);
                    }
                    return binaryString;
                };

                // 2. Add font files to jsPDF's Virtual File System
                doc.addFileToVFS('Montserrat-Regular.ttf', toBinaryString(regularFont));
                doc.addFileToVFS('Montserrat-Bold.ttf', toBinaryString(boldFont));

                // 3. Add fonts to jsPDF
                doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
                doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');

                // (Optional) If you add Italic and BoldItalic:
                // const italicFont = await fetch(MontserratItalic).then(res => res.arrayBuffer());
                // const boldItalicFont = await fetch(MontserratBoldItalic).then(res => res.arrayBuffer());
                // doc.addFileToVFS('Montserrat-Italic.ttf', toBinaryString(italicFont));
                // doc.addFileToVFS('Montserrat-BoldItalic.ttf', toBinaryString(boldItalicFont));
                // doc.addFont('Montserrat-Italic.ttf', 'Montserrat', 'italic');
                // doc.addFont('Montserrat-BoldItalic.ttf', 'Montserrat', 'bolditalic');

            } catch (fontError) {
                console.error("Error loading custom fonts:", fontError);
                // Fallback or notify user, here we'll just log and continue with default fonts
            }
            // --- END FONT LOADING ---

            // Set Montserrat as the default font for the document
            doc.setFont('Montserrat', 'normal');


            // 1. Add Logo
            const logoHeight = 12;
            const logoWidth = 38
            if (miracleLogo) {
                try {
                    doc.addImage(miracleLogo, 'PNG', 14, currentY, logoWidth, logoHeight);
                } catch (e) {
                    console.error("Error adding logo:", e);
                    doc.text("Logo Placeholder", 14, currentY + logoHeight / 2);
                }
            }

            // 5. Heading Change: Centered, Larger, Bold
            const mainTitle = "QUOTATION"; // Set your main title here
            doc.setFontSize(22);
            doc.setFont('Montserrat', 'bold'); // Explicitly set Montserrat Bold
            const mainTitleWidth = doc.getTextWidth(mainTitle);
            const mainTitleY = miracleLogo ? currentY + logoHeight + 5 : currentY + 5;
            doc.text(mainTitle, (pageWidth - mainTitleWidth) / 2, mainTitleY);
            doc.setFont('Montserrat', 'normal'); // Reset font style to Montserrat Normal

            currentY = mainTitleY + 15;

            // Company Info
            doc.setFontSize(10);
            // doc.setFont('Montserrat', 'normal'); // Already set as default
            doc.text(`Miraxeon Technologies Inc.`, 14, currentY);
            doc.text(`1784 Horizon Loop, Suite 500, Santa Clara, CA 95054, USA`, 14, currentY + 5);
            doc.text(`Phone: +1-800-MIRAX-ON`, 14, currentY + 10);
            doc.text(`Email: sales@miraxeon.com`, 14, currentY + 15);
            doc.text(`Website: www.miraxeon.com`, 14, currentY + 20);

            doc.text(`Quote #: ${quotationMetadata?.quoteNumber || 'N/A'}`, 150, currentY);
            doc.text(`Date: ${quotationMetadata?.date || 'N/A'}`, 150, currentY + 5);
            doc.text(`Valid Until: ${quotationMetadata?.validUntil || 'N/A'}`, 150, currentY + 10);

            currentY += 30;

            // Table
            const tableHeaders = [["#", "Qty", "Product Code", "Description", "Unit Price", "Total"]];
            const tableBody = quoteData.items.map((item, index) => [
                index + 1,
                item.qty,
                item.code,
                item.description,
                `$${item.unitPrice.toFixed(2)}`,
                `$${(item.qty * item.unitPrice).toFixed(2)}`
            ]);

            const tableFoot = [
                [
                    { content: 'Grand Total:', colSpan: 5, styles: { halign: 'right', font: 'Montserrat', fontStyle: 'bold', fontSize: 10, } },
                    { content: `$${quoteData.grandTotal.toFixed(2)}`, styles: { halign: 'left', font: 'Montserrat', fontStyle: 'bold', fontSize: 10 } }
                ]
            ];

            // Ensure autoTable uses the new font
            // It should inherit from doc.getFont() by default, but we can be explicit
            const autoTableStyles = { font: "Montserrat", fontStyle: "normal" };
            const autoTableHeadStyles = { font: "Montserrat", fontStyle: "bold" };


            autoTable(doc, {
                head: tableHeaders,
                body: tableBody,
                foot: tableFoot,
                startY: currentY,
                theme: 'striped',
                styles: autoTableStyles, // Apply base Montserrat style to table
                headStyles: { ...autoTableHeadStyles, fillColor: [52, 152, 219], textColor: [255, 255, 255] }, // Make header bold
                footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], font: 'Montserrat', fontStyle: 'bold' },
                didDrawPage: (data) => {
                    if (data.pageNumber > 1) {
                        doc.setFontSize(12);
                        doc.setFont('Montserrat', 'bold');
                        doc.text("QUOTATION (Continued)", (pageWidth - doc.getTextWidth("QUOTATION (Continued)")) / 2, 15);
                        doc.setFont('Montserrat', 'normal');
                        doc.setFontSize(10);
                    }
                }
            });

            let termsStartY = doc.lastAutoTable.finalY + 10;

            const addContinuedHeader = () => {
                doc.setFontSize(12);
                doc.setFont('Montserrat', 'bold');
                doc.text("QUOTATION (Continued)", (pageWidth - doc.getTextWidth("QUOTATION (Continued)")) / 2, 15);
                doc.setFont('Montserrat', 'normal');
                doc.setFontSize(10);
                return 25;
            };

            doc.setFontSize(10);
            doc.setFont('Montserrat', 'bold');

            if (termsStartY + 10 > pageHeight - 20) {
                doc.addPage();
                termsStartY = addContinuedHeader();
            }
            doc.text("Terms & Conditions:", 14, termsStartY);
            doc.setFont('Montserrat', 'normal');

            let currentTermY = termsStartY + 7;
            const termsList = [
                "Prices in USD. Taxes, shipping, and customs not included unless specified.",
                "Early payment discount of 2% applies if paid within 10 days.",
                "Lead time: 3-4 weeks ARO (After Receipt of Order).",
                "Please reference quote number on POs for all communication and payments.",
            ];

            const termTextStartX = 18;
            const termTextMaxWidth = pageWidth - termTextStartX - 14;
            const lineHeight = 5;

            termsList.forEach(term => {
                // doc.setFont('Montserrat', 'normal'); // ensure it's normal for term text
                const fullTermText = `- ${term}`;
                const lines = doc.splitTextToSize(fullTermText, termTextMaxWidth);
                const termHeight = lines.length * lineHeight;

                if (currentTermY + termHeight > pageHeight - 15) {
                    doc.addPage();
                    currentTermY = addContinuedHeader();
                }
                doc.text(lines, termTextStartX, currentTermY);
                currentTermY += termHeight + 1;
            });

            setDoc(doc);
            const pdfBlob = doc.output("blob");
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
        };

        generatePdf().catch(error => {
            console.error("PDF generation failed:", error);
            // Handle error, maybe set an error state
        });


        return () => {
            if (pdfUrl) { // pdfUrl is from state, so use it directly
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [quotationMetadata, quoteData, setDoc]); // pdfUrl should not be in dependency array if you revoke it on unmount

    const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        setNumPages(nextNumPages);
    };

    const onDocumentLoadError = (error) => {
        console.error("Error loading PDF document: ", error);
    };

    return (
        <div>
            {pdfUrl && (
                <div className="">
                    <div className="border p-2" style={{ maxWidth: '1000px', margin: '0 auto', zoom: '0.7' }}>
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading="Loading PDF..."
                        >
                            {Array.from(new Array(numPages || 0), (el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={800}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                />
                            ))}
                        </Document>
                    </div>
                </div>
            )}
        </div>
    );
}