import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { buildNextAuthOptions } from "../auth/[...nextauth].api";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const timeIntervalsBodySchema = z.object({
	intervals: z.array(
		z.object({
			weekDay: z.number().min(0).max(6),
			startTimeInMinutes: z.number(),
			endTimeInMinutes: z.number(),
		})
	),
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	//essa é uma rota que vai ser chamada para CADASTRAR os intervalos de tempo q o usuário tem de disponibilidade.
	if (req.method !== "POST") {
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
	const { intervals } = timeIntervalsBodySchema.parse(req.body);

	//vamos criar varios intervalos de uma vez. mas o sqlite ñ permite que trabalhamos com insert multiplo
	await Promise.all(
		intervals.map((interval) => {
			return prisma.userTimeInterval.create({
				data: {
					week_day: interval.weekDay,
					time_start_in_minutes: interval.startTimeInMinutes,
					time_end_in_minutes: interval.endTimeInMinutes,
					user_id: session.user?.id,
				},
			});
		})
	);

	return res.status(201).end();
}
