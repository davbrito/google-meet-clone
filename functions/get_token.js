const STATUS_CODES = require("http-status");

const { AccessToken } = Twilio.jwt;

/**
 * @typedef {import("@twilio-labs/serverless-runtime-types/types").Context<{
 *   ACCOUNT_SID: string;
 *   API_KEY_SID: string;
 *   API_KEY_SECRET: string;
 * }>} Context
 *
 * @typedef {import("@twilio-labs/serverless-runtime-types/types").ServerlessEventObject<{
 *     username?: string;
 *     room?: string;
 *   }>} Event
 *
 * @typedef {import("@twilio-labs/serverless-runtime-types/types").ServerlessCallback} Callback
 */

/**
 * @param {Context} context
 * @param {Event} event
 * @param {Callback} callback
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();

  const { ACCOUNT_SID, API_KEY_SID, API_KEY_SECRET } = context;
  let { username, room } = event;

  room = room || "default";

  if (!username) {
    response.setStatusCode(STATUS_CODES.BAD_REQUEST);
    response.setBody({
      errors: {
        username: "Username is required",
      },
    });
    return callback(null, response);
  }

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY_SID, API_KEY_SECRET);

  accessToken.identity = username;

  const grant = new AccessToken.VideoGrant({ room: room });

  accessToken.addGrant(grant);

  return callback(null, { token: accessToken.toJwt(), room });
};
