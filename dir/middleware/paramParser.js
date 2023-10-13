export const paramParser = (match) => {
    try {
        const startParams = match[1].trim();
        let chatId, accountId;
        const parsedParams = {};
        console.log('startParams is ', startParams);
        if (startParams.match(/chatId/)) {
            chatId = startParams.match(/chatId=([^-]+)/);
            if (chatId)
                parsedParams.chatId = chatId[1];
        }
        if (startParams.match(/accountId/)) {
            accountId = startParams.match(/accountId=([^-]+)/);
            if (accountId)
                parsedParams.accountId = accountId[1];
        }
        return parsedParams;
    }
    catch (error) {
        console.log(error);
        let referralCode = '';
        const metrics = {};
        return {};
    }
};
