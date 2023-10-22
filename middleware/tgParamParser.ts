interface Parser {
    (match: RegExpExecArray): {};
}

export const paramParser: Parser = (match) => {
    try {
        const startParams = match[1].trim();
        let chat_id, account_id, from_url;

        const parsedParams: { chat_id?: string; account_id?: string; from_url?: string } = {};

        console.log('startParams is ', startParams);
        if (startParams.match(/chat_id/)) {
            chat_id = startParams.match(/chat_id=([^-]+)/);
            if (chat_id) parsedParams.chat_id = chat_id[1];
        }
        if (startParams.match(/account_id/)) {
            account_id = startParams.match(/account_id=([^-]+)/);
            if (account_id) parsedParams.account_id = account_id[1];
        }
        if (startParams.match(/from_url/)) {
            from_url = startParams.match(/from_url=([^-]+)/);
            if (from_url) parsedParams.from_url = from_url[1];
        }
        return parsedParams;
    } catch (error) {
        console.log(error);
        return {};
    }
};
