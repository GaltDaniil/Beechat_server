interface Parser {
    (match: RegExpExecArray): {};
}

export const paramParser: Parser = (match) => {
    try {
        const startParams = match[1].trim();
        let chatId, accountId, fromUrl;

        const parsedParams: { chat_id?: string; account_id?: string; from_url?: string } = {};

        console.log('startParams is ', startParams);
        if (startParams.match(/chatId/)) {
            chatId = startParams.match(/chatId=([^_]+)/);
            if (chatId) parsedParams.chat_id = chatId[1];
        }
        if (startParams.match(/accountId/)) {
            accountId = startParams.match(/accountId=([^_]+)/);
            if (accountId) parsedParams.account_id = accountId[1];
        }
        if (startParams.match(/fromUrl/)) {
            fromUrl = startParams.match(/fromUrl=([^_]+)/);
            if (fromUrl) parsedParams.from_url = fromUrl[1];
        }
        return parsedParams;
    } catch (error) {
        console.log(error);
        return {};
    }
};
