// Send a test email with Resend using Node.js native fetch (Node 18+).
// Usage (PowerShell):
//   $env:RESEND_API_KEY="re_xxx"
//   node backend/send-first-email.js your-email@example.com

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const to = process.argv[2];

if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    process.exit(1);
}

if (!to) {
    console.error("Usage: node backend/send-first-email.js <to-email>");
    process.exit(1);
}

async function sendFirstEmail() {
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: [to],
            subject: "Aura Bank: Email test",
            html: "<p>Your Resend email is working.</p>"
        })
    });

    const payload = await response.json();

    if (!response.ok) {
        console.error("Resend API error:", payload);
        process.exit(1);
    }

    console.log("Email sent:", payload);
}

sendFirstEmail().catch((error) => {
    console.error("Unexpected error:", error.message);
    process.exit(1);
});
