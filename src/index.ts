import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import "dotenv-safe/config";
import express from "express";
import session from "express-session";

// @ts-ignore
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js"; //bro

import json2csv from "json2csv";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { v4 } from "uuid";
import { AppDataSource } from "./data-source";
import { User, UserRoles } from "./entity/User";
import { FileResolver } from "./resolvers/FileResolver";
import { SearchResolver } from "./resolvers/SearchResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { GraphqlContext } from "./types";

(async () => {
	let reconnect = 1;
	while (true) {
		try {
			const db = await AppDataSource.initialize();
			console.log("connected", db.isConnected);
			break;
		} catch (error) {
			console.log(error);
			console.log(`[retries=${reconnect}]reconnecting to database...`);
			await new Promise((resolve) => setTimeout(resolve, 1000 * 3));
			reconnect++;
		}
	}

	const app = express();

	app.set("trust proxy", 1);
	app.use(
		cors({
			origin: process.env.WEB_SERVER_ORIGIN,
			credentials: true,
		})
	);

	app.use(
		session({
			name: "jaiz",
			secret: v4(),
			resave: false,
			saveUninitialized: true,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 7,
				sameSite: "lax",
				secure: false,
			},
		})
	);

	app.use(graphqlUploadExpress());

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver, SearchResolver, FileResolver],
			authChecker: async ({ context }, roles) => {
				const { req } = context as GraphqlContext;

				if (!req.session.userId) {
					return false;
				}

				// change to request to db?
				// if (!roles.includes(req.session.user.role)) {
				// 	return false;
				// }
				const user = await User.findOne({
					where: { id: req.session.userId },
				});

				if (!user) {
					return false;
				}

				if (!roles.includes(user.role)) {
					return false;
				}

				return true;
			},
		}),
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground({
				settings: {
					"request.credentials": "include",
				},
			}),
		],
		context: ({ req, res }) => ({ req, res }),
		formatError: (error) => ({ message: error.message }),
		// csrfPrevention: true,
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app, cors: false });

	app.get("/export/users", async (_, res) => {
		const users = await User.createQueryBuilder()
			.select([
				"User.id",
				"User.username",
				"User.firstName",
				"User.lastName",
			])
			.where("role=:role", {
				role: UserRoles.Normal,
			})
			.getMany();

		res.setHeader("Content-disposition", "attachment; filename=users.csv");
		res.set("Content-Type", "text/csv");
		res.status(200).send(json2csv.parse(users));
	});

	app.listen(parseInt(process.env.SERVER_PORT!), () => {
		console.log(
			`Server started on http://localhost:${process.env.SERVER_PORT}${apolloServer.graphqlPath}`
		);
	});
})();
