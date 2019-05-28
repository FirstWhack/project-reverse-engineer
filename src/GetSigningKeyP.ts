import jwksClient from 'jwks-rsa';

function getSigningKeyP(kid: string, jwksUri: string): Promise<string> {
    const jwkc = jwksClient({
        cache: true,
        cacheMaxEntries: 5, // Default value
        cacheMaxAge: 86400000, // 24h
        jwksUri: jwksUri,
        strictSsl: false
    });
    return new Promise<string>(function(resolve, reject) {
        jwkc.getSigningKey(kid, (err, key) => {
            if (err) reject(err);
            else resolve(key.publicKey || key.rsaPublicKey);
        });
    });
}

export default getSigningKeyP;
