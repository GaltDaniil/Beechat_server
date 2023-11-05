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

export interface IAccount {
    id: number;
    company_name: string;
    owner_id: number;
}

export interface IMessage {
    id: number;
    created_at: Date;
    text: string;
    contact_id: number;
    from_contact: boolean;
    is_readed: boolean;
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

export interface IContact {
    id?: number;
    contact_name: string;
    contact_avatar?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_username?: string;
    messenger_id: number;
    messenger_type: string;
    created_at?: Date;
    account_id: number;
    instagram_chat_id?: string;
    is_hidden?: boolean;
    from_url?: string;
    custom_fields?: object;
    manager_id?: number;
}

export interface IUtm {
    utm_campaign: string;
    utm_source: string;
    utm_medium: string;
    utm_contend: string;
    utm_term: string;
    created_at: Date;
}
