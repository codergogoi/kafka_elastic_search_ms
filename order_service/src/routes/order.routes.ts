import express, { NextFunction, Request, Response } from "express";
import { MessageBroker } from "../utils";
import { OrderEvent, OrderStatus } from "../types";
import { RequestAuthorizer } from "./middleware";
import * as service from "../service/order.service";
import { OrderRepository } from "../repository/order.repository";
import { CartRepository } from "../repository/cart.repository";

const repo = OrderRepository;
const cartRepo = CartRepository;
const router = express.Router();

router.post(
  "/orders",
  RequestAuthorizer,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new Error("User not found"));
      return;
    }
    const response = await service.CreateOrder(user.id, repo, cartRepo);
    return res.status(200).json(response);
  }
);

router.get(
  "/orders",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new Error("User not found"));
      return;
    }
    const response = await service.GetOrders(user.id, repo);
    return res.status(200).json(response);
  }
);

router.get(
  "/orders/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new Error("User not found"));
      return;
    }
    const response = await service.GetOrder(user.id, repo);
    return res.status(200).json(response);
  }
);

// Both are TODO: Implement
// only going to call from microservice
router.patch(
  "/orders/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    // security check for microservice calls only
    const orderId = parseInt(req.params.id);
    const status = req.body.status as OrderStatus;
    const response = await service.UpdateOrder(orderId, status, repo);
    return res.status(200).json(response);
  }
);

// only going to call from microservice
router.delete(
  "/orders/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new Error("User not found"));
      return;
    }
    const orderId = parseInt(req.params.id);
    const response = await service.DeleteOrder(orderId, repo);
    return res.status(200).json(response);
  }
);

export default router;
