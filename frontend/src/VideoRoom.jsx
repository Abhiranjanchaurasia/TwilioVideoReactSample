import React, { useState, useRef, useEffect } from 'react';
import Video from 'twilio-video';

const VideoRoom = ({ token, roomName, onConnected, onDisconnected, startSecondCall }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRefs = useRef({});

  const participantConnected = (participant) => {
    setParticipants(prev => [...prev, participant]);

    participant.on('trackSubscribed', track => {
      if (track.kind === 'video') {
        const videoElement = track.attach();
        remoteVideoRefs.current[participant.sid] = videoElement;
        // You might need to append to DOM here
      }
    });

    participant.on('trackUnsubscribed', track => {
      if (track.kind === 'video') {
        track.detach().forEach(element => element.remove());
      }
    });
  };

  const participantDisconnected = (participant) => {
    setParticipants(prev => prev.filter(p => p !== participant));
    delete remoteVideoRefs.current[participant.sid];
  };

  useEffect(() => {
    if (token && roomName) {
      Video.connect(token, { name: roomName }).then(room => {
        setRoom(room);
        if (onConnected) onConnected();

        // Handle local participant
        const localParticipant = room.localParticipant;
        localParticipant.videoTracks.forEach(track => {
          if (track.track && localVideoRef.current) {
            localVideoRef.current.appendChild(track.track.attach());
          }
        });

        // Handle existing participants
        room.participants.forEach(participantConnected);

        // Handle new participants
        room.on('participantConnected', participantConnected);

        // Handle participant disconnections
        room.on('participantDisconnected', participantDisconnected);

        room.on('disconnected', (room) => {
          console.log('Disconnected from room', room.state);
          setRoom(null);
          setParticipants([]);
          room.localParticipant.tracks.forEach(publication => {
          publication.track.stop();
          const attachedElements = publication.track.detach();
          attachedElements.forEach(element => element.remove());
        });
          if (onDisconnected) onDisconnected();
        });
      })
      .catch(error => {
        console.error('Failed to connect to room or get media permissions:', error);
      });
    }

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [token, roomName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEndCall = async() => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setParticipants([]);
      if (onDisconnected) onDisconnected();
    }
  };

  const toggleAudio = () => {
    if (room) {
      console.log('Toggling audio, current muted:', isAudioMuted);
      room.localParticipant.audioTracks.forEach(track => {
        console.log('Audio track:', track);
        if (isAudioMuted) {
          track.track.enable();
          console.log('Enabled audio');
        } else {
          track.track.disable();
          console.log('Disabled audio');
        }
      });
      setIsAudioMuted(!isAudioMuted);
    } else {
      console.log('No room for audio toggle');
    }
  };

  const toggleVideo = () => {
    if (room) {
      console.log('Toggling video, current off:', isVideoOff);
      room.localParticipant.videoTracks.forEach(track => {
        console.log('Video track:', track);
        if (isVideoOff) {
          track.track.enable();
          console.log('Enabled video');
        } else {
          track.track.disable();
          console.log('Disabled video');
        }
      });
      setIsVideoOff(!isVideoOff);
    } else {
      console.log('No room for video toggle');
    }
  };

  return (
    <div className="meet-container">
      <div className="video-area">
        <div className="local-video">
          <div ref={localVideoRef} className="video-element"></div>
          <div className="name">You</div>
        </div>
        {participants.length > 0 && (
          <div className="remote-videos">
            {participants.map(participant => (
              <div key={participant.sid} className="video-item">
                <div ref={el => {
                  if (el && remoteVideoRefs.current[participant.sid]) {
                    el.appendChild(remoteVideoRefs.current[participant.sid]);
                  }
                }} className="video-element"></div>
                <div className="name">{participant.identity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="controls">
        <button onClick={() => startSecondCall(room)} className="control-btn">
          ➕
        </button>
        <button onClick={toggleAudio} className="control-btn">
          {isAudioMuted ? '🔇' : '🎤'}
        </button>
        <button onClick={toggleVideo} className="control-btn">
          {isVideoOff ? '📹' : '📷'}
        </button>
        <button onClick={handleEndCall} className="control-btn end-call">
          📞
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;