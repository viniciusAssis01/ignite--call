import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default async function handle(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).end();
	}

	const username = String(req.query.username);
	const { date, timezoneOffset } = req.query; //

	if (!date || !timezoneOffset) {
		return res
			.status(400)
			.json({ message: "Date or timezoneOffset not provide." });
	}

	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});

	if (!user) {
		return res.status(400).json({ message: "User does not exist." });
	}

	const referenceDate = dayjs(String(date));

	const timezoneOffsetInHours =
		typeof timezoneOffset === "string"
			? Number(timezoneOffset) / 60
			: Number(timezoneOffset[0]) / 60;

	const referenceDateTimezoneOffsetIHours =
		referenceDate.toDate().getTimezoneOffset() / 60;

	const isPastDate = referenceDate.endOf("day").isBefore(new Date());

	if (isPastDate) {
		return res.json({ possibleTimes: [], availability: [] });
	}

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

	const possibleTimes = Array.from({
		length: endHour - startHour,
	}).map((_, i) => {
		return startHour + i;
	});

	const blockedTimes = await prisma.scheduling.findMany({
		select: {
			date: true,
		},
		where: {
			user_id: user.id,
			date: {
				gte: referenceDate
					.set("hour", startHour)
					.add(timezoneOffsetInHours, "hours")
					.toDate(),
				lte: referenceDate
					.set("hour", endHour)
					.add(timezoneOffsetInHours, "hours")
					.toDate(),
			},
		},
	});

	const availableTimes = possibleTimes.filter((time) => {
		const isTimeBlocked = blockedTimes.some(
			(blockedTime) =>
				blockedTime.date.getUTCHours() - timezoneOffsetInHours === time
		);

		const isTimeInPast = referenceDate
			.set("hour", time)
			.subtract(referenceDateTimezoneOffsetIHours, "hours")
			.isBefore(dayjs().utc().subtract(timezoneOffsetInHours, "hours"));

		return !isTimeBlocked && !isTimeInPast;
	});

	return res.json({ possibleTimes, availableTimes });
}
