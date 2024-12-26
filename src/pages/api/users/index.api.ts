import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { setCookie } from "nookies";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).end();
		//esse ".end()" diferente do ".send()" ou do ".json()" ele envia a resposta sem nenhum corpo - adicionar no resumo backend
	}

	const { name, username } = req.body;
	//agora vamos usar o prisma para cadastrar o usuario no DB.

	const userExists = await prisma.user.findUnique({
		where: {
			username,
		},
	});

	if (userExists) {
		return res.status(400).json({
			message: "Username already exists",
		});
	}

	const user = await prisma.user.create({
		data: {
			name,
			username,
		},
	});

	setCookie({ res }, "@igniteCall:userId", user.id, {
		maxAge: 60 * 60 * 24 * 7, //7 day
		path: "/",
	});

	return res.status(201).json(user);
}
