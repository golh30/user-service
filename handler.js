'use strict';

const AWS = require('aws-sdk');
const User = require('./dao/user')
const user = new User()

module.exports.createUser = async (event, context) => {
  try {
    await user.create(event);
    return sendResponse(200, 'Successfully created user', event.body);
  } catch(err) {
    return sendResponse(500, 'Serveride Error', err);
  }
};

module.exports.getUser = async (event, context) => {
  try {
    const data = await user.get();
    return sendResponse(200, "Successfully list user", data);
  } catch(err) {
    return sendResponse(500, "Serveride Error" ,err);
  }
};

module.exports.getUserByEmail = async (event, context) => {
  let requestBody = event.pathParameters;
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody)

  const email = requestBody.email;
  
  try {
    const data = await user.getByEmail(email);
    return sendResponse(200, "Successfully get user" , data);
  } catch(err) {
    return sendResponse(500, 'Serverside Error', err);
  }
}

module.exports.updateUser = async (event, context) => {
  let requestBody = event.body;
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody)

  try {
    await user.update(requestBody);
    return sendResponse(200, "Successfully updated user" ,{});
  } catch(err) {
    return sendResponse(500, "Serverside Error", err);
  }
}

module.exports.deleteUser = async (event, context) => {
  let requestBody = event.body;
  
  if (typeof requestBody == 'string')
    requestBody = JSON.parse(requestBody)

  const email = requestBody.email

  try {
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