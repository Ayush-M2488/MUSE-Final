const axios = require('axios');

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'priya.nair@muse.ac.in',
            password: 'password123',
            role: 'teacher'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful. Token:', token.substring(0, 20) + '...');
        
        console.log('Testing GET /api/teacher/dashboard...');
        const dashRes = await axios.get('http://localhost:3000/api/teacher/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Dashboard GET status:', dashRes.status);
        
        console.log('Testing POST /api/teacher/courses/CS501/marks...');
        const marksRes = await axios.post('http://localhost:3000/api/teacher/courses/CS501/marks', {
            marksData: [{ usn: '21CS047', ia1: 20, ia2: 21 }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Marks POST status:', marksRes.status);
    } catch (error) {
        if (error.response) {
            console.error('Request failed with status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

test();
