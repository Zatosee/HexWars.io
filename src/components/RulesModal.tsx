import React from "react";

export default function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-blue-900/90 border border-blue-800 rounded-2xl px-8 py-6 text-white max-w-lg w-full shadow-2xl relative">
        <button className="absolute top-3 right-4 text-blue-200 hover:text-white text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-3">Comment jouer ?</h2>
        <ul className="mb-2 text-sm">
          <li><b>Plaine</b> : croissance +1/tour, neutre en combat.</li>
          <li><b>Montagne</b> : défense +2, attaque -1, pas de croissance.</li>
          <li><b>Désert</b> : défense -1, pas de croissance.</li>
        </ul>
        <ul className="mb-0 text-sm">
          <li>Puissance max : 10</li>
          <li>Sélectionne une de tes tuiles puis attaque une tuile <i>adjacente</i>.</li>
          <li>Tu gagnes si l’adversaire n’a plus de tuiles.</li>
        </ul>
      </div>
    </div>
  );
}
