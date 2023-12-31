import React, { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const Home = () => {
  const [rooms, setRooms] = useState({});

  useEffect(() => {
    socket.emit("get_rooms");
    socket.on("get_rooms", (response) => {
      setRooms(response.rooms);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  return(
      <div>
        <h1>Coffee Chat Rooms</h1>

        
        <div className="row row-cols-3">
          {Object.entries(rooms).map(([key, value]) => (
            <div className="col" key={key}>
              <div className="card card-body shadow-sm">
                {key}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default Home;