
function testDateLogic() {
    const today = new Date();
    // Force Timezone to Asia/Jakarta (WIB)
    // format to YYYY-MM-DD
    const todayString = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(today);

    // Get day of week for Jakarta
    // new Date(todayString) parses as UTC, so we can use getDay() properly if Sunday=0
    // "2025-01-12" (Sunday) -> getDay() = 0 -> converted to 7
    // "2025-01-13" (Monday) -> getDay() = 1
    const jakartaDate = new Date(todayString);
    const dayOfWeek = jakartaDate.getDay() || 7; // Convert 0(Sun) -> 7

    console.log("Debug Logic:", {
        serverNow: today.toISOString(),
        todayString,
        dayOfWeek,
        jakartaDate: jakartaDate.toISOString()
    });
}

testDateLogic();
