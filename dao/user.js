'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USER_TABLE

class User {

    create(event) {
        let requestBody = event.body;
        if (typeof requestBody == 'string')
          requestBody = JSON.parse(requestBody)

        const name = requestBody.name;
        const email = requestBody.email;
        const password = requestBody.password;
        const role = requestBody.role;
        const addParams = {
          Item: {
            email,
            name, 
            password,
            role
          },
          TableName: tableName
        };
        return new Promise((resolve, reject) => {
          if (typeof name !== 'string' || typeof email !== 'string' ||
              typeof password !== 'string' || typeof role !== 'string') {
            console.error('Validation Failed');
            reject('Validation Failed');
          }
        
          dynamoDb.put(addParams, (error) => {
            if (error) {
              reject(error);
            }
            resolve();
          });
        });
    }

    async get() {
      const params = {
        TableName: tableName
       };
      return new Promise((resolve, reject) => {
        dynamoDb.scan(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            reject(err);
          }
          resolve(data);
        });
      });
    }

    getByEmail(email) {
      const getParams = {
        TableName: tableName,
        Key: {
          email,
        },
      };
    
      return new Promise((resolve, reject) => {
        dynamoDb.get(getParams, (error, result) => {
          if (error) {
            console.log(error);
            reject(error);
          }
      
          if (result.Item) {
            resolve(result.Item);
          } else {
            resolve();
          }
        });
      });
    }

    update(updatedUser) {
      const email = updatedUser.email;
      const password =  updatedUser.password;
      const name = updatedUser.name;
      const role = updatedUser.role;

      const updateParams = {
        TableName : tableName,
        Key: { email },
        UpdateExpression : 'set #a = :password, #b = :name, #c = :role',
        ExpressionAttributeNames: { '#a' : 'password', '#b': 'name', '#c': 'role' },
        ExpressionAttributeValues : { ':password' : password, ':name': name, ':role': role },
      };
    
      return new Promise((resolve, reject) => {
        dynamoDb.update(updateParams, (error) => {
          if (error) {
            console.log(`Error updating user with email ${email}: `, error);
            reject(error);
          }
          resolve();
        });
      });
    }

    delete(email) {
      const deleteParams = {
        TableName: tableName,
        Key: {
          email,
        },
      };
    
      return new Promise((resolve, reject) => {
        dynamoDb.delete(deleteParams, (error, result) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          resolve(result);
        });
      });
    }
}

module.exports = User;