import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import "dotenv-safe/config";
import express from "express";
import session from "express-session";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { v4 } from "uuid";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { UserResolver } from "./resolvers/UserResolver";
import { GraphqlContext } from "./types";

(async () => {
	await AppDataSource.initialize();

	const app = express();
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

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver],
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
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app });

	app.listen(parseInt(process.env.SERVER_PORT!), () => {
		console.log(
			`Server started on http://localhost:${process.env.SERVER_PORT}${apolloServer.graphqlPath}`
		);
	});
})();
