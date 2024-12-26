import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { buildNextAuthOptions } from "../auth/[...nextauth].api";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateProfileBodySchema = z.object({
	bio: z.string(),
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	//essa é uma rota que vai ser chamada para ATUALIZAR o perfil do usuário.
	if (req.method !== "PUT") {
		return res.status(405).end();
	}

	//obter inf do usuario logado
	const session = await getServerSession(
		req,
		res,
		buildNextAuthOptions(req, res)
	);

	//sessão é quando o usuário está logado ou ñ (se tiver logado,terá uma sessão; caso contrario, ñ)
	if (!session) {
		return res.status(401).end();
	}

	//caso o body ñ venha no formato desse schama,o parse dispara um erro, então ñ precisamos nos preocupar com qlq tipo de if()
	const { bio } = updateProfileBodySchema.parse(req.body);

	//atualizando usuario logado
	await prisma.user.update({
		where: {
			id: session.user.id,
		},
		data: {
			bio,
		},
	});

	return res.status(204).end();
}
