"use client";
import { crossNiche, DEMANDS, SKILLS } from "@/lib/toolkit2";
import { CopyButton, useStored } from "./ui";

export default function NicheCross() {
  const [passion, setPassion] = useStored<string>("nicho-paixao", "");
  const [skill, setSkill] = useStored<number>("nicho-habilidade", 0);
  const [demand, setDemand] = useStored<number>("nicho-demanda", 0);
  const r = crossNiche(passion, skill, demand);

  return (
    <div className="tool">
      <div className="triple p3">
        <div className="field">
          <label htmlFor="pa">1. Paixão</label>
          <input id="pa" type="text" value={passion} onChange={(e) => setPassion(e.target.value)} placeholder="Ex.: jardinagem, edição de vídeo" maxLength={60} />
          <span className="count">O assunto sobre o qual você falaria de graça.</span>
        </div>
        <div className="field">
          <label htmlFor="ha">2. Habilidade</label>
          <select id="ha" value={skill} onChange={(e) => setSkill(parseInt(e.target.value, 10))}>
            {SKILLS.map((s, i) => <option key={s} value={i}>{s}</option>)}
          </select>
          <span className="count">O que você faz bem ao comunicar.</span>
        </div>
        <div className="field">
          <label htmlFor="de">3. Demanda</label>
          <select id="de" value={demand} onChange={(e) => setDemand(parseInt(e.target.value, 10))}>
            {DEMANDS.map((s, i) => <option key={s} value={i}>{s}</option>)}
          </select>
          <span className="count">O que a pessoa procura ao assistir.</span>
        </div>
      </div>

      {!r.ok && <p className="note">{r.note}</p>}

      {r.ok && (
        <ul className="ideas" aria-live="polite">
          {r.ideas.map((i) => (
            <li key={i.title}>
              {i.main && <span className="badge">Seu cruzamento</span>}
              <h3>{i.format}</h3>
              <p><b>Título de exemplo:</b> {i.title}</p>
              <p><b>Como começar:</b> {i.hook}</p>
              <p className="count">{i.skill} + {i.demand}</p>
              <CopyButton text={i.title} label="Copiar título" />
            </li>
          ))}
        </ul>
      )}
      <p className="note">Os vídeos que mais crescem ficam onde as três coisas se encontram: você gosta, você faz bem e alguém procura. Troque a habilidade e a demanda para ver outros cruzamentos.</p>
    </div>
  );
}
