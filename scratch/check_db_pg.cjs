const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:POSTGRES@123@localhost:5432/muse_db'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT p.id, p.usn, e.feature_name, e.feature_value, e.shap_value 
    FROM predictions p 
    LEFT JOIN explanations e ON p.id = e.prediction_id 
    ORDER BY p.predicted_at DESC 
    LIMIT 10
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();
