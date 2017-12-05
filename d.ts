interface Config {
    /** Bot token */
    token: string,
    /** Guild to stalk */
    guild: string,
    /** Twitter API */
    twitter: {
        consumer_key: string,
        consumer_secret: string,
        access_token_key: string,
        access_token_secret: string,
        /** Channel to post to */
        channel: string,
        /** Users to watch */
        users: number[]
    }
    /** 
     * Feedback channel
     * @deprecated
     */
    feedbackchannel: number,
    /** Channels to send feedback into */
    feedbackchannels: {
        [x: string]: string[]
    },
    /** Channel for voting */
    voteschannel: number
    /** Status identifiers */
    statuses: {
        [x: string]: string[]
    },
    /** Level identifiers */
    levels: {
        [x: string]: string
    }
}