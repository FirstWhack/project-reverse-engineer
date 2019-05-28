import validateJWT from "./ValidateJwt";
import MSALScript from './MSAL.js';

const log = console;

interface S2SBasicInfo {
  aud: string;
  exp: string;
}

interface S2SFullInfo extends S2SBasicInfo {
  appid: string;
  app_displayname: string;
  upn: string;
  tid: string;
  scp: string; // probably this is not a string?
  ipaddr?: string;
  name?: string;
  unique_name?: string;
}
// Interface that contains the required token information
export interface S2SAuthInfo {
  actor: S2SBasicInfo;
  access: S2SFullInfo;
}

async function _s2s_auth(
  authString: string,
  jwksUri: string,
  audience: string,
  ignoreExpiration?: boolean
): Promise<S2SAuthInfo> {
  // verify the token starts with MSAuth1.0
  if (!authString.startsWith("MSAuth1.0 "))
    throw "Invalid Bearer Token - not S2S";

  // extract the tokens
  let tokens: string[] = authString.substr("MSAuth1.0 ".length).split(",");

  // tokens lenght must be 3
  if (tokens.length !== 3) throw "Invalid Bearer Token - missing field";

  // Make sure types are correct
  if (!tokens[0].startsWith("actortoken=")) throw "Invalid actor token";
  if (!tokens[1].startsWith("accesstoken=")) throw "Invalid access token";
  if (tokens[2] !== 'type="PFAT"') throw "Invalid token type";

  let actorHeader: string = tokens[0]
    .substr("actortoken=".length)
    .replace(/(^")|("$)/g, "");
  let accessHeader: string = tokens[1]
    .substr("accesstoken=".length)
    .replace(/(^")|("$)/g, "");

  if (!actorHeader.startsWith("Bearer "))
    throw "Actor token is not of Bearer type";
  if (!accessHeader.startsWith("Bearer "))
    throw "Access token is not of Bearer type";

  let actorJWT: string = actorHeader.split(" ")[1];
  let accessJWT: string = accessHeader.split(" ")[1];

  let authInfo = {
    actor: <S2SBasicInfo>{},
    access: <S2SFullInfo>{}
  };

  try {
    let verifiedActor: S2SBasicInfo = await validateJWT(
      actorJWT,
      jwksUri,
      ignoreExpiration,
      audience
    );
    authInfo.actor.aud = verifiedActor.aud;
    authInfo.actor.exp = verifiedActor.exp;

    let verifiedAccess: S2SFullInfo = await validateJWT(
      accessJWT,
      jwksUri,
      ignoreExpiration
    );
    authInfo.access.aud = verifiedAccess.aud;
    authInfo.access.exp = verifiedAccess.exp;
    authInfo.access.tid = verifiedAccess.tid;
    authInfo.access.scp = verifiedAccess.scp;
    authInfo.access.appid = verifiedAccess.appid;
    authInfo.access.upn = verifiedAccess.upn;
    authInfo.access.app_displayname = verifiedAccess.app_displayname;
    authInfo.access.ipaddr = verifiedAccess.ipaddr || undefined;
    authInfo.access.unique_name = verifiedAccess.unique_name || undefined;
    authInfo.access.name = verifiedAccess.name || undefined;
  } catch (err) {
    log.error("parse_s2s: Cannot Verify Token with error: " + err);
    throw "parse_s2s: Cannot Verify Token with error: " + err;
  }
  console.log("Validated ", authInfo);
  return authInfo;
}

MSALScript(_s2s_auth);

// console;
// console.log(
//   _s2s_auth(
//     "MSAuth1.0 " +
//       "actortoken=Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjFMVE16YWtpaGlSbGFfOHoyQkVKVlhlV01xbyJ9.eyJ2ZXIiOiIyLjAiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vOTE4ODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkL3YyLjAiLCJzdWIiOiJBQUFBQUFBQUFBQUFBQUFBQUFBQUFMZkFQY1oxb01UdmZVSjhiMzIxeTFrIiwiYXVkIjoiMzdlNzFjNzYtZDFiMy00ODk4LWEzZTYtZGRmYjdmODYyYTI1IiwiZXhwIjoxNTU5MDY2NzQyLCJpYXQiOjE1NTkwNjI4NDIsIm5iZiI6MTU1OTA2Mjg0MiwibmFtZSI6Ikpvc2lhaCBTb3V0aCIsInByZWZlcnJlZF91c2VybmFtZSI6Impvc2lhaGRzb3V0aEBnbWFpbC5jb20iLCJvaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMjJkZC1mMmJiZmFjMzI0MjgiLCJ0aWQiOiI5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJhenAiOiIzN2U3MWM3Ni1kMWIzLTQ4OTgtYTNlNi1kZGZiN2Y4NjJhMjUiLCJzY3AiOiJ0ZXN0IiwiYXpwYWNyIjoiMCIsImFpbyI6IkRSWVRWYVFQNzZqUk9OaWZLNDJLbm9iWDB5RndUQlZuS3NudEQqZTdRa3d2UWhxeFMzYlplcnFkVzJ1bWgxWGdiRmplcFZPckRoalUwRVNUZnhkM2hQaFUxY3ZBeW1GKk5QTkkqWlQyY3FNeSJ9.n_CI4adpww3mFoZSh9JAftrXqN81Chebbxttfyu5D-CTJKgVryX4-z8yNSwCkfKArMftDP618RdhXpi5byqWua0C6P09ZB9JaWv5PULdOlXJbRDVNONK5tByGv7RdLW2Pa9HXkgvZSShUymxCnNBqKyXHB1uo2g95ZgY4qpOkFvOd_3hxQNys1SnCIkzEQdLIvIEElHLXpH3U27kaUIxEq1Hk-Q_75TDLveubsSUWogKQgtney64KbrzNuDIchI6aDXlpdbVJt4v5kjz5PdpHrO1YBUYqjzzy-QjdTuXNqcU768r3RLIJSiba51ZQP7tv1SNKcX0GWGM2jPj5wx73A," +
//       "accesstoken=Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjFMVE16YWtpaGlSbGFfOHoyQkVKVlhlV01xbyJ9.eyJ2ZXIiOiIyLjAiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vOTE4ODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkL3YyLjAiLCJzdWIiOiJBQUFBQUFBQUFBQUFBQUFBQUFBQUFMZkFQY1oxb01UdmZVSjhiMzIxeTFrIiwiYXVkIjoiMzdlNzFjNzYtZDFiMy00ODk4LWEzZTYtZGRmYjdmODYyYTI1IiwiZXhwIjoxNTU5MDY2NzQyLCJpYXQiOjE1NTkwNjI4NDIsIm5iZiI6MTU1OTA2Mjg0MiwibmFtZSI6Ikpvc2lhaCBTb3V0aCIsInByZWZlcnJlZF91c2VybmFtZSI6Impvc2lhaGRzb3V0aEBnbWFpbC5jb20iLCJvaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMjJkZC1mMmJiZmFjMzI0MjgiLCJ0aWQiOiI5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJhenAiOiIzN2U3MWM3Ni1kMWIzLTQ4OTgtYTNlNi1kZGZiN2Y4NjJhMjUiLCJzY3AiOiJ0ZXN0IiwiYXpwYWNyIjoiMCIsImFpbyI6IkRSWVRWYVFQNzZqUk9OaWZLNDJLbm9iWDB5RndUQlZuS3NudEQqZTdRa3d2UWhxeFMzYlplcnFkVzJ1bWgxWGdiRmplcFZPckRoalUwRVNUZnhkM2hQaFUxY3ZBeW1GKk5QTkkqWlQyY3FNeSJ9.n_CI4adpww3mFoZSh9JAftrXqN81Chebbxttfyu5D-CTJKgVryX4-z8yNSwCkfKArMftDP618RdhXpi5byqWua0C6P09ZB9JaWv5PULdOlXJbRDVNONK5tByGv7RdLW2Pa9HXkgvZSShUymxCnNBqKyXHB1uo2g95ZgY4qpOkFvOd_3hxQNys1SnCIkzEQdLIvIEElHLXpH3U27kaUIxEq1Hk-Q_75TDLveubsSUWogKQgtney64KbrzNuDIchI6aDXlpdbVJt4v5kjz5PdpHrO1YBUYqjzzy-QjdTuXNqcU768r3RLIJSiba51ZQP7tv1SNKcX0GWGM2jPj5wx73A," +
//       'type="PFAT"',
//     _jwksUri
//   )
// );
