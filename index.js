/**
 * App ID for the skill to restrict access
 */
var APP_ID = "amzn1.echo-sdk-ams.app.b164b2f3-ac2e-4965-ab1f-84b64341f9a4"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var CLIENT_ID = '3MVG9uudbyLbNPZO5E.0EAGBuHGWD7l1QVVlQzFD4sonBXxxIS_lEcFQJzyLRK.Y55muT8OLfVhRkviWvWEGa';
var CLIENT_SECRET = '507820135438582589';
var USERNAME = 'USERNAME';
var PASSWORD = 'salesforce1';
var CALLBACK_URL = 'http://localhost:3000/oauth/_callback';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var nforce = require('nforce');
var _ = require('lodash');
var moment = require('moment-timezone');
var pluralize = require('pluralize');

/**
 * Hancock is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Hancock = function () {
    AlexaSkill.call(this, APP_ID);
};

var org = nforce.createConnection({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: CALLBACK_URL,
  mode: 'single'
});

// Extend AlexaSkill
Hancock.prototype = Object.create(AlexaSkill.prototype);
Hancock.prototype.constructor = Hancock;

Hancock.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Hancock onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Hancock.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Hancock onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Hancock.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Hancock onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Hancock.prototype.intentHandlers = {

  FindNextCarePlanStep: function (intent, session, response) {
      handleFindNextCarePlanStepRequest(session, response);
  },

  UpdateCareAlert: function (intent, session, response) {
      handleUpdateCareAlertRequest(session, response);
  },

  RefillPcp: function (intent, session, response) {
      handleRefillPcpRequest(session, response);
  },

  // help with 'Hancock'
  HelpIntent: function (intent, session, response) {
      response.ask("You can ask Hancock about your care plan, or to update any of your alerts or you can say exit... What can I help you with?");
  }
};

function handleUpdateCareAlertRequest(session, response) {
  var speechOutput = "That's fantastic!";
  var obj = nforce.createSObject('Hancock_Alert__c');
  obj.set('Name','Afternoon medicine complete');
  obj.set('Customer_Alert__c', '0013600000KNWoV');
  obj.set('Time_Date__c', new Date());
  obj.set('Summary__c', 'Afternoon medicine complete');

  org.authenticate({ username: USERNAME, password: PASSWORD }).then(function(){
    return org.insert({ sobject: obj })
  }).then(function(results) {
    if (results.success) {
      response.tellWithCard(speechOutput, "Hancock", speechOutput);
    } else {
      speechOutput = 'Darn, there was a problem, sorry.';
      response.tellWithCard(speechOutput, "Hancock", speechOutput);
    }
  }).error(function(err) {
    var errorOutput = 'Darn, there was a problem, sorry';
    response.tell(errorOutput, "Hancock", errorOutput);
  });
}

function handleFindNextCarePlanStepRequest(session, response) {
  var speechOutput = "Your next step is to take afternoon medicine at 4pm";
  response.ask(speechOutput);
}

function handleRefillPcpRequest(session, response) {
  var speechOutput = "Your prescription has been sent to the pharmacy, you have 1 more refill remaining";
  var obj = nforce.createSObject('Hancock_Alert__c');
  obj.set('Name','Prescription refill request');
  obj.set('Customer_Alert__c', '0013600000KNWoV');
  obj.set('Time_Date__c', new Date());
  obj.set('Summary__c', 'Prescription refill request');

  org.authenticate({ username: USERNAME, password: PASSWORD }).then(function(){
    return org.insert({ sobject: obj })
  }).then(function(results) {
    if (results.success) {
      response.tellWithCard(speechOutput, "Hancock", speechOutput);
    } else {
      speechOutput = 'Darn, there was a problem, sorry.';
      response.tellWithCard(speechOutput, "Hancock", speechOutput);
    }
  }).error(function(err) {
    var errorOutput = 'Darn, there was a problem, sorry';
    response.tell(errorOutput, "Hancock", errorOutput);
  });
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Hancock skill.
    var hancock = new Hancock();
    hancock.execute(event, context);
};
