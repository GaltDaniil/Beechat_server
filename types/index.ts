import { Request, Response, NextFunction } from 'express';

export interface RequestQuery {
    query: {
        PayerID?: string;
        paymentId: string;
        userId: string;
        amount: string;
        usdAmount: string;
    };
}

export interface Middleware {
    (req: Request, res: Response, next: NextFunction): void;
}

export interface RequestBody extends Request {
    body: {
        userId: string;
        userName: string;
        userMessage: string;
        type: string;
        system: string;
        bot: string;
    };
}

export interface IMessage {
    id: number;
    sended_at: Date;
    text: string;
    chat_id: number;
    from_client: boolean;
    is_readed: boolean;
}

export interface IClient {
    id: number;
    account_id: number;
    name: string;
    surname?: string;
    email?: string;
    phone?: string;
    adress?: string;
    avatar?: string;
    utm_source?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    chat_type?: string;
    tag_id?: number;
    manager_id?: number;
    custom_fields?: object;
    created_at: Date;
}
export interface IAccount {
    id: number;
    company_name: string;
    owner_id: number;
}
export interface IPipeline {
    id: number;
    title: string;
    account_id: number;
    created_at: Date;
}
export interface IStage {
    id: number;
    title: string;
    created_at: Date;
    color: string;
    pipeline_id: number;
    index: number;
}
export interface IDeal {
    id: number;
    stage_id: number;
    title: string;
    price: number;
    created_at: Date;
    client_name: string;
    client_surname: string;
    client_url: string;
    client_avatar: string;
}

export interface IChat {
    id: number;
    account_id: number;
    created_at: Date;
    chat_avatar?: string;
    chat_type: string;
    client_id?: number;
    messenger_id?: number;
    is_hidden: boolean;
    from_url: string;
}
