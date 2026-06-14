async function test() {
    try {
        const login = await fetch('http://127.0.0.1:3000/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: "sarah.w@university.edu", password: "hashed_password_4" })
        });
        const loginData = await login.json();
        console.log("Login Status:", login.status);
        if (!loginData.token) return;

        const res = await fetch('http://127.0.0.1:3000/api/teacher/courses/CSE801/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                usn: "1MUSE20CS001",
                status: "present",
                date: "2026-06-01"
            })
        });
        const text = await res.text();
        console.log("Response:", res.status, text);
    } catch (e) {
        console.error(e);
    }
}
test();
