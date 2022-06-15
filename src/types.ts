import { Request, Response } from "express";
import { Stream } from "stream";
import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "./entity/User";

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
