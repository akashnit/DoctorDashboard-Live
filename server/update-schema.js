import { MongoClient } from 'mongodb';
import { config } from './config/config.js';

async function resetProgramSchema() {
  const uri = config.mongoURI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db();
    
    // Step 1: Get all existing program data
    console.log('Backing up existing programs...');
    const existingPrograms = await database.collection('programs').find({}).toArray();
    console.log(`Found ${existingPrograms.length} existing programs to migrate`);
    
    // Step 2: Drop the existing collection
    console.log('Dropping existing programs collection...');
    await database.collection('programs').drop();
    console.log('Collection dropped successfully');
    
    // Step 3: Create a new collection with validation
    console.log('Creating new programs collection with validation...');
    await database.createCollection('programs', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'description', 'memberships', 'createdBy'],
          properties: {
            name: { 
              bsonType: 'string',
              description: 'Program name is required'
            },
            description: { 
              bsonType: 'string',
              description: 'Program description is required'
            },
            memberships: { 
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['duration', 'price'],
                properties: {
                  duration: { bsonType: 'string' },
                  price: { bsonType: 'number' }
                }
              }
            },
            createdBy: { 
              bsonType: 'objectId',
              description: 'Reference to the User model'
            },
            enrolledUsers: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                properties: {
                  user: { bsonType: 'objectId' },
                  enrolledAt: { bsonType: 'date' },
                  progress: { bsonType: 'number' }
                }
              }
            }
          }
        }
      }
    });
    console.log('New collection created successfully');
    
    // Step 4: Reinsert the existing data (with only valid fields)
    if (existingPrograms.length > 0) {
      console.log('Migrating existing program data...');
      
      // Clean up documents to match new schema
      const cleanedPrograms = existingPrograms.map(program => {
        // Keep only the fields that are in our schema
        const { 
          name, description, memberships, createdBy, enrolledUsers, 
          _id, createdAt, updatedAt 
        } = program;
        
        return { 
          _id, name, description, memberships, createdBy, 
          enrolledUsers: enrolledUsers || [],
          createdAt, updatedAt 
        };
      });
      
      // Insert the cleaned data
      const result = await database.collection('programs').insertMany(cleanedPrograms);
      console.log(`Successfully migrated ${result.insertedCount} programs`);
    }
    
    console.log('Schema reset completed successfully');
  } catch (error) {
    console.error('Error resetting schema:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

resetProgramSchema().catch(console.error); 