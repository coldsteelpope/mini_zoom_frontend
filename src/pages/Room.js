import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { socket } from "../utils/socket";


const pc_config = {
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
}

const Video = ({ stream }) => {
    const [ isLoading, setIsLoading ] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        setIsLoading(true);
        if(ref.current)
        {
            ref.current.srcObject = stream;
        }
        setIsLoading(false);
    }, [stream]);

    if(isLoading)
    {
        return(
            <></>
        )
    }
    else
    {
        return(
            <video
                ref={ref}
                autoPlay
            ></video>
        )
    }
}

const Room = () => {
    const { roomNum } = useParams();
    // peerconnection container: 생성된 peer connection들을 관리
    const pcRef = useRef({});
    const localVideoRef = useRef(null);
    const localStreamRef = useRef();
    const [ users, setUsers ] = useState([]);

    const GetLocalStream = async () => {
        // Get Local Media Stream
        const localStream = await navigator.mediaDevices.getUserMedia({
            audio: true, video: true
        });
        localStreamRef.current = localStream;
        if(localVideoRef.current)
        {
            localVideoRef.current.srcObject = localStream;
        }
        const data = { room_num: roomNum };
        socket.emit("enter_room", data);
    }


    const GetRTCPeerConnection = (receiveSocketID) => {
        const rtcPeerConnection = new RTCPeerConnection(pc_config);
        
        // Create Ice Candidate Event
        rtcPeerConnection.onicecandidate = (event) => {
            if(event.candidate && socket)
            {
                const data = {
                    candidate: event.candidate,
                    sendSocketId: socket.id, // candidate를 보내는 socket의 id
                    receiveSocketID: receiveSocketID // candidate를 받는 socket_id
                };
                socket.emit("candidate", data);
            }
        }


        rtcPeerConnection.ontrack = (event) => {
            setUsers((oldUsers) => 
                oldUsers
                .filter((user) => user.socket_id !== receiveSocketID)
                .concat({
                    socket_id: receiveSocketID,
                    stream: event.streams[0]
                })
            );
        }

        if(localStreamRef.current)
        {
            localStreamRef.current.getTracks().forEach((track) => {
                rtcPeerConnection.addTrack(track, localStreamRef.current);
            });
        }

        return rtcPeerConnection;
    };


    useEffect(() => {
        GetLocalStream();

        socket.on("remain_users", (response) => {
            const remainUsers = response.remainUsers;
            remainUsers.forEach(async(remainUser) => {

                const rtcPeerConnection = GetRTCPeerConnection(remainUser.socket_id);

                pcRef.current = { ...pcRef.current, [remainUser.socket_id]: rtcPeerConnection };
                
                const offer = await rtcPeerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });

                await rtcPeerConnection.setLocalDescription(new RTCSessionDescription(offer));
                socket.emit("send_offer", {
                    offer: offer,
                    sendSocketId: socket.id,
                    receiveSocketId: remainUser.socket_id
                });
            });
        })

        socket.on("receive_offer", async (response) => {
            const rtcPeerConnection = GetRTCPeerConnection(response.sendSocketId);

            pcRef.current = { ...pcRef.current, [response.sendSocketId]: rtcPeerConnection };
            await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(response.offer));

            const answer = await rtcPeerConnection.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await rtcPeerConnection.setLocalDescription(new RTCSessionDescription(answer));

            socket.emit("send_answer", {
                answer: answer,
                sendSocketId: socket.id,
                receiveSocketId: response.sendSocketId
            });
        });

        socket.on("receive_answer", async (response) => {
            const { 
                answer,
                sendSocketId
            } = response;
            const pc = pcRef.current[sendSocketId];
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("user_exit", (response) => {
            pcRef.current[response.socket_id].close();
            delete pcRef.current[response.socket_id];
            setUsers((oldUsers) => oldUsers.filter((user) => user.socket_id !== response.socket_id));
        })

        socket.on("receive_candidate", async (response) => {
            const rtcPeerConnection = pcRef.current[response.sendSocketId];
            await rtcPeerConnection.addIceCandidate(new RTCIceCandidate(response.candidate));
        });
        
        return () => {
            socket.disconnect();
            users.forEach((user) => {
                pcRef.current[user.socket_id].close();
                delete pcRef.current[user.socket_id];
            });
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return(
        <div>
            <video ref={localVideoRef} autoPlay></video>
            {users.map((user, index) => {
                return(
                    <Video key={index} stream={user.stream} />
                )
            })}
        </div>
    );
}

export default Room;