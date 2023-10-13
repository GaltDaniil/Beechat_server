import { Request, Response } from 'express';

export const fieldBuild = async (req: Request, res: Response, next: any) => {
    const data = req.body;
    if (data) {
        const id = req.body.id;
        const fields = req.body.fields;
    }
};
