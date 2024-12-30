import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).end();
	}

	//ñ existe params dentro do backend next, por isso usamos o query (q retorna tantos os dados q sao enviado via parametro "[nome do arq]" como tbm o query params [EX: http://localhost:333?username=vinicius])
	const username = String(req.query.username);
	//vai vir do query params
	const { date } = req.query;
	//http://localhost:3333/api/users/diegosf/availability?date=22-12-20

	if (!date) {
		return res.status(400).json({ message: "Date not provide." });
	}

	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});

	if (!user) {
		return res.status(400).json({ message: "User does not exist." });
	}

	//qndo recuperamos alguma inf do req.query, pode retornar um array de string (pois pode ser enviados varios query params). assim transformarmos o array de um unico elemento em string.
	const referenceDate = dayjs(String(date));

	const isPastDate = referenceDate.endOf("day").isBefore(new Date());

	if (isPastDate) {
		return res.json({ possibleTimes: [], availability: [] });
	}

	//agora vamos fazer um cruzamento de dados entre as tabelas timeInterval e schedules.
	const userAvailability = await prisma.userTimeInterval.findFirst({
		where: {
			user_id: user.id,
			week_day: referenceDate.get("day"),
		},
	});

	if (!userAvailability) {
		return res.json({ possibleTimes: [], availability: [] });
	}

	const { time_start_in_minutes, time_end_in_minutes } = userAvailability;

	const startHour = time_start_in_minutes / 60;
	const endHour = time_end_in_minutes / 60;

	//criar um array contendo os intervalos de tempo disponível.
	const possibleTimes = Array.from({
		length: endHour - startHour,
	}).map((_, i) => {
		return startHour + i;
	});

	///verificar se ja existe um agendamento ja marcadado em um dos horarios items do array acima nesse dia especifico.

	const blockedTimes = await prisma.scheduling.findMany({
		select: {
			date: true,
		},
		where: {
			user_id: user.id,
			date: {
				gte: referenceDate.set("hour", startHour).toDate(),
				lte: referenceDate.set("hour", endHour).toDate(),
			},
		},
	});

	//verifica se ñ ha nenhum registre na tabela scheduling onde o time bate com a hora do agendamento.
	const availableTimes = possibleTimes.filter((time) => {
		const isTimeBlocked = blockedTimes.some(
			(blockedTime) => blockedTime.date.getHours() === time
		);

		const isTimeInPast = referenceDate.set("hour", time).isBefore(new Date());

		return !isTimeBlocked && !isTimeInPast;
	});

	return res.json({ possibleTimes, availableTimes });
}
