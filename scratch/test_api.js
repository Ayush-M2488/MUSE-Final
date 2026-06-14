import fetch from 'node-fetch'; // if not present, use builtin fetch

async function getPredictions() {
    const res = await fetch('http://localhost:5000/api/ml/courses/CS-504/predictions', {
        headers: {
            // Need token, let's just bypass by using a direct prisma call
        }
    });
}
