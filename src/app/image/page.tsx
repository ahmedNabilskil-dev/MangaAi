"use client";
import Frame from "@/components/bubble/Frame";
import Speech, { ROUNDED_RECT_BUBBLE_SHAPE } from "@/components/bubble/speech";
import { useCallback, useState } from "react";

export default function App() {
  const [{ w, h }, setSize] = useState({ w: 300, h: 250 });
  const [centre, setCentre] = useState({ x: 400, y: 400 });
  const [corners, setCorners] = useState([
    { x: 500, y: 600 },
    { x: 300, y: 700 },
    { x: 450, y: 800 },
    { x: 350, y: 900 },
  ]);
  const [tip, setTip] = useState({ x: 400, y: 1000 });

  const onUpdateCentre = useCallback(({ dx, dy }) => {
    setCentre(({ x, y }) => ({ x: x + dx, y: y + dy }));
  }, []);

  const onUpdateControlPoint = useCallback((index, { dx, dy }) => {
    setCorners((c) => {
      return c.map((p, i) => (i === index ? { x: p.x + dx, y: p.y + dy } : p));
    });
  }, []);

  const onUpdateTip = useCallback(({ dx, dy }) => {
    setTip(({ x, y }) => ({ x: x + dx, y: y + dy }));
  }, []);

  const onUpdateSize = useCallback(({ w, h }) => {
    setSize({ w, h });
  }, []);

  return (
    <div className="App">
      <svg
        style={{ width: 1024, height: 1280, backgroundColor: "pink" }}
        viewBox="0 0 1024 1280"
      >
        <Frame>
          <Speech
            w={w}
            h={h}
            rx={100}
            ry={100}
            c={centre}
            tail={{
              tip,
              corners,
            }}
            shape={ROUNDED_RECT_BUBBLE_SHAPE}
            text={
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus posuere neque eget lorem sodales venenatis. Fusce venenatis dolor et tristique pharetra. Nam congue in tortor ac rutrum. Aenean ut cursus tellus. Duis a mi vitae massa imperdiet aliquet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras tincidunt aliquet arcu, non aliquet neque tincidunt maximus."
            }
            onUpdateCentre={onUpdateCentre}
            onUpdateControlPoint={onUpdateControlPoint}
            onUpdateTip={onUpdateTip}
            onUpdateSize={onUpdateSize}
          />
        </Frame>
      </svg>
    </div>
  );
}
