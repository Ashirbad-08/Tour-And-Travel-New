/*import Joi from "joi";

export const galleryValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().optional(),
  });

  return schema.validate(data);
};*/
import Joi from "joi";

export const galleryValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().optional(),
  });

  return schema.validate(data);
};

