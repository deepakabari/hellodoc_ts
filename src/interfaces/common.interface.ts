import { Request, Response } from "express";

type Controller = (req: Request, res: Response) => Promise<Response>;

interface Error {
  name: string;
  message: string;
  stack?: string;
}

export { Controller, Error };
