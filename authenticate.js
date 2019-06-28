'use strict';
const User = require('./dao/user');
const user = new User();
const jwt = require('jsonwebtoken');
const secretKey =  "mysecretkey";

class Authenticate {

    isAuthorized(event) {
      let body = {}
      if (typeof event.body == 'string')
        body = JSON.parse(event.body);
      body = body || {};
      const requestContext = event.requestContext || {};
      const path = requestContext.path
      const httpMethod = requestContext.httpMethod;
      const pathParameters = event.pathParameters || {};
      const headers = event.headers;
      const email = body.email || pathParameters.email;
      const token = headers.authorization || headers.Authorization;
      return new Promise(async (resolve, reject) => {
        try {
          // Token will be Bearer y29.seef...
          const tokenArr = token.split(" ");
      
          if (tokenArr === undefined || tokenArr.length < 2 ||
              tokenArr[0] == null || tokenArr[1] == null) {
              resolve(false);
              return;
          }
          let decoded = await jwt.verify(tokenArr[1], secretKey);
            if (decoded && decoded.email) {
              const data = await user.getByEmail(decoded.email);
              if (data && data.role == "admin") {
                resolve(true);
                return;
              }
              else if (httpMethod == "GET" && pathParameters == "/dev/user") {
                resolve(false);
                return;
              } else if (data && decoded.email == email) {
                resolve(true);
                return;
              } else {
                resolve(false);
                return;
              }
            } else {
              resolve(false);
              return;
            }
        } catch(err) {
          resolve(false);
          return;
        }
      });
    }
}

module.exports = Authenticate;