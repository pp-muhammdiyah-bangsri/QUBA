
const dateStr = "2025-01-12"; // Sunday
const date = new Date(dateStr);
console.log("Date string:", dateStr);
console.log("Parsed Date (ISO):", date.toISOString());
console.log("Parsed Date (toString):", date.toString());
console.log("getDay() (UTC day):", date.getDay());
console.log("getUTCDay():", date.getUTCDay());

// Check if Sunday (0)
if (date.getUTCDay() === 0) {
    console.log("Parsed as Sunday (Correct for UTC)");
} else {
    console.log("Parsed as WRONG DAY in UTC");
}

// Check local impact
if (date.getDay() === 0) {
    console.log("getDay() returns 0 (Sunday)");
} else {
    console.log("getDay() returns", date.getDay());
}
