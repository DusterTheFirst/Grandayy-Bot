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
    /** Channel for QOTW submissions to be approved in */
    QOTWsubmissions: string
    /** 
     * Feedback channel
     * @deprecated
     */
    feedbackchannel: string,
    /** Channels to send feedback into */
    feedbackchannels: {
        [x: string]: string[]
    },
    /** Channel for voting */
    voteschannel: string
    /** Status identifiers */
    statuses: {
        [x: string]: string[]
    },
    /** Level identifiers */
    levels: {
        [x: string]: string
    }
}

declare module 'humanize-duration' {
    function humanize(miliseconds: number, options?: {
        /** Language for unit display (accepts an ISO 639-1 code from one of the supported languages). */
        language?: string,
        /** String to display between the previous unit and the next value. */
        delimiter?: string,
        /** String to display between each value and unit. */
        spacer?: string,
        /** Number representing the maximum number of units to display for the duration. */
        largest?: number,
        /** Array of strings to define which units are used to display the duration (if needed). Can be one, or a combination of any, of the following: `['y', 'mo', 'w', 'd', 'h', 'm', 's', 'ms']` */
        units?: string[],
        /** Boolean value. Use true to round the smallest unit displayed (can be combined with `largest` and `units`). */
        round?: boolean
        /** String to substitute for the decimal point in a decimal fraction. */
        decimal?: string,
        /** String to include before the final unit. You can also set `serialComma` to `false` to eliminate the final comma. */
        conjunction?: string,
        /** Customize the value used to calculate each unit of time. */
        unitMeasures?: { [x: string]: string }
    }): string;
    export = humanize;
}