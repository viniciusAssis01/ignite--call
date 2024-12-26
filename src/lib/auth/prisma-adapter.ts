import { Adapter } from "next-auth/adapters";
import { prisma } from "../prisma";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { parseCookies, destroyCookie } from "nookies";

//a tipagem do que essa função retorna, vem da propria lib nextauth
export function PrismaAdapter(
	req: NextApiRequest | NextPageContext["req"],
	res: NextApiResponse | NextPageContext["res"]
): Adapter {
	return {
		async createUser(user) {
			//a gente passa como argumento desse método um objeto, q vai ter a propriedade req q é igual a req (lembra q req é para resgatar os cookies). estamos renomeando o nosso "@igniteCall..." para userIdOnCookies
			const { "@igniteCall:userId": userIdOnCookies } = parseCookies({ req });

			if (!userIdOnCookies) {
				throw new Error("User ID not found on cookies.");
			}

			const prismaUser = await prisma.user.update({
				where: {
					id: userIdOnCookies,
				},
				data: {
					name: user.name,
					email: user.email,
					avatar_url: user.avatar_url,
				},
			});

			//apos o usuario fazer login social, podemos apagar o cookie (ja q ele ñ vai mais ser utilizado). para isso vamos importar da lib nookies, o método destroyCookie > ele recebe como 1ºargumento o res (o res é onde criamos, modificamos ou deletamos os cookies) > e como 2ºargumento, vamos passar (como string) o nome do cookie q queremos deletar > como 3ºargumento um objeto com a propriedade path, cujo valor  ser a string "/" q significa q vai deleter esse cookie para todas as paginas (vai ser um delete global).
			destroyCookie({ res }, "@igniteCall:userId", {
				path: "/",
			});

			//agora vamos retornar o usuario atualizado dentro do prisma
			return {
				id: prismaUser.id,
				name: prismaUser.name,
				username: prismaUser.username,
				email: prismaUser.email!,
				emailVerified: null,
				avatar_url: prismaUser.avatar_url!,
			};
		},

		async getUser(id) {
			const user = await prisma.user.findUnique({
				where: {
					id,
				},
			});

			if (!user) {
				return null;
			}

			return {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email!,
				emailVerified: null,
				avatar_url: user.avatar_url!,
			};
		},

		async getUserByEmail(email) {
			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			if (!user) {
				return null;
			}

			return {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email!,
				emailVerified: null,
				avatar_url: user.avatar_url!,
			};
		},

		async getUserByAccount({ providerAccountId, provider }) {
			//antes estavamos desestruturando, mas se ñ encontrar ñ vai dar para fazer a desestruturação
			const account = await prisma.account.findUnique({
				where: {
					provider_provider_account_id: {
						provider,
						provider_account_id: providerAccountId,
					},
				},
				include: {
					//junto com a account vai trazer o usuario
					user: true,
				},
			});

			if (!account) {
				return null;
			}

			const { user } = account;

			return {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email!,
				emailVerified: null,
				avatar_url: user.avatar_url!,
			};
		},

		async updateUser(user) {
			const prismaUser = await prisma.user.update({
				where: {
					id: user.id!,
				},
				data: {
					name: user.name,
					email: user.email,
					avatar_url: user.avatar_url,
				},
			});

			return {
				id: prismaUser.id,
				name: prismaUser.name,
				username: prismaUser.username,
				email: prismaUser.email!,
				emailVerified: prismaUser,
				avatar_url: prismaUser.avatar_url!,
			};
			//se colocamos o parametro user como valor de algumas propriedades retornada nessa função vai dar erro. pois user é o usuario antes da atualização. prismaUser é o user é o usuario os os dados alterados.
		},

		//async deleteUser(userId) {},

		async linkAccount(account) {
			await prisma.account.create({
				data: {
					user_id: account.userId,
					type: account.type,
					provider: account.provider,
					provider_account_id: account.providerAccountId,
					refresh_token: account.refresh_token,
					access_token: account.access_token,
					expires_at: account.expires_at,
					token_type: account.token_type,
					scope: account.scope,
					id_token: account.id_token,
					session_state: account.session_state,
				},
			});
		},

		//async unlinkAccount({ providerAccountId, provider }) {},

		async createSession({ sessionToken, userId, expires }) {
			await prisma.session.create({
				data: {
					user_id: userId,
					expires,
					session_token: sessionToken,
				},
			});

			return {
				userId,
				expires,
				sessionToken,
			};
		},

		async getSessionAndUser(sessionToken) {
			const prismaSession = await prisma.session.findUnique({
				where: {
					session_token: sessionToken,
				},
				include: {
					user: true,
				},
			});

			if (!prismaSession) {
				return null;
			}

			const { user, ...session } = prismaSession;

			return {
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					email: user.email!,
					emailVerified: null,
					avatar_url: user.avatar_url!,
				},
				session: {
					expires: session.expires,
					sessionToken: session.session_token,
					userId: session.user_id,
				},
			};
		},

		async updateSession({ sessionToken, userId, expires }) {
			const prismaSession = await prisma.session.update({
				where: {
					session_token: sessionToken,
				},
				data: {
					expires,
					user_id: userId,
				},
			});

			return {
				expires: prismaSession.expires,
				userId: prismaSession.user_id,
				sessionToken: prismaSession.session_token,
			};
		},

		async deleteSession(sessionToken) {
			await prisma.session.delete({
				where: {
					session_token: sessionToken,
				},
			});
		},

		//async createVerificationToken({ identifier, expires, token }) {},

		//async useVerificationToken({ identifier, token }) {},
	};
}