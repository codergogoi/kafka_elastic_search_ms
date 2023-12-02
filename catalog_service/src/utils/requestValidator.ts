import { ClassConstructor, plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";

const validationError = async (
  input: any
): Promise<ValidationError[] | false> => {
  const errors = await validate(input, {
    validationError: { target: true },
  });

  if (errors.length) {
    return errors;
  }

  return false;
};

export const RequestValidator = async <T>(
  type: ClassConstructor<T>,
  body: any
): Promise<{ errors: boolean | string; input: T }> => {
  const input = plainToClass(type, body);

  const errors = await validationError(input);
  if (errors) {
    const errorMessage = errors
      .map((error: ValidationError) =>
        (Object as any).values(error.constraints)
      )
      .join(", ");
    return { errors: errorMessage, input };
  }

  return { errors: false, input };
};
