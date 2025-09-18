import { useEffect, useState } from "react";
import { fetchRooms } from "./api";
import type { RoomSummary } from "../../types/typesGlobal";
import RoomView from "./roomView";
import { Button } from "../../components/ui/button";
import Poses from '../../assets/images/KoPoses.png'

export default function CoWorkingRoomsPage() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchRooms().then((data) => {
      if (isMounted) {
        setRooms(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  if (selectedRoom) {
    return <RoomView roomId={selectedRoom} />;
  }

  return (
    <div className="min-h-screen bg-powderBlue px-4 py-4">
      <div className="bg-white rounded-2xl px-8 py-10 flex items-center gap-6 mb-6 shadow">
        <img src={Poses} alt="Koala mascot" className="w-32 h-32" />
        <div>
          <h1 className="text-2xl font-bold">Co-working rooms</h1>
          <div className="text-gray-600">Work together, stay focused</div>
        </div>
      </div>
      <div className="font-semibold text-lg mb-3">Available Rooms</div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 bg-gray-200 shadow h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className={`rounded-2xl p-6 shadow flex flex-col justify-between ${room.color}`}>
              <div>
                <div className="font-bold text-xl">{room.name}</div>
                <div className="text-gray-500 mb-2">{room.description}</div>
                <div className="text-gray-600 text-sm">{room.count} {room.status}</div>
              </div>
              <Button className="mt-4" onClick={() => setSelectedRoom(room.id)}>
                Join
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}