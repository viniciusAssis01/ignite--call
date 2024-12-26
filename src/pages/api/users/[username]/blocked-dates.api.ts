import { SessionProvider } from "next-auth/react";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).end();
	}

	const username = String(req.query.username);
	const { year, month } = req.query;
	if (!year || !month) {
		return res.status(400).json({ message: "Year or month not specified." });
	}

	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});
	if (!user) {
		return res.status(400).json({ message: "User does not exist." });
	}

	//Dias da semana disponível
	const availableWeekDays = await prisma.userTimeInterval.findMany({
		select: {
			week_day: true,
		},
		where: {
			user_id: user.id,
		},
	});

	//Dias de semana bloqueados
	const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
		return !availableWeekDays.some(
			(availableWeekDay) => availableWeekDay.week_day === weekDay
		);
	});

	const blockedDatesRaw = await prisma.$queryRaw`
	SELECT 
		EXTRACT(DAY FROM S.date) AS date,
		COUNT(S.date) AS amount,
		((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size
	FROM schedulings S 

	LEFT JOIN user_time_intervals UTI
		ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))

	WHERE S.user_id = ${user.id}
		AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}

	GROUP BY EXTRACT(DAY FROM S.date),
		((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)

	HAVING amount >= size
	`;

	console.log(blockedDatesRaw);

	return res.json({ blockedWeekDays });
}
