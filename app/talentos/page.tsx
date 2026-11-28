import Link from "next/link";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import TalentForm from "@/components/TalentForm";

export const metadata: Metadata = {
  title: "Faça parte · Sauim",
  description: "Estamos construindo o Sauim às claras. Se você sabe ajudar a aperfeiçoar uma ferramenta em teste, venha construir com a gente.",
};

export default function Talentos() {
  return (
    <Shell>
      <div className="tp">
        <p className="crumb"><Link href="/">← Início</Link></p>
        <h1>Estamos construindo o Sauim. Faça parte.</h1>
        <p className="lead">Não esperamos o Sauim ficar pronto para mostrar o que ele é. Toda ferramenta nasce em teste, na frente de todo mundo, e melhora com a ajuda de quem sabe fazer melhor.</p>

        <h2>Quem a gente procura</h2>
        <p>Gente que gosta de resolver problemas, tem autonomia e quer ver o próprio trabalho ao lado do nosso. Desenvolvimento de software, design, voz e áudio, redação, testes. Ainda estamos definindo o formato: pode ser um projeto pontual (freelancer) ou uma dedicação fixa em home office. Quando surgir a demanda certa para o seu perfil, entramos em contato.</p>

        <h2>Como ajudar uma ferramenta em teste</h2>
        <p>Toda ferramenta marcada como <b>beta</b> tem, no pé da página, um botão &ldquo;Quero ajudar&rdquo;. Você escolhe a sua área e abre um e-mail que já sai com o nome da ferramenta no título, no seu programa de e-mail, no Gmail ou no Outlook, ou copia o texto. Ou escolha aqui:</p>
        <TalentForm />

        <h2>O que contar no e-mail</h2>
        <ol>
          <li>Seu nome e, se quiser, o WhatsApp.</li>
          <li>Sua principal área de atuação.</li>
          <li>O formato que você busca hoje.</li>
          <li>Um link do seu trabalho (portfólio, GitHub ou LinkedIn). Vale mais do que um currículo em PDF.</li>
          <li>Em poucas linhas, como você ajudaria o Sauim a crescer.</li>
        </ol>
        <p className="note">Enviar uma mensagem não cria vínculo nem promessa de contratação. Respondemos quando houver uma demanda que combine com o seu perfil.</p>
      </div>
    </Shell>
  );
}
