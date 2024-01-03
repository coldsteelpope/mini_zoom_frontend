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
        <section>
          <div className="container my-5">
            <div className="user-wrap" style={{ width: '100%', margin: '10px auto', position: 'relative'}}>
              <div>
                <img className="rounded-3" style={{ width: '100%', verticalAlign: 'middle', height: '25rem', filter: 'brightness(70%)' }} src="cafe.jpg" alt="jumbotron" />
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', transform: "translate(-50%, -50%)", textAlign: 'center'}}>
                <h1 className="text-white">Online Café에 오신걸 환영해요 :)</h1>
                <p className="text-white">따뜻한 커피와 함께 잠깐 쉬었다 가세요</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-0">
            {Object.entries(rooms).map(([key, value]) => (
              <div className="col" key={key}>
                
                <div className="card m-2 shadow-sm">
                  <a href={`/room/${key}`} style={{ textDecoration: 'none'}}>

                    <div className="card-body">
                      <h4 className="card-title mt-2 text-dark"><i class="bi bi-cup-hot"></i> {key}번 테이블</h4>
                      <div className="card-text text-secondary mt-3">
                        <i class="bi bi-people"></i> {value.users.length} 명 참여
                      </div>
                    </div>
                  </a>
                </div>

              </div>
            ))}
          </div>
        </section>
    </div>
  );
}

export default Home;