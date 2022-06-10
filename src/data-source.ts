import { DataSource } from "typeorm";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
	type: "postgres",
	username: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT!),
	database: process.env.POSTGRES_DB,
	synchronize: true,
	logging: true,
	entities: [User],
	migrations: [],
	subscribers: [],
});
