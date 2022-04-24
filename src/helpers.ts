import { connect, Room } from "twilio-video";

interface GetTokenError {
  errors: Partial<Record<"room" | "username", string>>;
}

async function getToken({
  username,
  room,
}: {
  username: string;
  room?: string;
}) {
  const response = await fetch("/api/get_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, room }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as GetTokenError;

    let errorMessage = "";

    if (error.errors) {
      errorMessage = Object.entries(error.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
    }

    throw new Error(errorMessage);
  }

  return data;
}

export async function connectToRoom({
  username,
  room: roomName,
}: {
  username: string;
  room?: string;
}): Promise<Room> {
  const { token, roomName: authorizedRoomName } = await getToken({
    username,
    room: roomName,
  });

  const room = await connect(token, {
    audio: true,
    video: {
      width: 640,
    },
    name: authorizedRoomName,
  });

  return room;
}
