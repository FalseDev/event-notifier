import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";

const { PORT = "8000", PUSHBULLET_API_KEY, GIST_ID } = Deno.env.toObject();

function checkConfigVars(config: { [key: string]: string }) {
  for (const key of Object.keys(config)) {
    if (typeof config[key] !== "string") {
      throw new Error(`Config env var ${key} missing!`);
    }
  }
}

// Check required variables
checkConfigVars({ PUSHBULLET_API_KEY, GIST_ID });

async function postNotification(message: string) {
  const resp = await fetch("https://api.pushbullet.com/v2/pushes", {
    method: "POST",
    headers: {
      "Access-Token": PUSHBULLET_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: message,
      title: "Events",
      type: "note",
    }),
  });
  if (resp.status != 200) {
    throw new Error("Posting to PushBullet failed");
  }
}

async function getData(): Promise<{
  [key: string]: [{ name: string; date: string }];
}> {
  const resp = await fetch(
    `https://api.github.com/gists/${GIST_ID}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  const fileContent = (await resp.json()).files["events.json"].content;
  return JSON.parse(fileContent);
}

async function checkUpcomingEvents(request: Request) {
  const { error } = await validateRequest(request, {
    GET: { params: ["days"] },
  });
  if (error) {
    return json(error);
  }
  const url = new URL(request.url);
  const n = +url.searchParams.get("days")!;
  if (Number.isNaN(n)) {
    return json(
      { message: "param 'days' must be a number", status: 400 },
      {
        status: 400,
      },
    );
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  // Get the date without current time
  const currentDate = new Date(
    Math.floor(new Date().getTime() / msPerDay) * msPerDay,
  );
  const withinDate = new Date(currentDate.getTime() + n * msPerDay);
  const data = await getData();

  let message = "";
  const events = [];
  for (const eventName of Object.keys(data)) {
    const newEvents = data[eventName]
      .map(({ name, date: dateString }) => {
        const date = new Date(dateString);
        date.setUTCFullYear(currentDate.getUTCFullYear());
        // If the event already ended this year, check next year
        if (date < currentDate) {
          date.setUTCFullYear(currentDate.getUTCFullYear() + 1);
        }
        return { name, date };
      })
      .filter(({ date }) => {
        // The event is within n days and hasn't already ended
        return date <= withinDate && date >= currentDate;
      })
      .sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });
    events.push(...newEvents);
    newEvents.forEach(({ name, date }) => {
      message += `${date.toDateString()}: ${eventName} of ${name}\n`;
    });
  }
  const messageSent = !!message;
  if (messageSent) {
    await postNotification(message);
  }
  return json({ messageSent: messageSent, count: events.length });
}

serve(
  {
    "/checkUpcomingEvents": checkUpcomingEvents,
  },
  { hostname: "0.0.0.0", port: +PORT },
);
