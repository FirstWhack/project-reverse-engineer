import { decode, verify, VerifyOptions } from 'jsonwebtoken';

import getSigningKeyP from './GetSigningKeyP';

export enum authType {
    apiKey = 1,
    S2S = 2
}

export interface authStatus {
    authenticated: boolean;
    status: number;
    message: string;
    type?: authType; // only when authenticated
    tenantId?: string; // optional TenantID from S2S
}

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

async function validateJWT(jsonWebToken: string, jwksUri: string, ignoreExpiration?: boolean, audience?: string): Promise<S2SFullInfo> {
    // decode and get the kid
    // TODO: decode is performed twice [second time in verify] because of the type definition that won't work with callbacks
    // TODO: is it possible to use something different than any for the decoded type?
    let decoded: any = decode(jsonWebToken, { complete: true });
    if (!decoded) {
        throw 'Invalid JWT';
    }

    if (!decoded.header || !decoded.header.kid) {
        throw 'Key ID not found in JWT header';
    }

    let key: string = undefined;
    try {
        key = await getSigningKeyP(decoded.header.kid, jwksUri);
    } catch (err) {
        throw 'Verification Key not found: ' + err;
    }

    const vo: VerifyOptions = {
        audience: audience ? audience : undefined,
        ignoreExpiration: ignoreExpiration,
        algorithms: ['RS256']
    };
    let verified: any = undefined;
    try {
        verified = verify(jsonWebToken, key, vo);
    } catch (err) {
        throw 'JWT verification error: ' + err;
    }
    return verified as S2SFullInfo;
}

export default validateJWT;
