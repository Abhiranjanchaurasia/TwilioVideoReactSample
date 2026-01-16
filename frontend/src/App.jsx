import { useState, useEffect } from 'react'
import './App.css'
import VideoRoom from './VideoRoom'
import { CallKitVoip } from 'callkit-voip-capacitor-plugin'
import { Capacitor } from '@capacitor/core'

function App() {
  const [identity, setIdentity] = useState('')
  const [token, setToken] = useState('')
  const [roomName, setRoomName] = useState('')
  const [callStatus, setCallStatus] = useState('idle') // idle, calling, connected
  const [pendingCall, setPendingCall] = useState(null) // {token, roomName, uuid}
  const [currentCallUUID, setCurrentCallUUID] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  useEffect(() => {
    if (Capacitor.getPlatform() === 'ios') {
      // Register CallKit
      CallKitVoip.register()

      // Listen for CallKit events
      CallKitVoip.addListener('callAnswered', async (data) => {
        console.log('Call answered:', data)
        if (pendingCall && data.callUUID === pendingCall.uuid) {
          const uniqueIdentity = `${identity}-${Date.now()}`;
          try {
            const response = await fetch(`http://192.168.1.42:3001/video/token?identity=${encodeURIComponent(uniqueIdentity)}&roomName=${encodeURIComponent(pendingCall.roomName)}`);
            const tokenData = await response.json();
            setToken(tokenData.token);
            setRoomName(pendingCall.roomName);
            setCallStatus('calling');
            setCurrentCallUUID(pendingCall.uuid);
            setPendingCall(null);
            CallKitVoip.startCall({ callUUID: pendingCall.uuid });
          } catch (error) {
            console.error('Failed to fetch token on accept:', error);
            handleAcceptCall() // fallback to old token
          }
        }
      })

      CallKitVoip.addListener('callEnded', (data) => {
        console.log('Call ended:', data)
        if (data.callUUID === currentCallUUID) {
          handleDeclineCall()
        }
      })

      CallKitVoip.addListener('callStarted', (data) => {
        console.log('Call started:', data)
      })
    }
  }, [pendingCall, currentCallUUID])

  // Move handlers above useEffect to avoid being referenced before declaration
  const handleAcceptCall = () => {
    if (pendingCall) {
      console.log('Accepting incoming call to room:', pendingCall)
      // If there's a current call, disconnect it
      if (callStatus === 'connected') {
        // The VideoRoom will handle disconnection via onDisconnected
        setCallStatus('idle')
      }
      setToken(pendingCall.token)
      setRoomName(pendingCall.roomName)
      setCallStatus('calling')
      setCurrentCallUUID(pendingCall.uuid)
      setPendingCall(null)
      if (Capacitor.getPlatform() === 'ios' && pendingCall.uuid) {
        CallKitVoip.startCall({ callUUID: pendingCall.uuid });
      }
    } else if (token && roomName) {
      setCallStatus('connected')
      // Similar to start
    }
  }

  const startSecondCall = async (room) => {
    console.log('Starting second call with identity:', identity, 'room:', roomName);
    handleDeclineCall()
    await room?.disconnect()
    setIdentity("user-3")
    setRoomName("room-3")
    await new Promise(resolve => setTimeout(resolve, 1000)) // wait a second
    await handleStartCall()
  }

  const handleDeclineCall = () => {
    if (pendingCall) {
      if (Capacitor.getPlatform() === 'ios' && pendingCall.uuid) {
        CallKitVoip.endCall({ callUUID: pendingCall.uuid })
      }
      setPendingCall(null)
    } else {
      setCallStatus('idle')
      setToken('')
      setRoomName('')
      setCurrentCallUUID(null)
      if (Capacitor.getPlatform() === 'ios' && currentCallUUID) {
        CallKitVoip.endCall({ callUUID: currentCallUUID })
      }
    }
  }

  const handleStartCall = async () => {
    console.log('Starting call with identity:', identity, 'room:', roomName);
    if (identity && roomName && !isConnecting) {
      setIsConnecting(true);
      const uniqueIdentity = `${identity}-${Date.now()}`;
      console.log('Unique identity:', uniqueIdentity);
      try {
        const response = await fetch(`http://192.168.1.42:3001/video/token?identity=${encodeURIComponent(uniqueIdentity)}&roomName=${encodeURIComponent(roomName)}`);
        const data = await response.json();
        console.log('Fetched token:', data.token ? 'yes' : 'no');
        setToken(data.token);
        setCallStatus('calling');
        console.log('Set status to calling');
        // The VideoRoom will connect when rendered
      } catch (error) {
        console.error('Failed to fetch token:', error);
        alert('Failed to get access token');
        setIsConnecting(false);
      }
    } else {
      console.log('Missing identity or roomName or already connecting');
    }
  }

  const simulateIncomingCall = async () => {
    // Simulate an incoming call with dummy data
    const uuid = 'dummy-uuid-' + Date.now()
    const uniqueCaller = `dummy-caller-${Date.now()}`;
    try {
      const response = await fetch(`http://192.168.1.42:3001/video/token?identity=${encodeURIComponent(uniqueCaller)}&roomName=room-2`);
      const data = await response.json();
      if (Capacitor.getPlatform() === 'ios') {
        CallKitVoip.showIncomingCall({
          callUUID: uuid,
          handle: 'Room Call',
          callerName: 'Incoming Call',
          hasVideo: true
        })
      }
      setPendingCall({ token: data.token, roomName: 'room-2', uuid })
    } catch (error) {
      console.error('Failed to fetch dummy token:', error);
      // Fallback to hardcoded
      setPendingCall({ token: 'dummy-token-2', roomName: 'room-2', uuid })
    }
  }

  return (
    <div className="app-container">
      <h1>Twilio Video Sample</h1>
      
      <div className="input-container">
        <input
          type="text"
          placeholder="Identity"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="button-container">
        <button onClick={handleStartCall} disabled={!identity || !roomName || callStatus !== 'idle' || isConnecting} className="button">
          {isConnecting ? 'Connecting...' : 'Start Video Call'}
        </button>
        <button onClick={simulateIncomingCall} disabled={callStatus === 'calling'} className="button">
          Simulate Incoming Call
        </button>
      </div>
      {pendingCall && (
        <div className="call-notification">
          <p>Incoming call from room: {pendingCall.roomName}</p>
          <div className="call-buttons">
            <button onClick={handleAcceptCall} className="button">Accept Incoming Call</button>
            <button onClick={handleDeclineCall} className="button">Decline Incoming Call</button>
          </div>
        </div>
      )}
      {(callStatus === 'calling' || callStatus === 'connected') && token && roomName && <VideoRoom token={token} roomName={roomName} onConnected={() => { setCallStatus('connected'); setIsConnecting(false); }} onDisconnected={() => setCallStatus('idle')} startSecondCall={startSecondCall} />}
    </div>
  )
}

export default App
