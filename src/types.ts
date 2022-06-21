import { Request, Response } from "express";
import { Stream } from "stream";
import { Field, InputType, ObjectType } from "type-graphql";
import { User, UserRoles } from "./entity/User";

export type GraphqlContext = {
	req: Request;
	res: Response;
};

declare module "express-session" {
	interface Session {
		userId?: string;
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			POSTGRES_USERNAME: string;
			POSTGRES_DB: string;
			POSTGRES_PASSWORD: string;
			POSTGRES_HOST: string;
			POSTGRES_PORT: string;
			SERVER_PORT: string;
			WEB_SERVER_ORIGIN: string;
			INITIAL_ADMIN_USERNAME: string;
			INITIAL_ADMIN_PASSWORD: string;
		}
	}
}

@InputType()
export class LoginInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@ObjectType()
export class FieldErrors {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
export class UserResponse {
	@Field({ nullable: true })
	data: User;
	@Field(() => [FieldErrors], { nullable: true })
	errors: FieldErrors[];

	setData(data: User) {
		this.data = data;
		return this;
	}
	setErrors(errors: FieldErrors[]) {
		this.errors = errors;
		return this;
	}
}

export interface Upload {
	filename: string;
	mimetype: string;
	encoding: string;
	createReadStream: () => Stream;
}

@ObjectType()
export class HandleErrors {
	@Field(() => [FieldErrors], { nullable: true })
	errors?: FieldErrors[];
	@Field(() => [User], { nullable: true })
	createdUsers: User[];

	setCreatedUsers(users: User[]) {
		this.createdUsers = users;
		return this;
	}
	setErrors(errors: FieldErrors[]) {
		this.errors = errors;
		return this;
	}
}

@InputType()
export class UserFields {
	@Field()
	username: string;
	@Field()
	firstName: string;
	@Field()
	lastName: string;
	@Field(() => UserRoles)
	role: keyof typeof UserRoles;
}

@InputType()
export class RegisterInput {
	@Field()
	username: string;
	@Field()
	password: string;
	@Field()
	firstName: string;
	@Field()
	lastName: string;
	@Field(() => UserRoles)
	role: keyof typeof UserRoles;
}
