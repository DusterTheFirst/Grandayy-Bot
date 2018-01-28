export class OAuthTokenExpiredError extends Error {
    name: "OAuthTokenExpiredError";
    message: "OAuth Access Token Expired";

    constructor() {
        super();
        this.name = "OAuthTokenExpiredError";
        this.message = "OAuth Access Token Expired";
    }
}

export class OAuthCodeExpiredError extends Error {
    name: "OAuthCodeExpiredError";
    message: "OAuth Code Expired";

    constructor() {
        super();
        this.name = "OAuthCodeExpiredError";
        this.message = "OAuth Code Expired";
    }
}