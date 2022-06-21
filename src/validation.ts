import { object, string } from "yup";
import { UserRoles } from "./entity/User";

export const createUserValidationSchema = object().shape({
	username: string().required().min(3).max(50),
	password: string().required().min(3).max(50),
	firstName: string().required().min(3).max(50),
	lastName: string().required().min(3).max(50),
	role: string().required().oneOf(Object.keys(UserRoles)),
});

export const updateUserValidationSchema = object().shape({
	username: string().nullable().min(3).max(50),
	password: string().nullable().min(3).max(50),
	firstName: string().nullable().min(3).max(50),
	lastName: string().nullable().min(3).max(50),
	role: string().nullable().oneOf(Object.keys(UserRoles)),
});
