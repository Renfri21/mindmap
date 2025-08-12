import { useEffect, useState } from "react";
import Map from './components/Map';

function App() {
  return (
    <div>
      <Map />
    </div>
  );
}

export default App;
// export default function App() {
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/notes")
//       .then(res => res.json())
//       .then(data => setNotes(data));
//   }, []);

//   return (
//     <div>
//       <h1>Sticky Notes</h1>
//       <ul>
//         {notes.map(note => (
//           <li key={note.id}>{note.title}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

//export default App
