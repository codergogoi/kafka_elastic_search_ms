import request from "supertest";
import express from "express";
import { faker } from "@faker-js/faker";
import catalogRoutes, { catalogService } from "../catalog.routes";
import { ProductFactory } from "../../utils/fixtures";

const app = express();
app.use(express.json());
app.use(catalogRoutes);

const mockRequest = () => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ min: 10, max: 100 }),
    price: +faker.commerce.price(),
  };
};

describe("Catalog Routes", () => {
  describe("POST /products", () => {
    test("should create product successfully", async () => {
      const requestBody = mockRequest();
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .post("/products")
        .send(requestBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(201);
      expect(response.body).toEqual(product);
    });

    test("should response with validation error 400", async () => {
      const requestBody = mockRequest();
      const response = await request(app)
        .post("/products")
        .send({ ...requestBody, name: "" })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("name should not be empty");
    });

    test("should response with an internal error code 500", async () => {
      const requestBody = mockRequest();
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() =>
          Promise.reject(new Error("unable to create product"))
        );
      const response = await request(app)
        .post("/products")
        .send(requestBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(500);
      expect(response.body).toEqual("unable to create product");
    });
  });

  describe("PATCH /products/:id", () => {
    test("should update product successfully", async () => {
      const product = ProductFactory.build();
      const requestBody = {
        name: product.name,
        price: product.price,
        stock: product.stock,
      };
      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(requestBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });

    test("should response with validation error 400", async () => {
      const product = ProductFactory.build();
      const requestBody = {
        name: product.name,
        price: -1,
        stock: product.stock,
      };
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send({ ...requestBody })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("price must not be less than 1");
    });

    test("should response with an internal error code 500", async () => {
      const product = ProductFactory.build();
      const requestBody = mockRequest();
      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() =>
          Promise.reject(new Error("unable to update product"))
        );
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(requestBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(500);
      expect(response.body).toEqual("unable to update product");
    });
  });

  describe("GET /products?limit=0&offset=0", () => {
    test("should return a range of products based on limit and offset", async () => {
      const randomLimit = faker.number.int({ min: 10, max: 50 });
      const products = ProductFactory.buildList(randomLimit);
      jest
        .spyOn(catalogService, "getProducts")
        .mockImplementationOnce(() => Promise.resolve(products));
      const response = await request(app)
        .get(`/products?limit=${randomLimit}&offset=0`)
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });
  });

  describe("GET /products/:id", () => {
    test("should return a product by id", async () => {
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "getProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .get(`/products/${product.id}`)
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });
  });

  describe("DELETE /products/:id", () => {
    test("should delete a product by id", async () => {
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "deleteProduct")
        .mockImplementationOnce(() => Promise.resolve({ id: product.id }));
      const response = await request(app)
        .delete(`/products/${product.id}`)
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: product.id });
    });
  });
});
