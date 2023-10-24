interface IParams {
    chat_id?: string;
    account_id?: string;
    from_url?: string;
}

export const vkParamParser = (str: string): IParams => {
    try {
        let chatId, accountId, fromUrl;

        const parsedParams: IParams = {};

        console.log('vkParams is ', str);

        if (str.match(/chatId/)) {
            chatId = str.match(/chatId=([^_]+)/);
            console.log('chatId', chatId);
            if (chatId) parsedParams.chat_id = chatId[1];
        }
        if (str.match(/accountId/)) {
            accountId = str.match(/accountId=([^_]+)/);
            console.log('accountId', accountId);
            if (accountId) parsedParams.account_id = accountId[1];
        }
        if (str.match(/fromUrl/)) {
            fromUrl = str.match(/fromUrl=([^_]+)/);
            console.log('fromUrl', fromUrl);
            if (fromUrl) parsedParams.from_url = fromUrl[1];
        }
        return parsedParams;
    } catch (error) {
        console.log(error);
        return {};
    }
};
