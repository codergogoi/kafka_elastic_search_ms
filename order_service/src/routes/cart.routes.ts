import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/cart.service";
import * as repository from "../repository/cart.repository";
import { ValidateRequest } from "../utils/validator";
import { CartRequestInput, CartRequestSchema } from "../dto/cartRequest.do";

const router = express.Router();
const repo = repository.CartRepository;

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // jwt
  const isValidUser = true;
  if (!isValidUser) {
    return res.status(403).json({ error: "authorization error" });
  }

  next();
};

router.post(
  "/cart",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const error = ValidateRequest<CartRequestInput>(
        req.body,
        CartRequestSchema
      );

      if (error) {
        return res.status(404).json({ error });
      }

      const response = await service.CreateCart(
        req.body as CartRequestInput,
        repo
      );
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ error });
    }
  }
);

router.get("/cart", async (req: Request, res: Response, next: NextFunction) => {
  // comes from our auth user parsed from JWT
  const response = await service.GetCart(req.body.customerId, repo);
  return res.status(200).json(response);
});

router.patch(
  "/cart/:lineItemId",
  async (req: Request, res: Response, next: NextFunction) => {
    const liteItemId = req.params.lineItemId;
    const response = await service.EditCart(
      {
        id: +liteItemId,
        qty: req.body.qty,
      },
      repo
    );
    return res.status(200).json(response);
  }
);

router.delete(
  "/cart/:lineItemId",
  async (req: Request, res: Response, next: NextFunction) => {
    const liteItemId = req.params.lineItemId;
    console.log(liteItemId);
    const response = await service.DeleteCart(+liteItemId, repo);
    return res.status(200).json(response);
  }
);

export default router;
