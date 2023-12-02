import { faker } from "@faker-js/faker";
import { Factory } from "rosie";
import { Product } from "../../models/product.model";

export const ProductFactory = new Factory<Product>()
  .attr("id", faker.number.int({ min: 1, max: 1000 }))
  .attr("name", faker.commerce.productName())
  .attr("description", faker.commerce.productDescription())
  .attr("stock", faker.number.int({ min: 10, max: 100 }))
  .attr("price", +faker.commerce.price());
