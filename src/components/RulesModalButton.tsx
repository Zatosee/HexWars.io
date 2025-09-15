import React, { useState } from "react";

export default function RulesModalButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="bg-blue-700 text-white px-3 py-1 rounded ml-2" onClick={() => setOpen(true)}>
        Règles
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-gray-900 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">Légende & règles rapides</h3>
            <ul className="text-sm mb-2">
              <li><b>Plaine</b> : croissance +1/tour, neutre en combat.</li>
              <li><b>Montagne</b> : défense +2, attaque -1, pas de croissance.</li>
              <li><b>Désert</b> : défense -1, pas de croissance.</li>
            </ul>
            <ul className="text-sm mb-2">
              <li>Puissance max : 10</li>
              <li>Sélectionne une de tes tuiles puis attaque une tuile <i>adjacente</i>.</li>
              <li>Tu gagnes si l’adversaire n’a plus de tuiles.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
