const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const yugabyte = require('../middlewares/connection'); // Import the yugabyte module
module.exports = {


  generateTableQuery(UserModel, foreign_key, foreign_table,foreignID) {
    const modelName = UserModel.collection.collectionName;
    const tableName = modelName.toLowerCase();
    const columns = [
      `id bigint DEFAULT nextval('userv3_id_seq') PRIMARY KEY`,
      "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    ];
  
    const schemaObj = UserModel.schema.obj;
    for (const key in schemaObj) {
      if (schemaObj.hasOwnProperty(key)) {
        const field = schemaObj[key];
        const columnDefinition = `"${key}" ${this.getSQLTypeFromMongooseType(field.type)}${
          field.required ? " NOT NULL" : ""
        }`;
        
        // Check if the current key matches the provided foreign_key
        if (key === foreign_key) {
          const foreignKeySQL = `FOREIGN KEY ("${key}") REFERENCES "${foreign_table}"("${foreignID}")`;
          columns.push(foreignKeySQL);
        } else {
          columns.push(columnDefinition);
        }
      }
    }
    
    const createTableQuery = `CREATE TABLE "${tableName}" (${columns.join(", ")});`;
    
    console.log(createTableQuery)
    return createTableQuery;
}


    ,

     getSQLTypeFromMongooseType(mongooseType) {
      switch (mongooseType) {
        case String:
          return "VARCHAR(5000)";
        case Number:
          return "INT";
        case Date:
          return "TIMESTAMP";
        // Add more cases for other supported Mongoose types as needed
        default:
          return "VARCHAR(5000)";
      }
    },

    async createTable(req,res,UserModel)
    {
        //the key in the current table to be linked
        const foreign_key= req.body.foreignKey

        //the table with which we want to link
        const foreign_table= req.body.foreignTable

        //the key in the table with which we want to link
        const foreignID = req.body.foreignID

        const createTableQuery = this.generateTableQuery(UserModel,foreign_key,foreign_table,foreignID);
        console.log(createTableQuery);

        const client = await yugabyte.connect();

        client.query(createTableQuery, (error, results) => {
            if (error) {
              const data = {err : error, errorStatus : true}
              return res.status(500).json(data);
            } else {
              const data = {results : results, errorStatus : false}
              return res.status(201).json({"status" : "Table Created!"});
            }
          });

    },
    async createEntry(req, res, tableName) {
      try {
        const columns = Object.keys(req.body).map(column => `"${column}"`).join(', ');
        const values = Object.values(req.body);
    
        const valuePlaceholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${valuePlaceholders})`;
        
        console.log(query);
        console.log(values);
    
        const client = await yugabyte.connect();
    
        // Insert data into the database
        const resultObject = await client.query(query, values);
    
        if (resultObject.error) {
          const data = { err: resultObject.error, errorStatus: true };
          return res.status(500).json(data);
        } else {
          const data = { results: resultObject, errorStatus: false };
          return res.status(201).json(data);
        }
      } catch (error) {
        console.error('Error creating entry:', error.message);
        const data = { err: error.message, errorStatus: true };
        return res.status(500).json(data);
      }
    },

    async getAllEntries(req, res, tableName)

    {

        const query = `SELECT * from ${tableName}`
        const client = await yugabyte.connect();
        const resultObject = await client.query(query);
        if (resultObject.error) {
          const data = { err: resultObject.error, errorStatus: true };
          return res.status(500).json(data);
        } else {
          const data = { results: resultObject, errorStatus: false };
          return res.status(200).json(data.results.rows);
        }

    },
    


    async getAllEntriesByID(req, res, tableName) {
      try {
        const query = `SELECT * from ${tableName} where "${req.query.key}" = $1`;
        console.log(query);
        console.log(req.query);
        const client = await yugabyte.connect();
      
        const resultObject = await client.query(query, [req.query.id]);
      
        if (resultObject.error) {
          const data = { err: resultObject.error, errorStatus: true };
          return res.status(500).json(data);
        } else {
          const data = { results: resultObject.rows, errorStatus: false };
          return res.status(201).json(data);
        }
      } catch (error) {
        console.error('Error retrieving entries by ID:', error.message);
        const data = { err: error.message, errorStatus: true };
        return res.status(500).json(data);
      }
    },
    
  
  
    async getEntryByID(req, res, tableName) {
      try {
        const query = `SELECT * from ${tableName} where "${req.query.key}" = ?`;
        console.log(query);
        console.log(req.query.id);
        const client = await yugabyte.connect();
  
        const resultObject = await client.query(query, [req.query.id]);
  
        if (resultObject.error) {
          const data = { err: resultObject.error, errorStatus: true };
          return res.status(500).json(data);
        } else {
          const data = { results: resultObject, errorStatus: false };
          return res.status(201).json(data);
        }
      } catch (error) {
        console.error('Error retrieving entry by ID:', error.message);
        const data = { err: error.message, errorStatus: true };
        return res.status(500).json(data);
      }
    },
  
    async deleteEntryByID(req, res, tableName) {
      try {
        const query = `DELETE from ${tableName} where "id" = ?`;
        console.log(query);
        console.log(req.query.id);
        const client = await yugabyte.connect();
  
        const resultObject = await client.query(query, [req.query.id]);
  
        if (resultObject.error) {
          const data = { err: resultObject.error, errorStatus: true };
          return res.status(500).json(data);
        } else {
          const data = { results: resultObject, errorStatus: false };
          return res.status(201).json(data);
        }
      } catch (error) {
        console.error('Error deleting entry by ID:', error.message);
        const data = { err: error.message, errorStatus: true };
        return res.status(500).json(data);
      }
    },

    async generateUpdateQueryById(model, id, updates) {
        const tableName = "user"
        const setValues = [];
      
        for (const key in updates) {
          if (updates.hasOwnProperty(key)) {
            const value = updates[key];
            setValues.push(`${key} = '${value}'`);
          }
        }
      
        const setClause = setValues.join(', ');
        const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE "id" = ${id};`;
      
        return updateQuery;
      },
      

      async updateEntryByID(req, res, userModel, tableName) {
        try {
          const updateQuery = this.generateUpdateQueryById(userModel, req.query.id, req.body);
          console.log(updateQuery);
          console.log(req.query.id);
          const client = await yugabyte.connect();
    
          const resultObject = await client.query(updateQuery, [req.query.id]);
    
          if (resultObject.error) {
            const data = { err: resultObject.error, errorStatus: true };
            return res.status(500).json(data);
          } else {
            const data = { results: resultObject, errorStatus: false };
            return res.status(201).json(data);
          }
        } catch (error) {
          console.error('Error updating entry by ID:', error.message);
          const data = { err: error.message, errorStatus: true };
          return res.status(500).json(data);
        }
      }


}

