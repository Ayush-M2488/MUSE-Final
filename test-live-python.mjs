async function testLive() {
    const students = [
        {
            usn: "1MS21CI001",
            cgpa: 8.5,
            ia1: 15,
            ia2: 15,
            ia3: 15,
            practical: 30,
            attendance: 80
        }
    ];

    try {
        const url = 'https://muse-ai-service.onrender.com/predict';
        console.log("Fetching:", url);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students })
        });
        
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

testLive();
