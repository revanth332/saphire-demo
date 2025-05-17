// fonts.js
import { jsPDF } from "jspdf";

// Montserrat-Regular base64 (shortened here; use full base64 for real usage)
import montserratRegular from "@/assets/Montserrat-Regular.ttf"  // ← replace with full base64
import montserratBold from "@/assets/Montserrat-Bold.ttf"  // ← replace with full base64

// Optional: Montserrat-Bold (if needed)

jsPDF.API.events.push(['addFonts', function () {
    this.addFileToVFS("Montserrat-Regular.ttf", montserratRegular);
    this.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");

    this.addFileToVFS("Montserrat-Bold.ttf", montserratBold);
    this.addFont("Montserrat-Bold.ttf", "Montserrat", "bold");
}]);
