const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Testing connection with:');
console.log(uri.replace(/:([^:@]+)@/, ':****@'));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('✅ Successfully connected to MongoDB!');

        const db = client.db('admin');
        const dbs = await db.admin().listDatabases();
        console.log('Available databases:', dbs.databases.map(d => d.name));

    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error Code:', err.code);
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.errorResponse) {
            console.error('Error Response:', JSON.stringify(err.errorResponse, null, 2));
        }
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
