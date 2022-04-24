import { useEffect, useRef } from "react";
import type {
  LocalParticipant,
  LocalTrack,
  RemoteParticipant,
  RemoteTrack,
} from "twilio-video";
import styles from "./styles.module.css";

interface UserVideoProps {
  participant: RemoteParticipant | LocalParticipant;
  isLocal?: boolean;
}

const UserVideo = ({ participant, isLocal }: UserVideoProps) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function attachTrack(track: RemoteTrack | LocalTrack) {
      if (videoContainerRef.current && "attach" in track) {
        videoContainerRef.current.appendChild(track.attach());
      }
    }

    function detachTrack(track: RemoteTrack | LocalTrack) {
      if ("detach" in track) {
        track.detach().forEach((element) => {
          element.remove();
        });
      }
    }

    participant.tracks.forEach((publication) => {
      const { track } = publication;
      if (track) {
        attachTrack(track);
      }
    });

    participant.on("trackSubscribed", attachTrack);
    participant.on("trackUnsubscribed", detachTrack);

    return () => {
      participant.off("trackSubscribed", attachTrack);
      participant.off("trackUnsubscribed", detachTrack);
      participant.tracks.forEach((publication) => {
        const { track } = publication;
        if (track) {
          detachTrack(track);
        }
      });
    };
  }, [participant]);

  return (
    <div className={styles.participant}>
      <div ref={videoContainerRef}></div>
      <div>
        {participant.identity}
        {isLocal && " (you)"}
      </div>
    </div>
  );
};
export default UserVideo;
