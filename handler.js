'use strict';

const AWS = require('aws-sdk');
const User = require('./dao/user')
const Auth = require('./authenticate')
const jwt = require('jsonwebtoken');
const secretKey =  "mysecretkey";
const user = new User();
const auth = new Auth();

module.exports.login = async (event, context) => {
  let requestBody = event.body;
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody);

  const email = requestBody.email;
  const inputPassword = requestBody.password;
  try {
    const data = await user.getByEmail(email);
    if (data) {
      const role = data.role;
      const password = data.password;
      const token = jwt.sign({
        email: email,
        role: role
        }, secretKey, {
          expiresIn: 3600
      });
      data.token = token;
      if (password == inputPassword) {
        return sendResponse(200, "Login Successfully" , data);
      }
    }
    return sendResponse(401, "Invalid username or password" , {});
  } catch(err) {
    return sendResponse(500, 'Serverside Error', err);
  }
}

module.exports.createUser = async (event, context) => {
  try {
    let requestBody = event.body;
    if (typeof requestBody == 'string')
      requestBody = JSON.parse(requestBody)

    const email = requestBody.email;
    const isExist = await user.isExist(email)
    if (isExist) {
      return sendResponse(200, "user exist with input email" ,{});
    }
    await user.create(event);
    return sendResponse(200, 'Successfully created user', event.body);
  } catch(err) {
    return sendResponse(500, 'Serveride Error', err);
  }
};

module.exports.getUser = async (event, context) => {
  try {
    let isAuth = await auth.isAuthorized(event);
    if (!isAuth) {
      return sendResponse(401, "Access Denied", {});      
    }
    const data = await user.get();
    return sendResponse(200, "Successfully list user", data);
  } catch(err) {
    return sendResponse(500, "Serveride Error" ,err);
  }
};

module.exports.getUserByEmail = async (event, context) => {
  let requestBody = event.pathParameters;
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody);

  const email = requestBody.email;
  
  try {
    let isAuth = await auth.isAuthorized(event);
    if (!isAuth) {
      return sendResponse(401, "Access Denied", {});
    }
    const data = await user.getByEmail(email);
    return sendResponse(200, "Successfully get user" , data);
  } catch(err) {
    return sendResponse(500, 'Serverside Error', err);
  }
}

module.exports.updateUser = async (event, context) => {
  let requestBody = event.body;
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody);
  const email = requestBody.email;

  try {
    let isAuth = await auth.isAuthorized(event);
    if (!isAuth) {
      return sendResponse(401, "Access Denied", {});
    }
    let isExist = await user.isExist(email);
    if (!isExist) {
      return sendResponse(200, "user not exist with input email" ,{});
    }
    await user.update(requestBody);
    return sendResponse(200, "Successfully updated user" ,{});
  } catch(err) {
    return sendResponse(500, "Serverside Error", err);
  }
}

module.exports.deleteUser = async (event, context) => {
  let requestBody = event.body;
  
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody);

  const email = requestBody.email;

  try {
    let isAuth = await auth.isAuthorized(event);
    if (!isAuth) {
      return sendResponse(401, "Access Denied", {});      
    }
    let isExist = await user.isExist(email)
    if (!isExist) {
      return sendResponse(200, "user not exist with input email" ,{});
    }
    await user.delete(email);
    return sendResponse(200, "Successfully deleted user" ,{});
  } catch(err) {
    return sendResponse(500, "Serverside Error", err);
  }
}

function sendResponse(statuscode, message, body) {
  return {
    statusCode: statuscode,
    body: JSON.stringify({
      message: message,
      body: body,
    }, null, 2),
  };
}