async function testML() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'priya.nair@muse.ac.in', password: 'password123', role: 'teacher' })
        });
        const data = await response.json();
        const token = data.token;
        console.log('Login successful. Token acquired.');

        const mlResponse = await fetch('http://localhost:3000/api/ml/courses/CSE801/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const mlData = await mlResponse.json();
        console.log('ML Response Status:', mlResponse.status);
        console.log('ML Response Data:', mlData);
    } catch (e) {
        console.error('Error:', e);
    }
}

testML();
