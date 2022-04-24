import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import * as TwilioVideo from "twilio-video";
import invariant from "invariant";
import { connectToRoom } from "./helpers";
import UserVideo from "./components/UserVideo";
import styles from "./App.module.css";
import { useEventListener } from "./hooks/useEventListener";

function App() {
  const [isSubmiting, setIsSubmiting] = useState(false);

  const [connected, setConnected] = useState(false);

  const [room, setRoom] = useState<TwilioVideo.Room | null>(null);

  const participantsRef = useRef<
    (TwilioVideo.RemoteParticipant | TwilioVideo.LocalParticipant)[]
  >([]);

  const participants = useSyncExternalStore(
    useCallback(
      (callback) => {
        participantsRef.current = [...(room?.participants.values() || [])];
        function handler() {
          participantsRef.current = [...(room?.participants.values() || [])];
          callback();
        }

        room?.on("participantConnected", handler);
        room?.on("participantDisconnected", handler);
        return () => {
          room?.off("participantConnected", handler);
          room?.off("participantDisconnected", handler);
        };
      },
      [room]
    ),
    useCallback(() => {
      return participantsRef.current;
    }, [])
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (connected) {
      room!.disconnect();
      setConnected(false);
      setRoom(null);
      return;
    }

    const form = e.currentTarget;

    const userNameInput = form.elements.namedItem("username");
    const roomNameInput = form.elements.namedItem("room");

    invariant(
      userNameInput instanceof HTMLInputElement,
      "username input not found"
    );
    invariant(
      roomNameInput instanceof HTMLInputElement,
      "room input not found"
    );

    const username = userNameInput.value;
    const roomName = roomNameInput.value;

    try {
      const room = await connectToRoom({ username, room: roomName });
      setConnected(true);
      setRoom(room);
    } catch (e) {
      console.error(e);

      alert(`Failed to connect: ${e}`);
      setConnected(false);
    }
  };

  useEventListener(window, "beforeunload", () => {
    room?.disconnect();
  });

  return (
    <div>
      <h1>Online Video Chat</h1>
      <form
        className={styles.form}
        onSubmit={(event) => {
          setIsSubmiting(true);
          handleSubmit(event).finally(() => setIsSubmiting(false));
        }}
      >
        <p>
          <label htmlFor="username">Name:</label>{" "}
          <input
            id="username"
            required
            name="username"
            placeholder="Type your username..."
          />
        </p>
        <p>
          <label htmlFor="room">Room:</label>{" "}
          <input
            id="room"
            name="room"
            placeholder="Type the room you want to join..."
          />
        </p>
        <button type="submit" disabled={isSubmiting}>
          {isSubmiting
            ? connected
              ? "Disconnecting..."
              : "Connecting..."
            : connected
            ? "Leave call"
            : "Join call"}
        </button>
      </form>

      {room && (
        <>
          <h4>Live on room {room.name}</h4>
          <p>{room.participants.size + 1} online users</p>
        </>
      )}
      <div className={styles.participants}>
        {room?.localParticipant && (
          <UserVideo participant={room.localParticipant} />
        )}
        {participants?.map((participant) => (
          <UserVideo key={participant.sid} participant={participant} />
        ))}
      </div>
    </div>
  );
}

export default App;

const MAX_PARTICIPANTS = 2;

function participantDisconnected(participant: TwilioVideo.RemoteParticipant) {
  alert(`Participant '${participant.identity}' left the room`);
}
